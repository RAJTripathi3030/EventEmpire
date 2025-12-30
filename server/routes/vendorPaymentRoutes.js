const express = require('express');
const router = express.Router();
const vendorPaymentService = require('../services/vendorPaymentService');
const { protect } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

// Create a payment for a booking
router.post('/:bookingId', async (req, res) => {
    try {
        const result = await vendorPaymentService.createPayment(
            req.params.bookingId,
            req.body,
            req.user._id
        );
        res.status(201).json(result);
    } catch (error) {
        console.error('Create payment error:', error);
        res.status(400).json({ message: error.message });
    }
});

// Get all payments for a specific booking
router.get('/booking/:bookingId', async (req, res) => {
    try {
        const payments = await vendorPaymentService.getPaymentsByBooking(
            req.params.bookingId,
            req.user._id
        );
        res.json(payments);
    } catch (error) {
        console.error('Get booking payments error:', error);
        res.status(400).json({ message: error.message });
    }
});

// Get all payments made by the current user
router.get('/user/history', async (req, res) => {
    try {
        const payments = await vendorPaymentService.getUserPayments(req.user._id);
        res.json(payments);
    } catch (error) {
        console.error('Get user payments error:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get all payments received by vendor (requires vendor profile)
router.get('/vendor/history', async (req, res) => {
    try {
        // Get vendor profile ID from user
        const VendorProfile = require('../models/VendorProfile');
        const vendorProfile = await VendorProfile.findOne({ user: req.user._id });

        if (!vendorProfile) {
            return res.status(404).json({ message: 'Vendor profile not found' });
        }

        const payments = await vendorPaymentService.getVendorPayments(vendorProfile._id);
        res.json(payments);
    } catch (error) {
        console.error('Get vendor payments error:', error);
        res.status(500).json({ message: error.message });
    }
});

// Update payment status
router.put('/:paymentId/status', async (req, res) => {
    try {
        const payment = await vendorPaymentService.updatePaymentStatus(
            req.params.paymentId,
            req.body.status,
            req.user._id
        );
        res.json(payment);
    } catch (error) {
        console.error('Update payment status error:', error);
        res.status(400).json({ message: error.message });
    }
});

// Update work progress (vendor only)
router.put('/booking/:bookingId/progress', async (req, res) => {
    try {
        // Get vendor profile ID from user
        const VendorProfile = require('../models/VendorProfile');
        const vendorProfile = await VendorProfile.findOne({ user: req.user._id });

        if (!vendorProfile) {
            return res.status(403).json({ message: 'Only vendors can update work progress' });
        }

        const booking = await vendorPaymentService.updateWorkProgress(
            req.params.bookingId,
            req.body.progress,
            vendorProfile._id
        );
        res.json(booking);
    } catch (error) {
        console.error('Update work progress error:', error);
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;
