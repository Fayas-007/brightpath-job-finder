const DEFAULT_PRODUCTION_ORIGINS = [
  "https://brightpath-job-finder.vercel.app",
];

const getNormalizedOrigin = (origin) => {
  if (!origin || typeof origin !== "string") return "";

  try {
    return new URL(origin).origin;
  } catch {
    return origin.replace(/\/$/, "");
  }
};

const getAllowedOrigins = () => {
  const configuredOrigins = [
    process.env.FRONTEND_URL,
    process.env.CORS_ORIGINS,
    ...DEFAULT_PRODUCTION_ORIGINS,
  ]
    .filter(Boolean)
    .flatMap((value) => String(value).split(","))
    .map((origin) => getNormalizedOrigin(origin.trim()))
    .filter(Boolean);

  if (!process.env.VERCEL && process.env.NODE_ENV !== "production") {
    configuredOrigins.push(
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "http://localhost:4173",
      "http://127.0.0.1:4173"
    );
  }

  return new Set(configuredOrigins);
};

const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true);

    const allowedOrigins = getAllowedOrigins();
    return callback(null, allowedOrigins.has(getNormalizedOrigin(origin)));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204,
};

const securityHeaders = (req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=()"
  );
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");

  if (req.secure || process.env.VERCEL || process.env.NODE_ENV === "production") {
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains"
    );
  }

  next();
};

const getClientIp = (req) => {
  const forwardedFor = req.headers["x-forwarded-for"];
  if (typeof forwardedFor === "string" && forwardedFor.trim()) {
    return forwardedFor.split(",")[0].trim();
  }

  return req.ip || req.socket?.remoteAddress || "unknown";
};

const createRateLimiter = ({
  windowMs,
  max,
  message = "Too many requests. Please try again later.",
  keyGenerator,
}) => {
  const buckets = new Map();
  let requestCount = 0;

  return (req, res, next) => {
    const now = Date.now();
    requestCount += 1;

    if (requestCount % 1000 === 0) {
      for (const [key, bucket] of buckets.entries()) {
        if (bucket.resetAt <= now) buckets.delete(key);
      }
    }

    const key = keyGenerator
      ? keyGenerator(req)
      : `${getClientIp(req)}:${req.method}:${req.baseUrl}${req.path}`;
    const currentBucket = buckets.get(key);

    if (!currentBucket || currentBucket.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    currentBucket.count += 1;

    if (currentBucket.count > max) {
      const retryAfter = Math.ceil((currentBucket.resetAt - now) / 1000);
      res.setHeader("Retry-After", String(retryAfter));
      return res.status(429).json({ message });
    }

    return next();
  };
};

const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: "Too many sign-in attempts. Please wait a few minutes and try again.",
  keyGenerator: (req) => {
    const email = String(req.body?.email || "").trim().toLowerCase();
    const route = String(req.originalUrl || req.path).split("?")[0];
    return `auth:${getClientIp(req)}:${route}:${email}`;
  },
});

const uploadRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: "Too many uploads. Please wait a few minutes and try again.",
  keyGenerator: (req) => {
    const route = String(req.originalUrl || req.path).split("?")[0];
    return `upload:${getClientIp(req)}:${route}`;
  },
});

const apiWriteRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 250,
  message: "Too many updates. Please slow down and try again later.",
  keyGenerator: (req) => `write:${getClientIp(req)}`,
});

const limitWriteRequests = (req, res, next) => {
  if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
    return apiWriteRateLimiter(req, res, next);
  }

  return next();
};

module.exports = {
  authRateLimiter,
  corsOptions,
  limitWriteRequests,
  securityHeaders,
  uploadRateLimiter,
};
