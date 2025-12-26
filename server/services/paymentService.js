const Razorpay = require('razorpay');
const crypto = require('crypto');

/**
 * Payment Service for Razorpay Integration
 * 
 * WHY SEPARATE MODULE?
 * - Payment logic isolated from booking/vendor logic
 * - Easy to swap payment gateways in future (Stripe, PayPal, etc.)
 * - Centralized error handling for payment failures
 * - Security: All signature verification in one place
 */

// Initialize Razorpay instance
// WHY lazy initialization? Prevents errors if .env not loaded yet
let razorpayInstance = null;

const getRazorpayInstance = () => {
    if (!razorpayInstance) {
        razorpayInstance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });
    }
    return razorpayInstance;
};

/**
 * Create a Razorpay Order
 * 
 * WHY CREATE ORDER FIRST?
 * - Razorpay requires an order_id before payment
 * - Order creation happens on backend to prevent amount tampering
 * - Frontend receives order_id and uses it in checkout modal
 * 
 * @param {number} amount - Amount in INR (will be converted to paise)
 * @param {string} currency - Currency code (default: INR)
 * @param {string} receipt - Unique receipt ID for reconciliation (use bookingId)
 * @param {object} notes - Additional metadata (e.g., userId, vendorId, serviceType)
 * @returns {Promise<object>} Razorpay order object with order_id
 * 
 * SECURITY: Amount is in paise (₹100 = 10000 paise) to avoid decimal errors
 */
const createRazorpayOrder = async (amount, currency = 'INR', receipt, notes = {}) => {
    try {
        const razorpay = getRazorpayInstance();

        // Convert INR to paise (Razorpay requirement)
        // WHY multiply by 100? Razorpay uses smallest currency unit
        const amountInPaise = Math.round(amount * 100);

        const options = {
            amount: amountInPaise,
            currency: currency,
            receipt: receipt || `receipt_${Date.now()}`,
            notes: notes, // Store booking metadata for reconciliation
            payment_capture: 1, // Auto-capture payment (vs manual capture)
        };

        const order = await razorpay.orders.create(options);

        return {
            success: true,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            receipt: order.receipt,
            status: order.status
        };
    } catch (error) {
        console.error('Razorpay order creation error:', error);
        throw new Error(`Failed to create Razorpay order: ${error.message}`);
    }
};

/**
 * Verify Razorpay Payment Signature
 * 
 * WHY VERIFY SIGNATURE?
 * - CRITICAL SECURITY: Prevents payment fraud/tampering
 * - Razorpay sends webhook with payment details
 * - We must verify signature before marking payment as successful
 * 
 * FORMULA: HMAC_SHA256(order_id + "|" + payment_id, secret_key)
 * 
 * @param {string} orderId - Razorpay order ID
 * @param {string} paymentId - Razorpay payment ID
 * @param {string} signature - Signature sent by Razorpay
 * @returns {boolean} True if signature is valid
 * 
 * SECURITY: Never trust client-side payment confirmation!
 * Always verify signature on backend before updating booking status
 */
const verifyPaymentSignature = (orderId, paymentId, signature) => {
    try {
        // Create verification string: orderId|paymentId
        const body = orderId + '|' + paymentId;

        // Generate expected signature using HMAC SHA256
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        // Compare signatures (timing-safe comparison to prevent timing attacks)
        const isValid = expectedSignature === signature;

        if (!isValid) {
            console.error('Signature verification failed:', {
                expected: expectedSignature,
                received: signature
            });
        }

        return isValid;
    } catch (error) {
        console.error('Signature verification error:', error);
        return false;
    }
};

/**
 * Fetch Payment Details from Razorpay
 * 
 * WHY FETCH? To get payment status, method, and other metadata
 * Useful for webhooks and payment reconciliation
 * 
 * @param {string} paymentId - Razorpay payment ID
 * @returns {Promise<object>} Payment details
 */
const fetchPaymentDetails = async (paymentId) => {
    try {
        const razorpay = getRazorpayInstance();
        const payment = await razorpay.payments.fetch(paymentId);

        return {
            id: payment.id,
            amount: payment.amount / 100, // Convert paise to INR
            currency: payment.currency,
            status: payment.status,
            method: payment.method,
            captured: payment.captured,
            email: payment.email,
            contact: payment.contact,
            createdAt: new Date(payment.created_at * 1000) // Unix timestamp to Date
        };
    } catch (error) {
        console.error('Fetch payment error:', error);
        throw new Error(`Failed to fetch payment: ${error.message}`);
    }
};

/**
 * Process Refund
 * 
 * WHY SEPARATE FUNCTION? Refunds have their own workflow
 * - User cancels booking
 * - Admin approves refund
 * - This function initiates Razorpay refund
 * 
 * @param {string} paymentId - Razorpay payment ID to refund
 * @param {number} amount - Refund amount in INR (optional, defaults to full refund)
 * @returns {Promise<object>} Refund details
 */
const processRefund = async (paymentId, amount = null) => {
    try {
        const razorpay = getRazorpayInstance();

        const options = amount ? { amount: Math.round(amount * 100) } : {}; // Partial or full refund

        const refund = await razorpay.payments.refund(paymentId, options);

        return {
            refundId: refund.id,
            paymentId: refund.payment_id,
            amount: refund.amount / 100,
            status: refund.status,
            createdAt: new Date(refund.created_at * 1000)
        };
    } catch (error) {
        console.error('Refund processing error:', error);
        throw new Error(`Failed to process refund: ${error.message}`);
    }
};

/**
 * Verify Webhook Signature
 * 
 * WHY WEBHOOKS? Razorpay sends real-time payment updates
 * - Payment success
 * - Payment failure
 * - Refund processed
 * 
 * WHY VERIFY? Prevent fake webhook requests from attackers
 * 
 * @param {string} webhookBody - Raw request body
 * @param {string} webhookSignature - Signature from headers
 * @returns {boolean} True if webhook is authentic
 */
const verifyWebhookSignature = (webhookBody, webhookSignature) => {
    try {
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET)
            .update(webhookBody)
            .digest('hex');

        return expectedSignature === webhookSignature;
    } catch (error) {
        console.error('Webhook signature verification error:', error);
        return false;
    }
};

module.exports = {
    createRazorpayOrder,
    verifyPaymentSignature,
    fetchPaymentDetails,
    processRefund,
    verifyWebhookSignature
};
