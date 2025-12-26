const Booking = require('../models/Booking');
const User = require('../models/User');

/**
 * Budget Validation Middleware
 * 
 * WHY MIDDLEWARE? Budget check is a cross-cutting concern that should
 * run BEFORE any transaction creation, regardless of payment method.
 * 
 * DESIGN DECISION: Middleware vs Service Function?
 * - Middleware chosen because:
 *   1. Runs automatically before protected routes
 *   2. Can block request if budget exceeded
 *   3. Adds budget info to request object for use in controller
 *   4. Consistent validation across all booking endpoints
 * 
 * HOW IT WORKS:
 * 1. Fetch user's totalBudget
 * 2. Calculate total spent from paid bookings
 * 3. Compare (spent + newBooking amount) with totalBudget
 * 4. If exceeds, add warning flag and trigger alert
 * 5. Still allow booking but notify user (UX decision)
 * 
 * ALTERNATIVE CONSIDERED: Block booking entirely if budget exceeded
 * REJECTED: User may want to exceed budget knowingly, so we warn instead
 */

const validateBudget = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const requestedAmount = parseFloat(req.body.totalAmount || req.body.amount || 0);

        // Fetch user with budget info
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // If user hasn't set a budget, skip validation
        if (!user.totalBudget || user.totalBudget === null) {
            req.budgetCheck = {
                hasBudget: false,
                message: 'No budget limit set'
            };
            return next();
        }

        // Calculate total spent from PAID bookings
        // WHY AGGREGATION? More efficient than fetching all bookings
        // and summing in JavaScript. Single DB query instead of multiple.
        const spentAggregation = await Booking.aggregate([
            {
                $match: {
                    user: userId,
                    paymentStatus: { $in: ['paid', 'partially_paid'] }
                }
            },
            {
                $group: {
                    _id: null,
                    totalSpent: { $sum: '$totalAmount' }
                }
            }
        ]);

        const totalSpent = spentAggregation.length > 0 ? spentAggregation[0].totalSpent : 0;
        const projectedTotal = totalSpent + requestedAmount;
        const remaining = user.totalBudget - totalSpent;
        const percentageUsed = (projectedTotal / user.totalBudget) * 100;

        // Budget status logic
        const budgetCheck = {
            hasBudget: true,
            totalBudget: user.totalBudget,
            totalSpent: totalSpent,
            remaining: remaining,
            requestedAmount: requestedAmount,
            projectedTotal: projectedTotal,
            percentageUsed: percentageUsed.toFixed(2),
            isExceeding: projectedTotal > user.totalBudget,
            isWarning: percentageUsed >= 80 && percentageUsed < 100, // 80-100% warning
            isCritical: percentageUsed >= 100 // >100% critical
        };

        // Attach budget info to request object
        req.budgetCheck = budgetCheck;

        // Log budget status
        if (budgetCheck.isExceeding) {
            console.log(`⚠️  Budget Alert: User ${user.email} exceeding budget by ₹${projectedTotal - user.totalBudget}`);
        } else if (budgetCheck.isWarning) {
            console.log(`⚠️  Budget Warning: User ${user.email} at ${percentageUsed.toFixed(1)}% of budget`);
        }

        // Trigger alert if exceeding or warning (can be sent via Socket.io or email)
        if (budgetCheck.isExceeding || budgetCheck.isWarning) {
            req.triggerBudgetAlert = true;
            // In a real app, emit Socket.io event or queue email notification here
            // For now, we'll handle this in the controller
        }

        // IMPORTANT: We don't block the request, just warn
        // User can still proceed with booking
        next();

    } catch (error) {
        console.error('Budget validation error:', error);
        // Don't block request if budget check fails, just log error
        req.budgetCheck = { error: 'Failed to validate budget' };
        next();
    }
};

/**
 * Helper function to update budget status response
 * Used in booking controllers to include budget info in response
 */
const addBudgetInfoToResponse = (req, responseData) => {
    if (req.budgetCheck) {
        responseData.budgetStatus = req.budgetCheck;

        if (req.budgetCheck.isExceeding) {
            responseData.budgetAlert = {
                type: 'critical',
                message: `This booking will exceed your budget by ₹${(req.budgetCheck.projectedTotal - req.budgetCheck.totalBudget).toFixed(2)}`,
                recommendation: 'Consider reviewing your budget or choosing a lower-priced vendor'
            };
        } else if (req.budgetCheck.isWarning) {
            responseData.budgetAlert = {
                type: 'warning',
                message: `You've used ${req.budgetCheck.percentageUsed}% of your budget`,
                recommendation: `₹${req.budgetCheck.remaining.toFixed(2)} remaining for other bookings`
            };
        }
    }

    return responseData;
};

module.exports = { validateBudget, addBudgetInfoToResponse };
