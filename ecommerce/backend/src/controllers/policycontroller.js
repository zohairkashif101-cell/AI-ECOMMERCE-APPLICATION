const policy = require('../models/policy');

const createPolicy = async (req, res) => {
    try {
        const { policyType, title, content } = req.body; // Yahan spelling theek kar di

        if (!policyType || !title || !content) {
            return res.status(400).json({ message: 'policyType, title and content are required' });
        }

        // Database mein policy save karne ka code add kar diya
        const newPolicy = await policy.create({
            policyType,
            title,
            content
        });

        res.status(201).json({ message: 'Policy created successfully', policy: newPolicy });
    } catch (error) {
        res.status(500).json({ message: 'Failed to create policy', error: error.message });
    }
}

const getPolicies = async (req, res) => {
    try {
        const policies = await policy.find();
        res.status(200).json({ policies });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch policies', error: error.message });
    }
}



const updatePolicy = async (req,res) => {
    try {
        const { id } = req.params;
        const { policyType, title, content } = req.body;

        if (!policyType || !title ||  !content) {
            return res.status(400).json({ message: 'policyType, title and content are required'});
        }

        const updatedPolicy = await policy.findByIdAndUpdate(id, { policyType, title, content }, { new: true });
        if (!updatedPolicy) {
            return res.status(404).json({ message: 'Policy not found' });
        }
        res.status(200).json({ message: 'Policy updated successfully', policy: updatedPolicy });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update policy', error: error.message });
    }
}


const removePolicy = async (req,res) => {
    try {
        const { id } = req.params;
        const deletedPolicy = await policy.findByIdAndDelete(id);
        if (!deletedPolicy) {
            return res.status(404).json({message: 'policy not found'});
        }

        res.status(200).json({message: 'policy deleted successfully', policy: deletedPolicy});
    } catch (error) {
        res.status(500).json({message: 'Failed to delete policy', error: error.message});
    }
}
module.exports = { createPolicy, getPolicies, updatePolicy, removePolicy};