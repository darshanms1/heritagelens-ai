function errorHandler(err, req, res, next) {
    console.error(err.stack);

    const isDevelopment = process.env.NODE_ENV === 'development';
    const message = isDevelopment ? err.message : 'An unexpected error occurred';
    const errorDetails = isDevelopment ? err.stack : undefined;

    res.status(err.status || 500).json({
        error: true,
        message: message,
        details: errorDetails
    });
}

module.exports = errorHandler;
