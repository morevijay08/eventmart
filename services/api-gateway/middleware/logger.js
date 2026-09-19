const morgan = require('morgan');

// Custom format — shows method, url, status, response time
const logger = morgan(':method :url :status :response-time ms');

module.exports = logger;