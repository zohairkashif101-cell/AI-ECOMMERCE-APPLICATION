const express = require("express");
const { answerQuestion } = require("../ai/chatService");

const router = express.Router();

router.post("/", async (req, res) => {
  const { message } = req.body || {};
  if (typeof message !== "string" || !message.trim()) {
    return res.status(400).json({ error: "Message is required." });
  }
  if (message.trim().length > 2000) {
    return res.status(400).json({ error: "Message must be 2000 characters or fewer." });
  }

  try {
    const result = await answerQuestion(message.trim());
    return res.json(result);
  } catch (error) {
    console.error("Chat API error:", error.message);
    return res.status(503).json({
      error: "Chatbot is temporarily unavailable. Check that Ollama is running and configured.",
    });
  }
});

module.exports = router;
