function errorHandler(err, req, res, _next) {
  console.error(`[${new Date().toISOString()}]`, err.message);

  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });
  }

  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      success: false,
      error: 'Duplicate entry conflict.',
    });
  }

  if (err.code && err.code.startsWith('ER_')) {
    return res.status(500).json({
      success: false,
      error: 'Database error occurred.',
    });
  }

  res.status(500).json({
    success: false,
    error: 'Internal server error.',
  });
}

module.exports = errorHandler;
