import logger from "../utils/logger.js";

const requestLogger = (req, res, next) => {
  const { method, url, ip } = req;
  logger.info(`Incoming Request: ${method} ${url} - IP: ${ip}`);
  next();
};

export default requestLogger;
