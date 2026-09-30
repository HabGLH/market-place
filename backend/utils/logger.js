import winston from "winston";
import { mkdirSync } from "node:fs";

const isProduction = process.env.NODE_ENV === "production";
const isDevelopment = process.env.NODE_ENV === "development";
if (isDevelopment) mkdirSync("logs", { recursive: true });
const consoleFormat = isProduction
  ? winston.format.json()
  : winston.format.printf(({ level, message, timestamp, stack }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${stack || message}`;
    });

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    consoleFormat,
  ),
  transports: isProduction
    ? [new winston.transports.Console()]
    : isDevelopment
      ? [
          new winston.transports.File({
            filename: "logs/error.log",
            level: "error",
          }),
          new winston.transports.File({ filename: "logs/request.log" }),
          new winston.transports.Console({
            format: winston.format.combine(
              winston.format.colorize(),
              consoleFormat,
            ),
          }),
        ]
      : [new winston.transports.Console({ format: consoleFormat })],
});

export default logger;
