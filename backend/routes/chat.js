"use strict";
const express    = require("express");
const router     = express.Router();
const config     = require("../config");
const { getReply }  = require("../utils/chatEngine");
const { runPredict } = require("../utils/mlRunner");
const { asyncWrap, validate } = require("../middleware/errorHandler");
const logger     = require("../utils/logger");

// POST /chat
router.post("/", asyncWrap(async (req, res) => {
  const errors = validate(
    { message: { required: true, maxLen: 1000 } },
    req.body
  );
  if (errors.length) return res.status(400).json({ success: false, errors });

  const { message, sessionId } = req.body;

  // Try ML role detection first — if confidence is high enough, blend it in
  let mlHint = null;
  try {
    const mlResult = await runPredict(message, message);
    if (mlResult.confidence >= 0.75) {
      mlHint = { role: mlResult.role, confidence: mlResult.confidence };
    }
  } catch {
    // ML is optional for chat — don't surface error to user
  }

  const { reply, source } = await getReply({
    message,
    sessionId: sessionId || "default",
    openaiKey: config.openaiKey,
  });

  // If ML detected a strong role signal and the local engine replied, append suggestion
  let finalReply = reply;
  if (mlHint && source === "local") {
    finalReply = `${reply}\n\n🎯 Based on your message, you might be a great **${mlHint.role}** (${Math.round(mlHint.confidence * 100)}% match)!`;
  }

  logger.info("[chat] Replied", { source, sessionId, mlHint });

  res.json({ success: true, reply: finalReply, source });
}));

// POST /predict — standalone ML role prediction
router.post("/predict", asyncWrap(async (req, res) => {
  const errors = validate(
    {
      skills:   { required: true, maxLen: 300 },
      interest: { required: true, maxLen: 300 },
    },
    req.body
  );
  if (errors.length) return res.status(400).json({ success: false, errors });

  const { skills, interest } = req.body;

  try {
    const result = await runPredict(skills, interest);
    logger.info("[predict] Result", { role: result.role, confidence: result.confidence });
    res.json({
      success:    true,
      role:       result.role,
      confidence: result.confidence,
      all_scores: result.all_scores,
    });
  } catch (err) {
    logger.error("[predict] ML error", { message: err.message });
    res.status(500).json({
      success: false,
      error:   "Role prediction failed — please try again.",
    });
  }
}));

module.exports = router;
