const VendorProfile = require('../models/VendorProfile');

const createOrUpdateProfile = async (profileData, userId) => {
    let profile = await VendorProfile.findOne({ user: userId });

    if (profile) {
        profile = await VendorProfile.findOneAndUpdate(
            { user: userId },
            profileData,
            { new: true }
        );
    } else {
        profile = await VendorProfile.create({
            ...profileData,
            user: userId,
        });
    }
    return profile;
};

const getVendorProfile = async (userId) => {
    return await VendorProfile.findOne({ user: userId });
};

/**
 * Basic search - Simple regex-based filtering
 * Used for quick searches without complex filters
 */
const searchVendors = async (filters) => {
    const query = {};

    // Location search now uses city field since location is an object
    if (filters.location) {
        query['location.city'] = { $regex: filters.location, $options: 'i' };
    }

    if (filters.serviceType) {
        query.serviceType = { $regex: filters.serviceType, $options: 'i' };
    }

    const vendors = await VendorProfile.find(query).populate('user', 'name email');
    return vendors;
};

/**
 * Advanced Search with MongoDB Aggregation Pipeline
 * 
 * WHY AGGREGATION?
 * - Need to calculate average rating from nested reviews array
 * - Complex multi-field filtering (location, price, availability, rating)
 * - Sorting by multiple criteria (rating DESC, price ASC)
 * - Future-proof for analytics (vendor popularity scoring, etc.)
 * 
 * @param {Object} filters
 * @param {string} filters.city - City name for location filtering
 * @param {number} filters.maxPrice - Maximum price ceiling
 * @param {Date} filters.date - Requested service date
 * @param {string} filters.serviceType - Type of service
 * @param {number} filters.minRating - Minimum average rating
 * @param {number} filters.latitude - User's latitude for proximity search
 * @param {number} filters.longitude - User's longitude for proximity search
 * @param {number} filters.maxDistance - Maximum distance in meters (for geo search)
 * @param {string} filters.sortBy - Sort field (rating, price, distance)
 * @param {number} filters.page - Page number for pagination
 * @param {number} filters.limit - Results per page
 */
const advancedSearch = async (filters) => {
    const {
        city,
        state,
        maxPrice,
        minPrice,
        date,
        serviceType,
        minRating = 0,
        latitude,
        longitude,
        maxDistance = 50000, // 50km default
        sortBy = 'rating', // rating, price, distance
        page = 1,
        limit = 20
    } = filters;

    const pipeline = [];

    // STAGE 1: Initial Match - Filter by active vendors and basic criteria
    const matchStage = {
        isActive: true
    };

    if (serviceType) {
        matchStage.serviceType = { $regex: serviceType, $options: 'i' };
    }

    if (city) {
        matchStage['location.city'] = { $regex: city, $options: 'i' };
    }

    if (state) {
        matchStage['location.state'] = { $regex: state, $options: 'i' };
    }

    pipeline.push({ $match: matchStage });

    // STAGE 2: Proximity Search (if coordinates provided)
    // WHY SEPARATE STAGE? GeoNear must be the first stage in aggregation
    // So we use $geoNear only if coordinates are provided, otherwise skip
    if (latitude && longitude) {
        // Insert geoNear at the beginning
        pipeline.unshift({
            $geoNear: {
                near: {
                    type: 'Point',
                    coordinates: [parseFloat(longitude), parseFloat(latitude)]
                },
                distanceField: 'distance',
                maxDistance: maxDistance,
                spherical: true,
                key: 'location.coordinates'
            }
        });
    }

    // STAGE 3: Check Availability for Specific Date
    // WHY $addFields? We need to check if requested date exists in availabilityDates array
    if (date) {
        const requestedDate = new Date(date);
        requestedDate.setHours(0, 0, 0, 0); // Normalize to start of day

        pipeline.push({
            $addFields: {
                // Check if any availability date matches the requested date with 'available' status
                isAvailableOnDate: {
                    $anyElementTrue: {
                        $map: {
                            input: '$availabilityDates',
                            as: 'avail',
                            in: {
                                $and: [
                                    {
                                        $eq: [{ $dateToString: { date: '$$avail.date', format: '%Y-%m-%d' } },
                                        { $dateToString: { date: requestedDate, format: '%Y-%m-%d' } }]
                                    },
                                    { $eq: ['$$avail.status', 'available'] }
                                ]
                            }
                        }
                    }
                }
            }
        });

        // Filter only available vendors
        pipeline.push({
            $match: { isAvailableOnDate: true }
        });
    }

    // STAGE 4: Calculate Minimum Price from Pricing Tiers
    // WHY? We need to check against the lowest available package price
    pipeline.push({
        $addFields: {
            minPackagePrice: { $min: '$pricingTiers.price' },
            maxPackagePrice: { $max: '$pricingTiers.price' }
        }
    });

    // STAGE 5: Price Range Filtering
    const priceMatch = {};
    if (maxPrice) {
        priceMatch.minPackagePrice = { $lte: parseFloat(maxPrice) };
    }
    if (minPrice) {
        priceMatch.minPackagePrice = { $gte: parseFloat(minPrice) };
    }
    if (Object.keys(priceMatch).length > 0) {
        pipeline.push({ $match: priceMatch });
    }

    // STAGE 6: Rating Filter
    // WHY averageRating field? Pre-calculated in schema for performance
    if (minRating > 0) {
        pipeline.push({
            $match: { averageRating: { $gte: parseFloat(minRating) } }
        });
    }

    // STAGE 7: Sorting
    // WHY mult i-field sort? Primary by rating, secondary by price, tertiary by reviews
    let sortStage = {};
    switch (sortBy) {
        case 'price_low':
            sortStage = { minPackagePrice: 1, averageRating: -1 };
            break;
        case 'price_high':
            sortStage = { minPackagePrice: -1, averageRating: -1 };
            break;
        case 'distance':
            sortStage = latitude && longitude ? { distance: 1 } : { averageRating: -1 };
            break;
        case 'reviews':
            sortStage = { totalReviews: -1, averageRating: -1 };
            break;
        case 'rating':
        default:
            sortStage = { averageRating: -1, totalReviews: -1, minPackagePrice: 1 };
    }
    pipeline.push({ $sort: sortStage });

    // STAGE 8: Pagination
    const skip = (page - 1) * limit;
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: parseInt(limit) });

    // STAGE 9: Projection - Select only needed fields to reduce data transfer
    pipeline.push({
        $project: {
            'reviews': 0, // Exclude full reviews array (use separate endpoint for reviews)
            'availabilityDates': 0, // Exclude full calendar (use separate endpoint)
            'user.password': 0
        }
    });

    // STAGE 10: Populate user details
    pipeline.push({
        $lookup: {
            from: 'users',
            localField: 'user',
            foreignField: '_id',
            as: 'userDetails'
        }
    });

    pipeline.push({
        $unwind: {
            path: '$userDetails',
            preserveNullAndEmptyArrays: true
        }
    });

    // Execute aggregation
    const vendors = await VendorProfile.aggregate(pipeline);

    // Get total count for pagination (run same pipeline without skip/limit)
    const countPipeline = pipeline.slice(0, -3); // Remove skip, limit, project stages
    countPipeline.push({ $count: 'total' });
    const countResult = await VendorProfile.aggregate(countPipeline);
    const total = countResult.length > 0 ? countResult[0].total : 0;

    return {
        vendors,
        pagination: {
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalResults: total,
            limit
        }
    };
};

const addPortfolioImage = async (userId, imageUrl) => {
    const profile = await VendorProfile.findOne({ user: userId });
    if (!profile) {
        throw new Error('Vendor profile not found');
    }
    profile.portfolio.push(imageUrl);
    await profile.save();
    return profile;
};

/**
 * Add a review to vendor profile
 * WHY separate function? Reviews affect averageRating calculation
 * which is handled by pre-save hook
 */
const addReview = async (vendorId, reviewData) => {
    const vendor = await VendorProfile.findById(vendorId);
    if (!vendor) {
        throw new Error('Vendor not found');
    }

    vendor.reviews.push(reviewData);
    await vendor.save(); // Triggers pre-save hook to recalculate averageRating

    return vendor;
};

/**
 * Get vendor availability for a date range
 * Useful for calendar view in frontend
 */
const getAvailability = async (vendorId, startDate, endDate) => {
    const vendor = await VendorProfile.findById(vendorId, 'availabilityDates');
    if (!vendor) {
        throw new Error('Vendor not found');
    }

    const filtered = vendor.availabilityDates.filter(avail => {
        const date = new Date(avail.date);
        return date >= new Date(startDate) && date <= new Date(endDate);
    });

    return filtered;
};

/**
 * Get a single vendor by ID
 * Used for vendor booking page to display specific vendor details
 */
const getVendorById = async (vendorId) => {
    const vendor = await VendorProfile.findById(vendorId).populate('user', 'name email');
    return vendor;
};

module.exports = {
    createOrUpdateProfile,
    getVendorProfile,
    searchVendors,
    advancedSearch,
    addPortfolioImage,
    addReview,
    getAvailability,
    getVendorById
};
