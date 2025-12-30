const express = require('express');
const router = express.Router();
const bookingService = require('../services/bookingService');
const { validateBudget, addBudgetInfoToResponse } = require('../middleware/budgetValidation');
const authMiddleware = require('../middleware/authMiddleware');

// All booking routes require authentication
router.use(authMiddleware.protect);

/**
 * POST /api/bookings/create
 * Create a new booking and Razorpay order
 * 
 * Budget validation middleware runs first to check spending limits
 */
router.post('/create', validateBudget, async (req, res) => {
    try {
        console.log('Received Booking Request:', JSON.stringify(req.body, null, 2));

        const bookingData = {
            ...req.body,
            userId: req.user._id
        };

        const result = await bookingService.createBooking(bookingData);

        // Add budget info to response
        let response = {
            success: true,
            message: 'Booking created successfully',
            booking: result.booking,
            razorpayOrder: result.razorpayOrder
        };

        response = addBudgetInfoToResponse(req, response);

        res.status(201).json(response);
    } catch (error) {
        console.error('Create booking error:', error);
        res.status(400).json({
            success: false,
            message: error.message,
            stack: error.stack // Optional: for debugging
        });
    }
});

/**
 * POST /api/bookings/verify-payment
 * Verify Razorpay payment and update booking status
 */
router.post('/verify-payment', async (req, res) => {
    try {
        const { bookingId, ...paymentData } = req.body;

        const booking = await bookingService.verifyAndUpdatePayment(bookingId, paymentData);

        res.json({
            success: true,
            message: 'Payment verified successfully',
            booking
        });
    } catch (error) {
        console.error('Payment verification error:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

/**
 * GET /api/bookings
 * Get user's bookings with optional filters
 */
router.get('/', async (req, res) => {
    try {
        const filters = {
            status: req.query.status,
            paymentStatus: req.query.paymentStatus,
            event: req.query.eventId
        };

        const bookings = await bookingService.getUserBookings(req.user._id, filters);

        res.json({
            success: true,
            count: bookings.length,
            bookings
        });
    } catch (error) {
        console.error('Get bookings error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

/**
 * GET /api/bookings/:id
 * Get specific booking details
 */
router.get('/:id', async (req, res) => {
    try {
        const booking = await Booking.findOne({
            _id: req.params.id,
            user: req.user._id
        }).populate('vendor event');

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        res.json({
            success: true,
            booking
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

/**
 * GET /api/bookings/vendor/list
 * Get bookings for the current vendor
 */
router.get('/vendor/list', async (req, res) => {
    try {
        const bookings = await bookingService.getVendorBookings(req.user._id);

        res.json({
            success: true,
            count: bookings.length,
            bookings
        });
    } catch (error) {
        console.error('Get vendor bookings error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

/**
 * PATCH /api/bookings/:id/vendor-progress
 * Update vendor service progress (vendor-only)
 */
router.patch('/:id/vendor-progress', async (req, res) => {
    try {
        if (req.user.role !== 'vendor') {
            return res.status(403).json({
                success: false,
                message: 'Only vendors can update progress'
            });
        }

        const { status, note } = req.body;
        const booking = await bookingService.updateVendorProgress(
            req.params.id,
            req.user._id,
            status,
            note
        );

        res.json({
            success: true,
            message: 'Progress updated successfully',
            booking
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
