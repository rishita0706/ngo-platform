"use strict";
const express   = require("express");
const router    = express.Router();
const Volunteer = require("../models/Volunteer");
const logger    = require("../utils/logger");
const { asyncWrap, validate } = require("../middleware/errorHandler");

const VOLUNTEER_SCHEMA = {
  name:     { required: true,  maxLen: 100 },
  email:    { required: true,  maxLen: 200 },
  skills:   { required: true,  maxLen: 300 },
  interest: { required: true,  maxLen: 300 },
};

// POST /volunteer — register a volunteer
router.post("/", asyncWrap(async (req, res) => {
  const errors = validate(VOLUNTEER_SCHEMA, req.body);
  if (errors.length) {
    return res.status(400).json({ success: false, errors });
  }

  const { name, email, skills, interest } = req.body;

  // Prevent duplicate emails
  const exists = await Volunteer.findOne({ email: email.trim().toLowerCase() });
  if (exists) {
    return res.status(409).json({
      success: false,
      error:   "A volunteer with this email already exists.",
    });
  }

  const volunteer = new Volunteer({
    name:     name.trim(),
    email:    email.trim().toLowerCase(),
    skills:   skills.trim(),
    interest: interest.trim(),
  });

  await volunteer.save();
  logger.info("[volunteer] Registered", { email: volunteer.email });

  res.status(201).json({
    success: true,
    message: "Volunteer registered successfully! We'll be in touch soon. 🎉",
    id:      volunteer._id,
  });
}));

// GET /volunteer — list all (admin use)
router.get("/", asyncWrap(async (req, res) => {
  const page  = Math.max(1, parseInt(req.query.page  || "1",  10));
  const limit = Math.min(100, parseInt(req.query.limit || "50", 10));
  const skip  = (page - 1) * limit;

  const [data, total] = await Promise.all([
    Volunteer.find({}, "-__v").sort({ _id: -1 }).skip(skip).limit(limit),
    Volunteer.countDocuments(),
  ]);

  res.json({ success: true, total, page, limit, data });
}));

module.exports = router;
