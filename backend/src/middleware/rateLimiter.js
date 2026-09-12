/**
 * Middleware Rate Limiter & Anti-Spam (Request Debouncing)
 * Mencegah permintaan berulang (double click / spamming) ke server backend.
 */

// Memory cache untuk menyimpan timestamp request terakhir per key
const requestCache = new Map();

// Periodic cleanup setiap 5 menit agar memori tetap bersih
setInterval(() => {
  const now = Date.now();
  for (const [key, timestamp] of requestCache.entries()) {
    if (now - timestamp > 60000) {
      requestCache.delete(key);
    }
  }
}, 300000);

/**
 * Middleware: Anti-Spam / Anti-Duplicate Request
 * Mencegah tombol diklik berkali-kali secara cepat untuk endpoint POST/PUT/DELETE.
 * @param {number} windowMs Rentang waktu penguncian dalam milidetik (default 1.5 detik)
 */
const preventDuplicateRequests = (windowMs = 1500) => {
  return (req, res, next) => {
    // Abaikan request GET untuk rate limiting duplikat ini
    if (req.method === 'GET') {
      return next();
    }

    const userId = req.user?.id || req.ip || 'anonymous';
    // Buat kuncian unik dari User/IP + Method + URL + Payload Sederhana
    const key = `${userId}:${req.method}:${req.originalUrl}:${JSON.stringify(req.body || {})}`;
    const now = Date.now();
    const lastRequest = requestCache.get(key);

    if (lastRequest && now - lastRequest < windowMs) {
      console.warn(`[ANTI_SPAM_BLOCKED]: Request ${req.method} ${req.originalUrl} dari ${userId} diblokir (spam click).`);
      return res.status(429).json({
        success: false,
        message: 'Permintaan Anda sedang diproses. Mohon tidak mengklik tombol berkali-kali.',
      });
    }

    requestCache.set(key, now);
    next();
  };
};

/**
 * Middleware: General API Rate Limiter
 * Pembatas jumlah request global per IP (default 120 request / menit)
 */
const apiRateLimiter = (maxRequests = 120, windowMs = 60000) => {
  const ipCounts = new Map();

  return (req, res, next) => {
    const ip = req.ip || req.connection?.remoteAddress || '127.0.0.1';
    const now = Date.now();
    const record = ipCounts.get(ip) || { count: 0, startTime: now };

    if (now - record.startTime > windowMs) {
      record.count = 1;
      record.startTime = now;
    } else {
      record.count += 1;
    }

    ipCounts.set(ip, record);

    if (record.count > maxRequests) {
      return res.status(429).json({
        success: false,
        message: 'Batas maksimum permintaan terlampaui. Silakan coba lagi beberapa saat lagi.',
      });
    }

    next();
  };
};

module.exports = {
  preventDuplicateRequests,
  apiRateLimiter,
};
