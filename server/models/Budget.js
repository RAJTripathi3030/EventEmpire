const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true,
        unique: true,
    },
    totalBudget: {
        type: Number,
        required: true,
    },
    expenses: [
        {
            title: String,
            amount: Number,
            category: {
                type: String,
                enum: ['Venue', 'Catering', 'Decoration', 'Entertainment', 'Other'],
                default: 'Other',
            },
            status: {
                type: String,
                enum: ['pending', 'partially_done', 'paid', 'completed'],
                default: 'pending',
            },
            date: { type: Date, default: Date.now },
        },
    ],
});

module.exports = mongoose.model('Budget', budgetSchema);
