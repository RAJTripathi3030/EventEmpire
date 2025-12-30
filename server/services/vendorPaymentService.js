const Payment = require('../models/Payment');
const Booking = require('../models/Booking');

// Create a new payment record
const createPayment = async (bookingId, paymentData, userId) => {
    const booking = await Booking.findById(bookingId).populate('vendor user');
    if (!booking) throw new Error('Booking not found');
    if (booking.user._id.toString() !== userId.toString()) {
        throw new Error('Not authorized to make payment for this booking');
    }

    // Create payment record
    const payment = await Payment.create({
        booking: bookingId,
        user: userId,
        vendor: booking.vendor._id,
        amount: paymentData.amount,
        paymentType: paymentData.paymentType,
        paymentMethod: paymentData.paymentMethod || 'online',
        status: paymentData.status || 'completed',
        transactionId: paymentData.transactionId,
        notes: paymentData.notes
    });

    // Update booking's totalPaid
    booking.totalPaid = (booking.totalPaid || 0) + paymentData.amount;

    // Update payment status
    if (booking.totalPaid >= booking.totalAmount) {
        booking.paymentStatus = 'paid';
    } else if (booking.totalPaid > 0) {
        booking.paymentStatus = 'partially_paid';
    }

    await booking.save();

    return { payment, booking };
};

// Get all payments for a booking
const getPaymentsByBooking = async (bookingId, userId) => {
    const booking = await Booking.findById(bookingId);
    if (!booking) throw new Error('Booking not found');

    // Check if user is either the booking owner or the vendor
    const isAuthorized = booking.user.toString() === userId.toString() ||
        booking.vendor.toString() === userId.toString();
    if (!isAuthorized) throw new Error('Not authorized');

    const payments = await Payment.find({ booking: bookingId })
        .populate('user', 'name email')
        .populate('vendor', 'businessName')
        .sort({ createdAt: -1 });

    return payments;
};

// Get all payments made by a user
const getUserPayments = async (userId) => {
    const payments = await Payment.find({ user: userId })
        .populate('vendor', 'businessName email')
        .populate('booking', 'serviceType serviceDate totalAmount')
        .sort({ createdAt: -1 });

    return payments;
};

// Get all payments received by a vendor
const getVendorPayments = async (vendorId) => {
    const payments = await Payment.find({ vendor: vendorId })
        .populate('user', 'name email')
        .populate('booking', 'serviceType serviceDate totalAmount')
        .sort({ createdAt: -1 });

    return payments;
};

// Update payment status
const updatePaymentStatus = async (paymentId, status, userId) => {
    const payment = await Payment.findById(paymentId).populate('booking');
    if (!payment) throw new Error('Payment not found');

    // Only the user who made the payment can update it
    if (payment.user.toString() !== userId.toString()) {
        throw new Error('Not authorized');
    }

    payment.status = status;
    await payment.save();

    return payment;
};

// Update work progress (vendor only)
const updateWorkProgress = async (bookingId, progress, vendorId) => {
    const booking = await Booking.findById(bookingId).populate('vendor');
    if (!booking) throw new Error('Booking not found');

    // Check if the vendor owns this booking
    if (booking.vendor._id.toString() !== vendorId.toString()) {
        throw new Error('Not authorized');
    }

    booking.workProgress = progress;

    // Auto-update vendorProgress based on workProgress
    if (progress === 0) {
        booking.vendorProgress = 'not_started';
    } else if (progress === 100) {
        booking.vendorProgress = 'completed';
    } else if (progress > 0) {
        booking.vendorProgress = 'in_progress';
    }

    await booking.save();

    return booking;
};

module.exports = {
    createPayment,
    getPaymentsByBooking,
    getUserPayments,
    getVendorPayments,
    updatePaymentStatus,
    updateWorkProgress
};
