// middleware/errorHandler.js

// 404 handler
const notFound = (req, res, next) => {
  res.status(404).json({ message: `🚫 Not Found - ${req.originalUrl}` });
};

// General error handler
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = { notFound, errorHandler };
