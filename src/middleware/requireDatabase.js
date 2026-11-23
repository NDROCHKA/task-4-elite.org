const mongoose = require('mongoose');

function requireDatabase(_request, response, next) {
  if (mongoose.connection.readyState !== 1) {
    return response.status(503).json({
      message: 'The database is offline. Add MONGODB_URI to your .env file and restart the server.'
    });
  }

  return next();
}

module.exports = requireDatabase;
