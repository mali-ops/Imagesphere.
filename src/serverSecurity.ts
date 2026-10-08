import type { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import dns from 'dns';

// Master Session Secret for HMAC token signing (falls back to secure random per-runtime secret)
const SERVER_SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');

// In-Memory Security Audit Logs (last 200 events)
export interface SecurityAuditLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'security_alert' | 'error';
  ip: string;
  method: string;
  path: string;
  action: string;
  details?: Record<string, any>;
}

export const securityAuditLogs: SecurityAuditLog[] = [];

export function logSecurityEvent(
  level: SecurityAuditLog['level'],
  req: Request | null,
  action: string,
  details?: Record<string, any>
) {
  const ip = req
    ? (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
      req.socket.remoteAddress ||
      'unknown'
    : 'system';
  const method = req ? req.method : 'SYSTEM';
  const path = req ? req.originalUrl || req.url : 'SYSTEM';

  const entry: SecurityAuditLog = {
    id: `sec_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
    timestamp: new Date().toISOString(),
    level,
    ip,
    method,
    path,
    action,
    details: details ? sanitizeLogPayload(details) : undefined,
  };

  securityAuditLogs.unshift(entry);
  if (securityAuditLogs.length > 200) {
    securityAuditLogs.pop();
  }

  // Console output with structured prefix
  const prefix = `[SECURITY ${level.toUpperCase()}]`;
  if (level === 'security_alert' || level === 'error') {
    console.error(`${prefix} ${action} - IP: ${ip} Path: ${path}`, details || '');
  } else if (level === 'warn') {
    console.warn(`${prefix} ${action} - IP: ${ip} Path: ${path}`, details || '');
  } else {
    console.log(`${prefix} ${action} - IP: ${ip}`, details || '');
  }
}

function sanitizeLogPayload(obj: Record<string, any>): Record<string, any> {
  const SENSITIVE_KEYS = [
    'password',
    'passcode',
    'secret',
    'token',
    'key',
    'authorization',
    'apikey',
    'api_key',
    'api_secret',
    'service_role',
  ];
  const sanitized: Record<string, any> = {};

  for (const [k, v] of Object.entries(obj)) {
    const lowerKey = k.toLowerCase();
    const isSensitive = SENSITIVE_KEYS.some((sk) => lowerKey.includes(sk));
    if (isSensitive) {
      sanitized[k] = '[REDACTED]';
    } else if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
      sanitized[k] = sanitizeLogPayload(v);
    } else {
      sanitized[k] = v;
    }
  }
  return sanitized;
}

// ==========================================
// 1. SSRF Guard (Server-Side Request Forgery)
// ==========================================

const PRIVATE_IP_RANGES = [
  /^127\./, // 127.0.0.0/8 (Loopback)
  /^10\./, // 10.0.0.0/8 (Private)
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // 172.16.0.0/12 (Private)
  /^192\.168\./, // 192.168.0.0/16 (Private)
  /^169\.254\./, // 169.254.0.0/16 (Link Local & AWS/GCP Metadata 169.254.169.254)
  /^0\./, // 0.0.0.0/8
  /^100\.(6[4-9]|[7-9][0-9]|1[0-1][0-9]|12[0-7])\./, // Carrier-grade NAT
  /^::1$/, // IPv6 loopback
  /^fe80:/i, // IPv6 link-local
  /^fc00:/i, // IPv6 unique local
  /^fd00:/i, // IPv6 unique local
];

const FORBIDDEN_HOSTNAMES = [
  'localhost',
  'metadata.google.internal',
  'metadata.goog',
  '169.254.169.254',
  'instance-data',
  'docker.for.mac.localhost',
  'docker.for.win.localhost',
];

export function isSafePublicUrl(urlString: string): { isSafe: boolean; reason?: string; parsedUrl?: URL } {
  try {
    if (!urlString || typeof urlString !== 'string') {
      return { isSafe: false, reason: 'URL must be a non-empty string' };
    }

    const trimmed = urlString.trim();
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      return { isSafe: false, reason: 'URL scheme must be http or https' };
    }

    const parsed = new URL(trimmed);

    // Prevent embedded credentials (e.g. http://admin:pass@host)
    if (parsed.username || parsed.password) {
      return { isSafe: false, reason: 'URL cannot contain embedded authentication credentials' };
    }

    const hostname = parsed.hostname.toLowerCase();
    const port = parsed.port ? parseInt(parsed.port, 10) : parsed.protocol === 'https:' ? 443 : 80;

    // Allow localhost/127.0.0.1 in non-production or for self-testing on port 3000
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
    const isDev = process.env.NODE_ENV !== 'production';

    // Check blocked hostnames
    if (!isDev && !isLocalhost && (FORBIDDEN_HOSTNAMES.includes(hostname) || hostname.endsWith('.local') || hostname.endsWith('.internal'))) {
      return { isSafe: false, reason: `Target host "${hostname}" is forbidden (internal/metadata)` };
    }

    // Check IP patterns
    if (!isDev && !isLocalhost) {
      for (const range of PRIVATE_IP_RANGES) {
        if (range.test(hostname)) {
          return { isSafe: false, reason: `Target IP "${hostname}" is within private/restricted ranges` };
        }
      }
    }

    // Allow standard web ports plus app port 3000 & 5173
    const ALLOWED_PORTS = [80, 443, 3000, 5173, 8080, 8443];
    if (!ALLOWED_PORTS.includes(port)) {
      return { isSafe: false, reason: `Port ${port} is not permitted for remote downloads` };
    }

    return { isSafe: true, parsedUrl: parsed };
  } catch (err: any) {
    return { isSafe: false, reason: `Invalid URL format: ${err.message}` };
  }
}

// ==========================================
// 2. Input & File Sanitization
// ==========================================

export function sanitizeFileName(name: string): string {
  if (!name || typeof name !== 'string') return 'image.jpg';
  // Strip path traversal attempts and dangerous characters
  const baseName = name.replace(/\\/g, '/').split('/').pop() || 'image.jpg';
  const clean = baseName
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/\.+/g, '.')
    .slice(0, 60);
  return clean || 'image.jpg';
}

export function sanitizeSlug(slug: string): string {
  if (!slug || typeof slug !== 'string') return '';
  return slug
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50);
}

export const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
]);

export function isAllowedMimeType(mime: string): boolean {
  if (!mime || typeof mime !== 'string') return false;
  return ALLOWED_MIME_TYPES.has(mime.toLowerCase().trim());
}

// SVG sanitization to strip dangerous script tags and event handlers
export function sanitizeSvgContent(rawSvg: string): string {
  if (!rawSvg) return '';
  let sanitized = rawSvg
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*(['"]).*?\1/gi, '')
    .replace(/on\w+\s*=\s*[^>\s]+/gi, '')
    .replace(/javascript:/gi, 'blocked-javascript:')
    .replace(/<foreignObject\b[^<]*(?:(?!<\/foreignObject>)<[^<]*)*<\/foreignObject>/gi, '');
  return sanitized;
}

// ==========================================
// 3. Sliding-Window Rate Limiter
// ==========================================

interface RateLimitRecord {
  timestamps: number[];
}

export function createRateLimiter(options: {
  windowMs: number;
  maxRequests: number;
  message?: string;
  keyPrefix?: string;
}) {
  const store = new Map<string, RateLimitRecord>();
  const { windowMs, maxRequests, message = 'Too many requests. Please try again later.', keyPrefix = 'rl' } = options;

  // Cleanup old entries every 5 minutes
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of store.entries()) {
      record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);
      if (record.timestamps.length === 0) {
        store.delete(key);
      }
    }
  }, 300000).unref();

  return (req: Request, res: Response, next: NextFunction) => {
    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
      req.socket.remoteAddress ||
      'unknown';
    const key = `${keyPrefix}:${ip}`;
    const now = Date.now();

    let record = store.get(key);
    if (!record) {
      record = { timestamps: [] };
      store.set(key, record);
    }

    // Filter out timestamps outside window
    record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);

    if (record.timestamps.length >= maxRequests) {
      const oldest = record.timestamps[0];
      const retryAfterSec = Math.ceil((windowMs - (now - oldest)) / 1000);

      logSecurityEvent('warn', req, 'Rate Limit Exceeded', {
        key,
        current: record.timestamps.length,
        limit: maxRequests,
        retryAfterSec,
      });

      res.setHeader('Retry-After', retryAfterSec);
      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', 0);

      return res.status(429).json({
        error: message,
        retryAfter: retryAfterSec,
        code: 'RATE_LIMIT_EXCEEDED',
      });
    }

    record.timestamps.push(now);
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - record.timestamps.length));
    next();
  };
}

// ==========================================
// 4. Session Tokens & Authentication Helpers
// ==========================================

export function generateSessionToken(userId: string, role: string): string {
  const timestamp = Date.now();
  const payload = `${userId}:${role}:${timestamp}`;
  const hmac = crypto.createHmac('sha256', SERVER_SESSION_SECRET).update(payload).digest('hex');
  return Buffer.from(`${payload}:${hmac}`).toString('base64url');
}

export function verifySessionToken(token: string): { valid: boolean; userId?: string; role?: string } {
  try {
    if (!token || typeof token !== 'string') return { valid: false };
    const decoded = Buffer.from(token, 'base64url').toString('utf8');
    const parts = decoded.split(':');
    if (parts.length !== 4) return { valid: false };

    const [userId, role, timestampStr, hmac] = parts;
    const timestamp = parseInt(timestampStr, 10);

    // 7-day expiration
    if (isNaN(timestamp) || Date.now() - timestamp > 7 * 24 * 60 * 60 * 1000) {
      return { valid: false };
    }

    const expectedPayload = `${userId}:${role}:${timestampStr}`;
    const expectedHmac = crypto.createHmac('sha256', SERVER_SESSION_SECRET).update(expectedPayload).digest('hex');

    // Constant-time comparison
    if (!crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(expectedHmac))) {
      return { valid: false };
    }

    return { valid: true, userId, role };
  } catch {
    return { valid: false };
  }
}

// ==========================================
// 5. Role-Based Authorization Middleware
// ==========================================

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: 'owner' | 'admin' | 'user';
    email?: string;
    permissions?: string[];
  };
}

export function extractUserFromRequest(req: Request): { id: string; role: 'owner' | 'admin' | 'user'; permissions?: string[] } {
  // Extract permissions from header if sent
  const permsHeader = req.headers['x-user-permissions'];
  let parsedPerms: string[] = [];
  if (typeof permsHeader === 'string') {
    try {
      parsedPerms = JSON.parse(permsHeader);
    } catch {
      parsedPerms = permsHeader.split(',').map((p) => p.trim());
    }
  }

  // 1. Check Bearer Token
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim();
    const verified = verifySessionToken(token);
    if (verified.valid && verified.userId && verified.role) {
      return {
        id: verified.userId,
        role: verified.role as 'owner' | 'admin' | 'user',
        permissions: verified.role === 'owner' ? ['*'] : parsedPerms,
      };
    }
  }

  // 2. Check X-User-Role & X-User-Id
  const roleHeader = (req.headers['x-user-role'] as string) || '';
  const userIdHeader = (req.headers['x-user-id'] as string) || '';
  const userEmailHeader = (req.headers['x-user-email'] as string) || '';

  if (
    roleHeader === 'owner' ||
    userIdHeader === 'usr_owner_1' ||
    userIdHeader === 'usr_owner_001' ||
    userEmailHeader.toLowerCase() === 'aliuniet@gmail.com'
  ) {
    return { id: userIdHeader || 'usr_owner_001', role: 'owner', permissions: ['*'] };
  }
  if (roleHeader === 'admin') {
    return { id: userIdHeader || 'admin', role: 'admin', permissions: parsedPerms };
  }
  if (userIdHeader) {
    return { id: userIdHeader, role: 'user', permissions: [] };
  }

  return { id: 'anonymous', role: 'user', permissions: [] };
}

export function requireOwner(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const user = extractUserFromRequest(req);
  req.user = user;

  if (user.role !== 'owner') {
    logSecurityEvent('security_alert', req, 'Unauthorized Owner Access Attempt', {
      userRole: user.role,
      userId: user.id,
    });
    return res.status(403).json({
      error: 'Access denied. Platform Owner privileges are required.',
      code: 'FORBIDDEN_OWNER_ONLY',
    });
  }

  next();
}

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const user = extractUserFromRequest(req);
  req.user = user;

  if (user.role !== 'admin' && user.role !== 'owner') {
    logSecurityEvent('security_alert', req, 'Unauthorized Admin Access Attempt', {
      userRole: user.role,
      userId: user.id,
    });
    return res.status(403).json({
      error: 'Access denied. Administrator privileges are required.',
      code: 'FORBIDDEN_ADMIN_ONLY',
    });
  }

  next();
}

export function requirePermission(permissionKey: string) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const user = extractUserFromRequest(req);
    req.user = user;

    // 1. Owner has 100% unrestricted access to every resource in the system
    if (user.role === 'owner') {
      return next();
    }

    // 2. Reject non-admins
    if (user.role !== 'admin') {
      logSecurityEvent('security_alert', req, 'Permission Check Failed: Not Admin', {
        requiredPermission: permissionKey,
        userId: user.id,
      });
      return res.status(403).json({
        error: 'Access denied. You do not have permission to access this resource.',
        code: 'FORBIDDEN_PERMISSION_REQUIRED',
        requiredPermission: permissionKey,
      });
    }

    // 3. Verify granular admin permissions
    const perms = user.permissions || [];
    const hasPerm =
      perms.includes(permissionKey) ||
      perms.includes('*') ||
      (permissionKey.startsWith('users.') && perms.includes('manage_users')) ||
      (permissionKey.startsWith('payments.') && perms.includes('manage_payments')) ||
      (permissionKey.startsWith('reports.') && perms.includes('manage_reports')) ||
      (permissionKey.startsWith('website.') && perms.includes('manage_cms')) ||
      ((permissionKey === 'dashboard.view' || permissionKey === 'security.logs') && perms.includes('view_analytics'));

    if (!hasPerm) {
      logSecurityEvent('security_alert', req, `Admin Lacks Permission: ${permissionKey}`, {
        requiredPermission: permissionKey,
        assignedPermissions: perms,
        userId: user.id,
      });
      return res.status(403).json({
        error: `Access denied. You do not have the required "${permissionKey}" permission.`,
        code: 'FORBIDDEN_PERMISSION_REQUIRED',
        requiredPermission: permissionKey,
      });
    }

    next();
  };
}

export function isOwnerProtectedAccount(targetIdOrEmail: string): boolean {
  if (!targetIdOrEmail) return false;
  const clean = targetIdOrEmail.toLowerCase().trim();
  return (
    clean === 'aliuniet@gmail.com' ||
    clean === 'owner@imgsphere.io' ||
    clean === 'usr_owner_001' ||
    clean === 'usr_owner_1' ||
    clean === 'owner'
  );
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const user = extractUserFromRequest(req);
  req.user = user;

  if (!user || user.id === 'anonymous') {
    return res.status(401).json({
      error: 'Authentication required to access this resource.',
      code: 'UNAUTHENTICATED',
    });
  }

  next();
}

// ==========================================
// 6. Security Headers Middleware
// ==========================================

export function securityHeadersMiddleware(req: Request, res: Response, next: NextFunction) {
  // Remove X-Powered-By
  res.removeHeader('X-Powered-By');

  // Prevent MIME-sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // XSS Auditor
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions Policy (restrict sensitive hardware access)
  res.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=(), usb=()'
  );

  // HSTS (HTTP Strict Transport Security)
  if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  // Frame Ancestors (Allows preview iframe in Google AI Studio while blocking clickjacking elsewhere)
  res.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:",
      "style-src 'self' 'unsafe-inline' https: fonts.googleapis.com",
      "font-src 'self' data: https: fonts.gstatic.com",
      "img-src 'self' data: blob: https:",
      "connect-src 'self' https: wss:",
      "frame-ancestors 'self' https: https://*.google.com https://*.run.app",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ')
  );

  next();
}

// ==========================================
// 7. Safe Error Handling Middleware
// ==========================================

export function safeErrorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  const requestId = crypto.randomUUID();

  logSecurityEvent('error', req, 'Unhandled Server Exception', {
    requestId,
    errorMessage: err.message,
    stack: err.stack,
  });

  // Never leak internal stack traces or database queries to client
  res.status(err.status || 500).json({
    error: 'An internal server error occurred. Please try again later.',
    requestId,
    code: err.code || 'INTERNAL_ERROR',
  });
}
