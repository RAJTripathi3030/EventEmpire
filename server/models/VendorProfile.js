const mongoose = require('mongoose');

const vendorProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
    },
    serviceType: {
        type: String,
        required: true, // e.g., Catering, Venue, Photography, DJ, Decoration
    },
    // Enhanced location with GeoJSON for proximity-based search
    location: {
        address: {
            type: String,
            required: true,
        },
        city: {
            type: String,
            required: true,
        },
        state: {
            type: String,
            required: true,
        },
        // GeoJSON Point for MongoDB geospatial queries
        coordinates: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point'
            },
            coordinates: {
                type: [Number], // [longitude, latitude]
                index: '2dsphere' // Enable geo-spatial queries
            }
        }
    },
    // Pricing tiers for different packages
    pricingTiers: [{
        packageName: {
            type: String,
            required: true, // e.g., "Basic", "Premium", "Deluxe"
        },
        price: {
            type: Number,
            required: true,
        },
        currency: {
            type: String,
            default: 'INR'
        },
        description: {
            type: String,
        },
        inclusions: [String] // e.g., ["50 guests", "2 hours service"]
    }],
    // Date-based availability calendar
    availabilityDates: [{
        date: {
            type: Date,
            required: true
        },
        status: {
            type: String,
            enum: ['available', 'booked', 'blocked'],
            default: 'available'
        }
    }],
    portfolio: [
        {
            type: String, // URL of the image
        }
    ],
    description: {
        type: String,
    },
    // Overall availability status (quick filter)
    isActive: {
        type: Boolean,
        default: true,
    },
    // Calculated average rating (updated when reviews change)
    averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    totalReviews: {
        type: Number,
        default: 0
    },
    reviews: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            booking: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Booking' // Link to verified booking
            },
            rating: {
                type: Number,
                required: true,
                min: 1,
                max: 5
            },
            comment: {
                type: String,
            },
            isVerifiedBooking: {
                type: Boolean,
                default: false // Only true if linked to completed booking
            },
            date: {
                type: Date,
                default: Date.now
            },
        },
    ],
    // Business details
    businessName: {
        type: String,
    },
    contactPhone: {
        type: String,
    },
    yearsOfExperience: {
        type: Number,
        default: 0
    },
    // Response metrics
    responseTime: {
        type: String, // e.g., "Within 1 hour", "Same day"
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Index for text search on service type and location
vendorProfileSchema.index({ serviceType: 'text', 'location.city': 'text', description: 'text' });

// Update averageRating and totalReviews when reviews array changes
vendorProfileSchema.pre('save', function (next) {
    if (this.isModified('reviews')) {
        const validReviews = this.reviews.filter(r => r.rating);
        this.totalReviews = validReviews.length;
        if (this.totalReviews > 0) {
            this.averageRating = validReviews.reduce((sum, r) => sum + r.rating, 0) / this.totalReviews;
        } else {
            this.averageRating = 0;
        }
    }
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('VendorProfile', vendorProfileSchema);
