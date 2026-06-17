"use strict";
/**
 * mlRunner.js
 * -----------
 * Spawns predict.py as a child process and parses its JSON output.
 * - Validates arguments before exec
 * - Returns structured { role, confidence, all_scores }
 * - Rejects with a typed error on failure
 */
const { exec } = require("child_process");
const path     = require("path");
const config   = require("../config");
const logger   = require("./logger");

const PREDICT_SCRIPT = path.join(config.mlModelDir, "predict.py");
const TIMEOUT_MS     = 10_000; // 10 s

/**
 * Sanitize an argument so it cannot break the shell command.
 * We allow letters, digits, spaces and common punctuation.
 */
function sanitize(str) {
  return String(str || "").replace(/[^a-zA-Z0-9 \-_.,&+]/g, "").trim().slice(0, 200);
}

/**
 * runPredict(skills, interest) → Promise<{ role, confidence, all_scores }>
 */
function runPredict(skills, interest) {
  return new Promise((resolve, reject) => {
    const safeSkills   = sanitize(skills);
    const safeInterest = sanitize(interest);

    if (!safeSkills && !safeInterest) {
      return reject(new Error("Both skills and interest are empty after sanitization"));
    }

    const cmd = `python "${PREDICT_SCRIPT}" "${safeSkills}" "${safeInterest}"`;
    logger.debug("[mlRunner] exec", { cmd });

    exec(cmd, { timeout: TIMEOUT_MS }, (error, stdout, stderr) => {
      if (stderr) logger.debug("[mlRunner] stderr", { stderr: stderr.trim() });

      if (error) {
        logger.error("[mlRunner] Process error", { message: error.message });
        return reject(new Error(`ML process failed: ${error.message}`));
      }

      const raw = (stdout || "").trim();
      if (!raw) {
        return reject(new Error("ML script produced no output"));
      }

      try {
        const result = JSON.parse(raw);
        if (result.error) return reject(new Error(result.error));
        resolve(result);
      } catch (parseErr) {
        logger.error("[mlRunner] JSON parse error", { raw });
        reject(new Error("Could not parse ML output"));
      }
    });
  });
}

module.exports = { runPredict };
