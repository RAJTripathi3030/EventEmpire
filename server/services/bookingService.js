const Booking = require('../models/Booking');
const VendorProfile = require('../models/VendorProfile');
const paymentService = require('./paymentService');
const mongoose = require('mongoose');

/**
 * Booking Service - Handles booking creation and management
 * Separated from payment logic for modularity
 */

/**
 * Create a new booking
 * 
 * FLOW:
 * 1. Validate vendor exists and is available
 * 2. Calculate total amount (base + tax - discount)
 * 3. Create Razorpay order
 * 4. Create booking with "pending" payment status
 * 5. Return booking + Razorpay order_id for frontend checkout
 * 
 * @param {Object} bookingData - Booking details (user, vendor, date, package, etc.)
 * @returns {Promise<Object>} Created booking + Razorpay order details
 */
const createBooking = async (bookingData) => {
    let {
        userId,
        vendorId,
        eventId,
        serviceDate,
        selectedPackage,
        specialRequests,
        numberOfGuests,
        venue
    } = bookingData;

    // Sanitize Event ID
    if (!eventId || eventId === '' || !mongoose.Types.ObjectId.isValid(eventId)) {
        if (eventId) console.warn(`Invalid Event ID: '${eventId}'. Booking will proceed without event link.`);
        eventId = undefined;
    }

    // Validate vendor exists
    const vendor = await VendorProfile.findById(vendorId);
    if (!vendor) {
        console.error(`Vendor not found for ID: ${vendorId}`);
        throw new Error('Vendor not found');
    }
    console.log(`Found vendor: ${vendor.businessName} (${vendor._id})`);

    // Check if vendor is explicitly unavailable or booked
    const dateRecord = vendor.availabilityDates.find(avail => {
        const availDate = new Date(avail.date).toDateString();
        const requestedDate = new Date(serviceDate).toDateString();
        return availDate === requestedDate;
    });

    if (dateRecord && (dateRecord.status === 'booked' || dateRecord.status === 'unavailable')) {
        console.error(`Vendor unavailable due to status: ${dateRecord.status} on date ${dateRecord.date}`);
        throw new Error('Vendor is not available on this date');
    }
    console.log('Vendor availability check passed (Implicit or Available)');
    // If no record found, assume available (Implicit Availability)

    // Calculate amounts
    const baseAmount = selectedPackage.price;
    const taxAmount = baseAmount * 0.18; // 18% GST
    const discountAmount = bookingData.discountAmount || 0;
    const totalAmount = baseAmount + taxAmount - discountAmount;

    // Create booking record
    const booking = await Booking.create({
        user: userId,
        vendor: vendorId,
        event: eventId,
        serviceDate,
        serviceType: vendor.serviceType,
        selectedPackage,
        baseAmount,
        taxAmount,
        discountAmount,
        totalAmount,
        specialRequests,
        numberOfGuests,
        venue,
        paymentStatus: 'pending',
        bookingStatus: 'pending'
    });

    // Create Razorpay order
    const razorpayOrder = await paymentService.createRazorpayOrder(
        totalAmount,
        'INR',
        `booking_${booking._id}`,
        {
            bookingId: booking._id.toString(),
            userId: userId.toString(),
            vendorId: vendorId.toString(),
            serviceType: vendor.serviceType
        }
    );

    // Store Razorpay order ID in payment history
    booking.paymentHistory.push({
        amount: totalAmount,
        razorpayOrderId: razorpayOrder.orderId,
        status: 'created',
        timestamp: new Date()
    });
    await booking.save();

    return {
        booking,
        razorpayOrder
    };
};

/**
 * Verify payment and update booking status
 */
const verifyAndUpdatePayment = async (bookingId, paymentData) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = paymentData;

    // Verify signature
    const isValid = paymentService.verifyPaymentSignature(
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
    );

    if (!isValid) {
        throw new Error('Invalid payment signature');
    }

    // Fetch payment details from Razorpay
    const paymentDetails = await paymentService.fetchPaymentDetails(razorpay_payment_id);

    // Update booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
        throw new Error('Booking not found');
    }

    // Update payment status
    booking.paymentStatus = 'paid';
    booking.bookingStatus = 'confirmed';
    booking.confirmedAt = new Date();

    // Add to payment history
    booking.paymentHistory.push({
        amount: paymentDetails.amount,
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: 'paid',
        timestamp: new Date()
    });

    // Update advance payment (assuming full payment for now)
    booking.advancePayment = {
        amount: paymentDetails.amount,
        paidAt: new Date(),
        razorpayPaymentId: razorpay_payment_id
    };

    await booking.save();

    // Update vendor availability (mark date as booked)
    const vendor = await VendorProfile.findByIdAndUpdate(
        booking.vendor,
        {
            $set: {
                'availabilityDates.$[elem].status': 'booked'
            }
        },
        {
            arrayFilters: [{ 'elem.date': booking.serviceDate }],
            new: true
        }
    ).populate('user', 'name email');

    // Send payment notification email to vendor
    try {
        const emailService = require('./emailService');
        const User = require('../models/User');
        const bookingUser = await User.findById(booking.user);

        await emailService.sendPaymentReceivedEmail(vendor.email, {
            vendorName: vendor.businessName || vendor.user.name,
            userName: bookingUser.name,
            amount: paymentDetails.amount / 100, // Convert paise to rupees
            serviceDate: booking.serviceDate,
            serviceType: booking.serviceType,
            bookingId: booking._id
        });
        console.log('Payment notification email sent to vendor');
    } catch (emailError) {
        console.error('Failed to send payment notification email:', emailError);
        // Don't throw error - booking is successful even if email fails
    }

    return booking;
};

/**
 * Get user's bookings
 */
const getUserBookings = async (userId, filters = {}) => {
    const query = { user: userId };

    if (filters.status) {
        query.bookingStatus = filters.status;
    }

    if (filters.paymentStatus) {
        query.paymentStatus = filters.paymentStatus;
    }

    if (filters.event) {
        try {
            query.event = new mongoose.Types.ObjectId(filters.event);
        } catch (e) {
            console.error('Invalid event ID format:', filters.event);
        }
    }

    console.log('getUserBookings Query:', JSON.stringify(query, null, 2));

    const bookings = await Booking.find(query)
        .populate('vendor', 'serviceType businessName location averageRating')
        .populate('event', 'name date')
        .sort({ createdAt: -1 });

    return bookings;
};

/**
 * Update vendor progress
 */
const updateVendorProgress = async (bookingId, vendorId, status, note) => {
    const booking = await Booking.findOne({ _id: bookingId, vendor: vendorId });

    if (!booking) {
        throw new Error('Booking not found or unauthorized');
    }

    booking.vendorProgress = status;
    booking.progressUpdates.push({
        status,
        note,
        updatedBy: vendorId,
        timestamp: new Date()
    });

    if (status === 'completed') {
        booking.bookingStatus = 'completed';
        booking.completedAt = new Date();
    }

    await booking.save();
    return booking;
};

/**
 * Get vendor's bookings
 */
const getVendorBookings = async (vendorUserId) => {
    // First find the vendor profile for this user
    const vendorProfile = await VendorProfile.findOne({ user: vendorUserId });

    if (!vendorProfile) {
        throw new Error('Vendor profile not found');
    }

    const bookings = await Booking.find({ vendor: vendorProfile._id })
        .populate('user', 'name email mobile')
        .populate('event', 'name date')
        .sort({ createdAt: -1 });

    return bookings;
};

module.exports = {
    createBooking,
    verifyAndUpdatePayment,
    getUserBookings,
    getVendorBookings,
    updateVendorProgress
};
