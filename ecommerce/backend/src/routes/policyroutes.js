const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRoles");

const {
    createPolicy,
    getPolicies,
    updatePolicy,
    removePolicy,
} = require("../controllers/policycontroller");

const router = express.Router();

router.post("/", authMiddleware, authorizeRoles("owner"), createPolicy);
router.get("/", authMiddleware, getPolicies);
router.put("/:id", authMiddleware, authorizeRoles("owner"), updatePolicy);
router.delete("/:id", authMiddleware, authorizeRoles("owner"), removePolicy);


module.exports = router;
