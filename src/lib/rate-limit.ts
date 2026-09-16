import { NextRequest, NextResponse } from "next/server";

// In-memory rate limiter. Works correctly on long-lived servers and in dev.
// On Vercel/serverless each cold start resets the store, so limits are per-instance
// rather than global. Swap for an Upstash Redis adapter for global enforcement.
interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

interface RateLimitOptions {
  windowMs: number;      // Time window in milliseconds
  maxRequests: number;   // Max requests per window
  keyPrefix?: string;    // Prefix for the rate limit key
}

export function rateLimit(options: RateLimitOptions) {
  const { windowMs, maxRequests, keyPrefix = "api" } = options;

  return async function rateLimitMiddleware(request: NextRequest) {
    // Get client IP
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() 
      || request.headers.get("x-real-ip") 
      || "unknown";
    
    const userId = request.headers.get("x-user-id") || "anonymous";
    const key = `${keyPrefix}:${userId}:${ip}`;
    
    const now = Date.now();
    const entry = rateLimitStore.get(key);
    
    if (!entry || now > entry.resetAt) {
      // First request or window expired
      rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
      return null; // Allow request
    }
    
    if (entry.count >= maxRequests) {
      // Rate limited
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
      return NextResponse.json(
        { 
          error: "Too many requests",
          retryAfter 
        }, 
        { 
          status: 429,
          headers: {
            "Retry-After": retryAfter.toString(),
            "X-RateLimit-Limit": maxRequests.toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": Math.ceil(entry.resetAt / 1000).toString(),
          }
        }
      );
    }
    
    entry.count++;
    return null; // Allow request
  };
}

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Clean up every minute

// Specific rate limiters for different endpoints
export const llmRateLimit = rateLimit({
  windowMs: 60000, // 1 minute
  maxRequests: 30, // 30 requests per minute
  keyPrefix: "llm",
});

export const deepgramRateLimit = rateLimit({
  windowMs: 60000, // 1 minute
  maxRequests: 20, // 20 requests per minute
  keyPrefix: "deepgram",
});

export const themeRateLimit = rateLimit({
  windowMs: 3600000, // 1 hour
  maxRequests: 10, // 10 generations per hour
  keyPrefix: "theme",
});

export const authRateLimit = rateLimit({
  windowMs: 600000, // 10 minutes
  maxRequests: 5, // 5 attempts per 10 minutes
  keyPrefix: "auth",
});