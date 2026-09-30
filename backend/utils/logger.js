import winston from "winston";
import path from "path";

// Define log format
const logFormat = winston.format.printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level.toUpperCase()}]: ${message}`;
});

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    logFormat
  ),
  transports: [
    // Write all logs with level `error` and below to `error.log`
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
    }),
    // Write all logs with level `info` and below to `request.log`
    new winston.transports.File({ filename: "logs/request.log" }),
    // Also log to console
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), logFormat),
    }),
  ],
});

export default logger;
