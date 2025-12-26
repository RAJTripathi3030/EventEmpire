const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    // Reference to user who made the booking
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Reference to vendor being booked
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'VendorProfile',
        required: true
    },
    // Reference to event (if booking is part of an event)
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: false
    },
    // Booking details
    serviceDate: {
        type: Date,
        required: true
    },
    serviceType: {
        type: String,
        required: true // e.g., "Catering", "Photography"
    },
    selectedPackage: {
        packageName: String,
        price: Number,
        description: String
    },
    // Total cost calculation
    baseAmount: {
        type: Number,
        required: true
    },
    taxAmount: {
        type: Number,
        default: 0
    },
    discountAmount: {
        type: Number,
        default: 0
    },
    totalAmount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'INR'
    },

    // Payment tracking
    paymentStatus: {
        type: String,
        enum: ['pending', 'due', 'paid', 'partially_paid', 'failed', 'refunded'],
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        enum: ['razorpay', 'cash', 'bank_transfer', 'upi'],
        default: 'razorpay'
    },
    // Payment timeline
    advancePayment: {
        amount: Number,
        paidAt: Date,
        razorpayPaymentId: String
    },
    finalPayment: {
        amount: Number,
        paidAt: Date,
        razorpayPaymentId: String
    },
    // Complete payment history for audit trail
    paymentHistory: [{
        amount: {
            type: Number,
            required: true
        },
        razorpayOrderId: {
            type: String
        },
        razorpayPaymentId: {
            type: String
        },
        razorpaySignature: {
            type: String
        },
        status: {
            type: String,
            enum: ['created', 'attempted', 'paid', 'failed', 'refunded'],
            required: true
        },
        failureReason: {
            type: String
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],

    // Vendor service delivery tracking
    vendorProgress: {
        type: String,
        enum: ['not_started', 'confirmed', 'in_preparation', 'in_progress', 'completed', 'cancelled'],
        default: 'not_started'
    },
    progressUpdates: [{
        status: String,
        note: String,
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],

    // Booking status
    bookingStatus: {
        type: String,
        enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'disputed'],
        default: 'pending'
    },

    // Additional details
    specialRequests: {
        type: String
    },
    numberOfGuests: {
        type: Number
    },
    venue: {
        type: String
    },

    // Cancellation tracking
    cancellationReason: {
        type: String
    },
    cancelledBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    cancelledAt: {
        type: Date
    },
    refundAmount: {
        type: Number,
        default: 0
    },

    // Review link (populated after service completion)
    review: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review'
    },

    // Timestamps
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    confirmedAt: {
        type: Date
    },
    completedAt: {
        type: Date
    }
});

// Indexes for efficient queries
bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ vendor: 1, serviceDate: 1 });
bookingSchema.index({ paymentStatus: 1 });
bookingSchema.index({ bookingStatus: 1 });

// Update timestamp on save
bookingSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// Method to calculate remaining balance
bookingSchema.methods.getRemainingBalance = function () {
    let paid = 0;
    if (this.advancePayment && this.advancePayment.amount) {
        paid += this.advancePayment.amount;
    }
    if (this.finalPayment && this.finalPayment.amount) {
        paid += this.finalPayment.amount;
    }
    return this.totalAmount - paid;
};

// Method to check if booking is fully paid
bookingSchema.methods.isFullyPaid = function () {
    return this.getRemainingBalance() <= 0;
};

module.exports = mongoose.model('Booking', bookingSchema);
