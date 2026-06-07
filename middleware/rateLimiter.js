const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS = 100;

const clients = new Map();

function cleanupExpired(now) {
  for (const [key, data] of clients.entries()) {
    if (now - data.windowStart >= WINDOW_MS) {
      clients.delete(key);
    }
  }
}

function rateLimiter(req, res, next) {
  const key = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();

  if (clients.size > 10000) {
    cleanupExpired(now);
  }

  let client = clients.get(key);

  if (!client || now - client.windowStart >= WINDOW_MS) {
    client = { windowStart: now, count: 0 };
    clients.set(key, client);
  }

  client.count += 1;

  res.setHeader('X-RateLimit-Limit', MAX_REQUESTS);
  res.setHeader('X-RateLimit-Remaining', Math.max(0, MAX_REQUESTS - client.count));
  res.setHeader(
    'X-RateLimit-Reset',
    Math.ceil((client.windowStart + WINDOW_MS) / 1000)
  );

  if (client.count > MAX_REQUESTS) {
    return res.status(429).json({
      success: false,
      error: 'Too many requests. Limit is 100 requests per 15 minutes.',
    });
  }

  next();
}

module.exports = rateLimiter;
