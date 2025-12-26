const mongoose = require('mongoose');
const dotenv = require('dotenv');
const VendorProfile = require('./models/VendorProfile');
const User = require('./models/User');

dotenv.config();

// Connection to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected for seeding...');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

// Sample vendor data with realistic Indian event services
const generateVendorData = () => {
    const services = ['Catering', 'Photography', 'Venue', 'DJ & Music', 'Decoration', 'Makeup Artist'];
    const cities = [
        { name: 'Mumbai', state: 'Maharashtra', coords: [72.8777, 19.0760] },
        { name: 'Delhi', state: 'Delhi', coords: [77.1025, 28.7041] },
        { name: 'Bangalore', state: 'Karnataka', coords: [77.5946, 12.9716] },
        { name: 'Pune', state: 'Maharashtra', coords: [73.8567, 18.5204] },
        { name: 'Hyderabad', state: 'Telangana', coords: [78.4867, 17.3850] },
        { name: 'Chennai', state: 'Tamil Nadu', coords: [80.2707, 13.0827] },
        { name: 'Kolkata', state: 'West Bengal', coords: [88.3639, 22.5726] },
        { name: 'Ahmedabad', state: 'Gujarat', coords: [72.5714, 23.0225] },
    ];

    const vendors = [];

    services.forEach((service, serviceIndex) => {
        cities.slice(0, Math.ceil(cities.length / 2)).forEach((city, cityIndex) => {
            // Create 2 vendors per service per city (varied pricing)
            [0, 1].forEach(priceVariant => {
                const isPremium = priceVariant === 1;
                const vendor = {
                    serviceType: service,
                    location: {
                        address: `${Math.floor(Math.random() * 500) + 1}, ${service} Street, ${city.name}`,
                        city: city.name,
                        state: city.state,
                        coordinates: {
                            type: 'Point',
                            coordinates: [
                                city.coords[0] + (Math.random() - 0.5) * 0.1, // Slight variation
                                city.coords[1] + (Math.random() - 0.5) * 0.1
                            ]
                        }
                    },
                    pricingTiers: generatePricingTiers(service, isPremium),
                    availabilityDates: generateAvailabilityDates(),
                    portfolio: generatePortfolioUrls(service),
                    description: `Professional ${service.toLowerCase()} service in ${city.name}. ${isPremium ? 'Premium quality with years of experience.' : 'Budget-friendly options available.'} Specializing in weddings, corporate events, and private parties.`,
                    isActive: Math.random() > 0.1, // 90% active
                    averageRating: parseFloat((3.5 + Math.random() * 1.5).toFixed(1)), // 3.5-5.0
                    totalReviews: Math.floor(Math.random() * 50) + 5, // 5-55 reviews
                    reviews: generateReviews(),
                    businessName: `${city.name} ${service} ${isPremium ? 'Elite' : 'Express'}`,
                    contactPhone: `+91-${Math.floor(Math.random() * 9000000000) + 1000000000}`,
                    yearsOfExperience: Math.floor(Math.random() * 15) + 2, // 2-17 years
                    responseTime: isPremium ? 'Within 1 hour' : 'Within 4 hours',
                };
                vendors.push(vendor);
            });
        });
    });

    return vendors;
};

// Generate pricing tiers based on service type
const generatePricingTiers = (service, isPremium) => {
    const basePrice = {
        'Catering': isPremium ? 800 : 400,
        'Photography': isPremium ? 40000 : 20000,
        'Venue': isPremium ? 100000 : 50000,
        'DJ & Music': isPremium ? 30000 : 15000,
        'Decoration': isPremium ? 50000 : 25000,
        'Makeup Artist': isPremium ? 20000 : 10000,
    };

    const tiers = [
        {
            packageName: 'Basic',
            price: basePrice[service],
            currency: 'INR',
            description: 'Essential package for small gatherings',
            inclusions: getInclusions(service, 'basic')
        },
        {
            packageName: 'Standard',
            price: basePrice[service] * 1.8,
            currency: 'INR',
            description: 'Popular choice for medium-sized events',
            inclusions: getInclusions(service, 'standard')
        },
        {
            packageName: 'Premium',
            price: basePrice[service] * 3,
            currency: 'INR',
            description: 'Luxury package with all amenities',
            inclusions: getInclusions(service, 'premium')
        }
    ];

    return tiers;
};

// Service-specific inclusions
const getInclusions = (service, tier) => {
    const inclusions = {
        'Catering': {
            basic: ['3 Veg Dishes', '1 Non-Veg Dish', 'Rice & Roti', 'Serves 50 guests'],
            standard: ['5 Veg Dishes', '2 Non-Veg Dishes', 'Live Counters', 'Desserts', 'Serves 100 guests'],
            premium: ['7 Veg Dishes', '3 Non-Veg Dishes', 'Live Counters', 'Premium Desserts', 'Beverages', 'Serves 200 guests']
        },
        'Photography': {
            basic: ['4 hours coverage', '200 edited photos', '1 photographer'],
            standard: ['6 hours coverage', '400 edited photos', '1 photographer + 1 videographer', 'Drone shots'],
            premium: ['Full day coverage', 'Unlimited photos', '2 photographers + 2 videographers', 'Drone + Crane shots', 'Same-day edit']
        },
        'Venue': {
            basic: ['Capacity: 100 guests', 'Basic lighting', 'Parking', '4 hours'],
            standard: ['Capacity: 250 guests', 'Premium lighting', 'AC/Heating', 'Parking', '6 hours'],
            premium: ['Capacity: 500 guests', 'Full-day access', 'Premium decor', 'AC/Heating', 'Valet parking', 'Bridal suite']
        },
        'DJ & Music': {
            basic: ['DJ + Sound system', '4 hours', 'Basic lighting'],
            standard: ['DJ + Sound system', '6 hours', 'LED lights', 'Fog machine'],
            premium: ['DJ + Live Band', 'Full night', 'Premium sound', 'Laser + LED lights', 'Dance floor']
        },
        'Decoration': {
            basic: ['Stage decoration', 'Entrance decor', 'Basic flowers'],
            standard: ['Stage + Hall decoration', 'Entrance arch', 'Premium flowers', 'Lighting'],
            premium: ['Full venue transformation', 'Themed decor', 'Imported flowers', 'LED walls', 'Ceiling draping']
        },
        'Makeup Artist': {
            basic: ['Bridal makeup', 'Hair styling'],
            standard: ['Bridal + 2 family members', 'Hair + Saree draping', 'Trial session'],
            premium: ['Bridal + 5 family members', 'HD Airbrush makeup', 'Multiple look changes', '2 trials', 'Touch-ups']
        }
    };

    return inclusions[service][tier];
};

// Generate availability dates (next 60 days with random blocks)
const generateAvailabilityDates = () => {
    const dates = [];
    const today = new Date();

    for (let i = 0; i < 60; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);

        // 70% available, 20% booked, 10% blocked
        const random = Math.random();
        let status = 'available';
        if (random > 0.8) status = 'booked';
        else if (random > 0.7) status = 'blocked';

        dates.push({
            date: date,
            status: status
        });
    }

    return dates;
};

// Generate portfolio image URLs (placeholder)
const generatePortfolioUrls = (service) => {
    const count = Math.floor(Math.random() * 8) + 3; // 3-10 images
    return Array(count).fill(null).map((_, i) =>
        `https://images.unsplash.com/photo-${1500000000000 + i}?q=80&w=800&auto=format&fit=crop&service=${service.replace(/\s/g, '')}`
    );
};

// Generate sample reviews
const generateReviews = () => {
    const reviewCount = Math.floor(Math.random() * 5) + 2; // 2-6 sample reviews
    const comments = [
        'Excellent service! Highly recommended.',
        'Amazing work, very professional team.',
        'Good value for money.',
        'Decent service but room for improvement.',
        'Outstanding quality and timely delivery.',
        'Very happy with the results!',
    ];

    return Array(reviewCount).fill(null).map(() => ({
        rating: Math.floor(Math.random() * 2) + 4, // 4-5 stars
        comment: comments[Math.floor(Math.random() * comments.length)],
        isVerifiedBooking: Math.random() > 0.3, // 70% verified
        date: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000) // Within last 90 days
    }));
};

// Seed function
const seedVendors = async () => {
    try {
        await connectDB();

        // Clear existing vendor profiles
        console.log('Clearing existing vendor profiles...');
        await VendorProfile.deleteMany({});

        // Create dummy vendor users first (if needed for user references)
        console.log('Generating vendor data...');
        const vendorData = generateVendorData();

        // Create vendor users
        console.log('Creating vendor user accounts...');
        const vendorUsers = await Promise.all(
            vendorData.map(async (vendor, index) => {
                const user = await User.create({
                    name: vendor.businessName,
                    email: `vendor${index + 1}@eventempire.com`,
                    password: 'vendor123', // Will be hashed by User model pre-save hook
                    role: 'vendor',
                    isVerified: true
                });
                return user;
            })
        );

        // Link vendor profiles to users
        console.log('Creating vendor profiles...');
        const vendorProfiles = vendorData.map((vendor, index) => ({
            ...vendor,
            user: vendorUsers[index]._id
        }));

        const createdVendors = await VendorProfile.insertMany(vendorProfiles);

        console.log(`\n✅ Successfully seeded ${createdVendors.length} vendors!`);
        console.log('\nVendor Distribution:');

        const serviceTypes = [...new Set(createdVendors.map(v => v.serviceType))];
        serviceTypes.forEach(type => {
            const count = createdVendors.filter(v => v.serviceType === type).length;
            console.log(`   - ${type}: ${count} vendors`);
        });

        console.log('\nSample vendor credentials (for testing):');
        console.log('   Email: vendor1@eventempire.com');
        console.log('   Password: vendor123');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding vendors:', error);
        process.exit(1);
    }
};

// Run the seed script
seedVendors();
