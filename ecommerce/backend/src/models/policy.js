const mongoose = require('mongoose');

const policySchema = new mongoose.Schema({
    policyType: { 
        type: String, 
        enum: ['Exchange', 'Refund', 'Shipping', 'FAQ'], 
        required: true 
    },
    title: { type: String, required: true },
    content: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Policy', policySchema);