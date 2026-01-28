const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // log for dev
    if (process.env.NODE_ENV === 'development') {
        console.error(err);
    }

    // mongoose bad ObjectId
    if (err.name === 'CastError') {
        error.message = 'Resource not found';
        error.statusCode = 404;
    }

    // mongoose duplicate key
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        error.message = `${field} already exists`;
        error.statusCode = 400;
    }

    // mongoose validation error
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(val => val.message);
        error.message = messages.join(', ');
        error.statusCode = 400;
    }

    // jwt errors
    if (err.name === 'JsonWebTokenError') {
        error.message = 'Invalid token';
        error.statusCode = 401;
    }

    if (err.name === 'TokenExpiredError') {
        error.message = 'Token expired';
        error.statusCode = 401;
    }

    res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

module.exports = errorHandler;
