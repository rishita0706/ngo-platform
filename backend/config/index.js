"use strict";
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const config = {
  port:       parseInt(process.env.PORT || "5000", 10),
  mongoUri:   process.env.MONGO_URI || "",
  openaiKey:  process.env.OPENAI_API_KEY || "",
  nodeEnv:    process.env.NODE_ENV || "development",
  mlModelDir: path.resolve(__dirname, "../../ml-model"),
  isDev:      (process.env.NODE_ENV || "development") === "development",
};

const required = ["mongoUri"];
for (const key of required) {
  if (!config[key]) console.warn(`[config] WARNING: ${key} is not set`);
}

module.exports = config;
