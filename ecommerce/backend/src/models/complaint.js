const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  customerName: { type: String, required: true },
  productName: { type: String, required: true },
  category: { type: String, default: 'General' },
  description: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['Pending', 'In Progress', 'Resolved'], 
    default: 'Pending' 
  },
  customerReply: { type: String, default: '' },
  ownerNotification: { type: String, default: '' },
  aiAnalysis: {
    summary: String,
    recommendedAction: String,
    suggestedReply: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Complaint', complaintSchema);