"use strict";
const mongoose = require("mongoose");

const volunteerSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true, trim: true, maxlength: 100 },
    email:    { type: String, required: true, trim: true, lowercase: true, maxlength: 200 },
    skills:   { type: String, required: true, trim: true, maxlength: 300 },
    interest: { type: String, required: true, trim: true, maxlength: 300 },
  },
  { timestamps: true }
);

// Unique index on email
volunteerSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model("Volunteer", volunteerSchema);
