const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRoles");

const {
    createComplaint,
    getComplaints,
    updateComplaintStatus
} = require("../controllers/complaintcontroller");

const router = express.Router();

router.post("/", authMiddleware, authorizeRoles("customer"), createComplaint);
router.get("/", authMiddleware, getComplaints);
router.put("/:id", authMiddleware, authorizeRoles("owner"), updateComplaintStatus);

module.exports = router;