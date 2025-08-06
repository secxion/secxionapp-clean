import winston from 'winston';
import morgan from 'morgan';

const { combine, timestamp, printf, colorize, align } = winston.format;

// Custom log format for the console
const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`;
});

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info', // Default to 'info'
  format: combine(
    colorize({ all: true }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    align(),
    logFormat
  ),
  transports: [
    new winston.transports.Console(),
  ],
  // Do not exit on handled exceptions
  exitOnError: false, 
});

// Morgan middleware to stream HTTP request logs through Winston
// This captures 'GET /api/users 200 5ms'
const morganFormat = ':method :url :status :res[content-length] - :response-time ms';

export const requestLogger = morgan(morganFormat, {
  stream: {
    write: (message) => {
      // Use the 'http' log level for requests
      logger.http(message.trim());
    },
  },
});

export default logger;
