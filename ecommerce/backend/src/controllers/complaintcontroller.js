const Complaint = require('../models/complaint');
const Policy = require('../models/policy');
const User = require('../models/User');

// Create Complaint & AI Analysis
const createComplaint = async (req, res) => {
    try {
        const { productName, category, description } = req.body;
        const userId = req.user.id;

        if (!productName || !description) {
            return res.status(400).json({ message: 'Product name and description are required' });
        }

        const user = await User.findById(userId).select('name');
        if (!user) {
            return res.status(401).json({ message: 'Authenticated user not found' });
        }
        const customerName = user.name;

        // 1. Relevant Policy fetch karein AI analysis ke liye
        const policies = await Policy.find({});
        let matchedPolicy = "Standard store exchange and return policy applies within 7 days.";
        
        policies.forEach(policy => {
            if (description.toLowerCase().includes(policy.policyType.toLowerCase())) {
                matchedPolicy = policy.content;
            }
        });

        // 2. AI Analysis & Suggested Reply generation
        const aiSummary = `Customer reported an issue regarding ${productName}: "${description}".`;
        const recommendedAction = "Verify order details and check store policy.";
        const suggestedReply = `We are sorry for the inconvenience you faced with ${productName}. Based on our policy: "${matchedPolicy}", we are looking into your case and will update you shortly.`;

        // 3. save complaint to database with AI analysis
        const newComplaint = await Complaint.create({
            userId,
            customerName,
            productName,
            category: category || 'General',
            description,
            status: 'Pending',
            customerReply: `We received your complaint about ${productName}. ${suggestedReply} Current status: Pending. We will update you when it is being reviewed.`,
            ownerNotification: `New ${category || 'General'} complaint from ${customerName} about ${productName}. Please review the details and update its status when work begins.`,
            aiAnalysis: {
                summary: aiSummary,
                recommendedAction: recommendedAction,
                suggestedReply: suggestedReply
            }
        });

        const customerComplaint = newComplaint.toObject();
        delete customerComplaint.ownerNotification;

        res.status(201).json({ 
            message: 'Complaint submitted successfully and analyzed by AI', 
            complaint: customerComplaint
        });

    } catch (error) {
        res.status(500).json({ message: 'Failed to submit complaint', error: error.message });
    }
};

// Get All Complaints (Owner Dashboard ke liye)
const getComplaints = async (req, res) => {
    try {
        const query = req.user.role === 'owner' ? {} : { userId: req.user.id };
        let complaintQuery = Complaint.find(query).sort({ createdAt: -1 });
        if (req.user.role !== 'owner') {
            complaintQuery = complaintQuery.select('-ownerNotification');
        }
        const complaints = await complaintQuery;
        res.status(200).json(complaints);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch complaints', error: error.message });
    }
};

// Update Complaint Status (Resolve/In Progress)
const updateComplaintStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const allowedStatuses = Complaint.schema.path('status').enumValues;

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: `Status must be one of: ${allowedStatuses.join(', ')}`
            });
        }

        const complaint = await Complaint.findById(id);
        if (!complaint) {
            return res.status(404).json({ message: 'Complaint not found' });
        }

        const statusReply = {
            'Pending': 'Your complaint has been received and is waiting for review.',
            'In Progress': 'Your complaint is now being reviewed by our support team.',
            'Resolved': 'Your complaint has been marked as resolved. Please contact support if you still need help.'
        };
        complaint.status = status;
        complaint.customerReply = `${complaint.aiAnalysis?.suggestedReply || ''} ${statusReply[status]}`.trim();
        const updatedComplaint = await complaint.save();

        res.status(200).json({ message: 'Complaint status updated', updatedComplaint });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update status', error: error.message });
    }
};

module.exports = { createComplaint, getComplaints, updateComplaintStatus };