const express = require('express');
const router = express.Router();
const vendorService = require('../services/vendorService');
const { protect, authorize } = require('../middleware/roleMiddleware');
const authMiddleware = require('../middleware/authMiddleware');

// ============ PUBLIC ROUTES (specific paths first) ============

// Advanced search with all filters (location, price, date, rating)
router.get('/search/advanced', async (req, res) => {
    try {
        const filters = {
            city: req.query.city,
            state: req.query.state,
            maxPrice: req.query.maxPrice,
            minPrice: req.query.minPrice,
            date: req.query.date,
            serviceType: req.query.serviceType,
            minRating: req.query.minRating,
            latitude: req.query.latitude,
            longitude: req.query.longitude,
            maxDistance: req.query.maxDistance,
            sortBy: req.query.sortBy,
            page: req.query.page,
            limit: req.query.limit
        };

        const result = await vendorService.advancedSearch(filters);

        res.json({
            success: true,
            ...result
        });
    } catch (error) {
        console.error('Advanced search error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Public route to search vendors (basic search)
router.get('/search', async (req, res) => {
    try {
        const result = await vendorService.searchVendors(req.query);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ============ PROTECTED ROUTES (specific paths) ============

// Get vendor's own profile (protected)
router.get('/profile', authMiddleware.protect, async (req, res) => {
    try {
        const profile = await vendorService.getVendorProfile(req.user._id);
        res.json(profile);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create or update vendor profile (protected)
router.post('/profile', authMiddleware.protect, async (req, res) => {
    // Ensure user is a vendor
    if (req.user.role !== 'vendor') {
        return res.status(403).json({ message: 'Only vendors can create a profile' });
    }
    try {
        const profile = await vendorService.createOrUpdateProfile(req.body, req.user._id);
        res.json(profile);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Add portfolio image (protected)
router.post('/portfolio', authMiddleware.protect, async (req, res) => {
    if (req.user.role !== 'vendor') {
        return res.status(403).json({ message: 'Only vendors can update portfolio' });
    }
    try {
        const profile = await vendorService.addPortfolioImage(req.user._id, req.body.imageUrl);
        res.json(profile);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// ============ PUBLIC PARAMETERIZED ROUTE (MUST BE LAST) ============

// Public route to get a single vendor by ID
router.get('/:id', async (req, res) => {
    try {
        const vendor = await vendorService.getVendorById(req.params.id);
        if (!vendor) {
            return res.status(404).json({ message: 'Vendor not found' });
        }
        res.json(vendor);
    } catch (error) {
        console.error('Get vendor by ID error:', error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
