"use strict";
const logger = require("../utils/logger");

// Validation helper used by routes
function validate(schema, data) {
  const errors = [];
  for (const [field, rule] of Object.entries(schema)) {
    const val = (data[field] || "").toString().trim();
    if (rule.required && !val)       errors.push(`${field} is required`);
    if (rule.maxLen && val.length > rule.maxLen)
      errors.push(`${field} must be at most ${rule.maxLen} characters`);
  }
  return errors;
}

// Express error-handling middleware (4 args)
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  logger.error("[errorHandler]", { message: err.message, stack: err.stack?.split("\n")[0] });
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    success: false,
    error:   status === 500 ? "Internal server error" : err.message,
  });
}

// Wrap async route handlers so they auto-forward errors to errorHandler
function asyncWrap(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

module.exports = { errorHandler, validate, asyncWrap };
