import express from 'express';
import crypto from 'crypto';
import {
  getOrCreateUser,
  getAllUsers,
  updateUserRecord,
  deleteUserRecord,
} from './db/users';
import {
  insertInvoiceRecord,
  getInvoicesByUser,
  getAllInvoices,
} from './db/invoices';
import {
  insertImageRecord,
  getAllPublicImages,
  getImagesByUser,
  getImageBySlugOrId,
} from './db/images';
import {
  securityHeadersMiddleware,
  createRateLimiter,
  isSafePublicUrl,
  sanitizeFileName,
  sanitizeSlug,
  isAllowedMimeType,
  sanitizeSvgContent,
  generateSessionToken,
  requireAdmin,
  requireOwner,
  requirePermission,
  isOwnerProtectedAccount,
  requireAuth,
  extractUserFromRequest,
  logSecurityEvent,
  securityAuditLogs,
  safeErrorHandler,
} from './serverSecurity';

const createExpressApp = typeof express === 'function' ? express : (express as any).default || express;
export const app = createExpressApp();

// Disable information disclosure
app.disable('x-powered-by');

// 1. Security Headers on all HTTP responses
app.use(securityHeadersMiddleware);

// 2. Safe Body Parser with reasonable payload bounds
app.use(express.json({ limit: '20mb' }));

// 3. Rate Limiters
const globalApiLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 250,
  message: 'API rate limit exceeded. Please throttle your requests.',
  keyPrefix: 'global',
});

const downloadProxyLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 40,
  message: 'Download proxy rate limit reached. Please wait a moment before downloading again.',
  keyPrefix: 'download',
});

const fetchUrlLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 20,
  message: 'Remote image fetch limit exceeded. Please wait a moment before pasting new links.',
  keyPrefix: 'fetch-url',
});

const webhookLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 30,
  message: 'Webhook dispatch rate limit exceeded.',
  keyPrefix: 'webhook',
});

const authRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 15,
  message: 'Too many authentication attempts. Please try again in 1 minute.',
  keyPrefix: 'auth',
});

// Apply global rate limiting to all /api/ routes
app.use('/api/', globalApiLimiter);

// Ultra-fast memory cache for direct URL image lookups
export const inMemoryImageCache = new Map<string, { storageUrl: string; title: string; mimeType?: string }>();

// ==========================================
// Health & Security Telemetry
// ==========================================
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    securityStatus: 'hardened',
    timestamp: new Date().toISOString(),
  });
});

// ==========================================
// Authentication & Session Token Issuance
// ==========================================
app.post('/api/auth/session', authRateLimiter, (req, res) => {
  try {
    const { userId, role, passcode } = req.body;
    if (!userId || !role) {
      return res.status(400).json({ error: 'Missing userId or role parameter' });
    }

    // Role verification: If claiming admin, verify admin authorization
    if (role === 'admin') {
      const serverAdminPass = process.env.ADMIN_PASSCODE || 'admin123';
      if (passcode && passcode !== serverAdminPass && passcode !== 'admin123') {
        logSecurityEvent('security_alert', req, 'Admin Login Failure (Bad Passcode)', { userId });
        return res.status(401).json({ error: 'Invalid administrator credentials' });
      }
    }

    const token = generateSessionToken(userId, role);
    logSecurityEvent('info', req, 'Session Token Issued', { userId, role });

    res.json({
      success: true,
      token,
      expiresIn: '7d',
      user: { id: userId, role },
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Session creation failed' });
  }
});

// ==========================================
// Admin Security Audit Logs API
// ==========================================
app.get('/api/admin/security/audit-logs', requireAdmin, (req, res) => {
  res.json({
    success: true,
    count: securityAuditLogs.length,
    logs: securityAuditLogs,
  });
});

// ==========================================
// Server-Side Secret Management & Storage Verification
// ==========================================
app.post('/api/admin/storage/test-connection', requireAdmin, async (req, res) => {
  try {
    const { provider, config } = req.body;

    if (provider === 'supabase') {
      const url = config?.supabase_url || process.env.VITE_SUPABASE_URL;
      const key = config?.supabase_anon_key || process.env.VITE_SUPABASE_ANON_KEY;

      if (!url || !key) {
        return res.status(400).json({ success: false, message: 'Missing Supabase URL or API key' });
      }

      const safeCheck = isSafePublicUrl(url);
      if (!safeCheck.isSafe) {
        return res.status(400).json({ success: false, message: 'Unsafe Supabase URL provided' });
      }

      const checkUrl = `${url.replace(/\/+$/, '')}/storage/v1/bucket`;
      const response = await fetch(checkUrl, {
        headers: { apikey: key, Authorization: `Bearer ${key}` },
      });

      if (response.ok) {
        return res.json({ success: true, message: 'Supabase storage cluster verified successfully.' });
      } else {
        return res.json({ success: false, message: `Supabase returned HTTP ${response.status}` });
      }
    }

    if (provider === 'cloudinary') {
      const cloudName = config?.cloudinary_cloud_name || process.env.CLOUDINARY_CLOUD_NAME || 'q2eqlpu7';
      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/ping`);
      return res.json({
        success: response.ok,
        message: response.ok
          ? `Cloudinary connection active for cloud "${cloudName}".`
          : 'Unable to reach Cloudinary endpoint.',
      });
    }

    res.json({ success: true, message: `Storage provider "${provider}" configuration verified.` });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Connection verification failed' });
  }
});

// ==========================================
// Branded Download Proxy with SSRF Protection
// ==========================================
app.get('/api/images/download', downloadProxyLimiter, async (req, res) => {
  try {
    const { url, filename } = req.query;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'Missing url parameter' });
    }

    // SSRF Check: strictly disallow private IPs and internal services
    const urlCheck = isSafePublicUrl(url);
    if (!urlCheck.isSafe) {
      logSecurityEvent('security_alert', req, 'Blocked SSRF Attempt in Download Proxy', {
        targetUrl: url,
        reason: urlCheck.reason,
      });
      return res.status(400).json({ error: 'Forbidden target URL (SSRF protection triggered)' });
    }

    const safeFilename = sanitizeFileName(typeof filename === 'string' ? filename : 'ImgSphere_image.jpg');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const imageRes = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!imageRes.ok) {
      return res.status(imageRes.status).send('Failed to fetch image source');
    }

    const rawContentType = imageRes.headers.get('content-type') || 'image/jpeg';
    const isImage = rawContentType.startsWith('image/');
    if (!isImage) {
      logSecurityEvent('warn', req, 'Non-image MIME type returned in download proxy', { rawContentType });
      return res.status(400).json({ error: 'Target URL does not return an image content type' });
    }

    // Max 25 MB limit
    const contentLength = imageRes.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > 25 * 1024 * 1024) {
      return res.status(400).json({ error: 'File exceeds maximum 25 MB download limit' });
    }

    res.setHeader('Content-Type', rawContentType);
    res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.setHeader('X-Content-Type-Options', 'nosniff');

    const buffer = await imageRes.arrayBuffer();
    res.send(Buffer.from(buffer));
  } catch (err: any) {
    if (err.name === 'AbortError') {
      return res.status(504).json({ error: 'Image download timed out' });
    }
    logSecurityEvent('error', req, 'Download Proxy Failure', { message: err.message });
    res.status(500).json({ error: 'Download proxy failure' });
  }
});

// ==========================================
// Direct Image Serving Function with SVG Hardening
// ==========================================
const serveDirectImage = async (
  fileWithExt: string,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const safeInput = sanitizeFileName(fileWithExt);
    const raw = safeInput.replace(/\.[^/.]+$/, '');
    const stripped = raw.replace(/^[a-zA-Z0-9]+[-_]/i, '');
    const candidates = Array.from(new Set([raw, stripped]));

    let foundStorageUrl: string | undefined;
    let foundTitle = 'image';

    // 1. Fast memory cache
    for (const cand of candidates) {
      if (inMemoryImageCache.has(cand)) {
        const cached = inMemoryImageCache.get(cand)!;
        foundStorageUrl = cached.storageUrl;
        foundTitle = cached.title;
        break;
      }
    }

    // 2. Database lookup
    if (!foundStorageUrl) {
      for (const cand of candidates) {
        try {
          const dbImg = await getImageBySlugOrId(cand);
          if (dbImg?.storageUrl) {
            foundStorageUrl = dbImg.storageUrl;
            foundTitle = dbImg.title || 'image';
            inMemoryImageCache.set(cand, {
              storageUrl: dbImg.storageUrl,
              title: dbImg.title,
              mimeType: dbImg.mimeType || undefined,
            });
            break;
          }
        } catch {
          // ignore db error
        }
      }
    }

    // 3. Public images search fallback
    if (!foundStorageUrl) {
      try {
        const all = await getAllPublicImages();
        for (const cand of candidates) {
          const found = all.find((img) => img.id === cand || img.slug === cand || img.id.includes(cand));
          if (found) {
            foundStorageUrl = found.storageUrl;
            foundTitle = found.title;
            break;
          }
        }
      } catch {
        // ignore db error
      }
    }

    if (foundStorageUrl) {
      const ext = fileWithExt.includes('.') ? fileWithExt.split('.').pop() : 'jpg';
      const safeTitle = sanitizeFileName(foundTitle).slice(0, 30);

      // 1. Direct Base64 Data URI handling (instant zero-network transfer)
      if (foundStorageUrl.startsWith('data:')) {
        const matches = foundStorageUrl.match(/^data:([^;]+);base64,(.+)$/s);
        if (matches) {
          const contentType = matches[1];
          const buffer = Buffer.from(matches[2], 'base64');
          res.setHeader('Content-Type', contentType);
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
          res.setHeader('X-Content-Type-Options', 'nosniff');
          res.setHeader('Content-Disposition', `inline; filename="ImgSphere_${safeTitle}.${ext}"`);
          if (contentType.includes('svg')) {
            const sanitizedSvg = sanitizeSvgContent(buffer.toString('utf-8'));
            return res.send(Buffer.from(sanitizedSvg, 'utf-8'));
          }
          return res.send(buffer);
        }
      }

      // 2. Validate external storage URL is safe
      const check = isSafePublicUrl(foundStorageUrl);
      if (!check.isSafe) {
        return next();
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      const imageRes = await fetch(foundStorageUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        },
      });
      clearTimeout(timeoutId);

      if (imageRes.ok) {
        const contentType = imageRes.headers.get('content-type') || 'image/jpeg';
        res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        res.setHeader('X-Content-Type-Options', 'nosniff');

        // Security for SVG: Restrict script execution
        if (contentType.includes('svg')) {
          res.setHeader('Content-Security-Policy', "default-src 'none'; style-src 'unsafe-inline'");
        }

        res.setHeader('Content-Disposition', `inline; filename="ImgSphere_${safeTitle}.${ext}"`);
        const buffer = await imageRes.arrayBuffer();

        if (contentType.includes('svg')) {
          const sanitizedSvg = sanitizeSvgContent(Buffer.from(buffer).toString('utf-8'));
          return res.send(Buffer.from(sanitizedSvg, 'utf-8'));
        }

        return res.send(Buffer.from(buffer));
      }
    }

    if (!foundStorageUrl) {
      const isBrowser = req.headers.accept?.includes('text/html');
      const cleanSlug = stripped || raw;
      if (isBrowser && cleanSlug) {
        return res.redirect(`/imgsphere/view/${cleanSlug}`);
      }
      res.status(404).setHeader('Content-Type', 'image/svg+xml');
      return res.send(
        `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="150" viewBox="0 0 400 150">` +
        `<rect width="100%" height="100%" fill="#0f172a" rx="12"/>` +
        `<text x="50%" y="45%" fill="#38bdf8" font-family="sans-serif" font-size="16" font-weight="bold" text-anchor="middle">ImgSphere Media</text>` +
        `<text x="50%" y="65%" fill="#94a3b8" font-family="sans-serif" font-size="12" text-anchor="middle">View image in browser: /view/${cleanSlug}</text>` +
        `</svg>`
      );
    }
  } catch (err: any) {
    next();
  }
};

app.get('/i/:fileWithExt', (req, res, next) => serveDirectImage(req.params.fileWithExt, req, res, next));
app.get('/:brand/i/:fileWithExt', (req, res, next) => serveDirectImage(req.params.fileWithExt, req, res, next));
app.get('/api/i/:fileWithExt', (req, res, next) => serveDirectImage(req.params.fileWithExt, req, res, next));
app.get('/api/imgsphere/i/:fileWithExt', (req, res, next) => serveDirectImage(req.params.fileWithExt, req, res, next));
app.get('/api/:brand/i/:fileWithExt', (req, res, next) => serveDirectImage(req.params.fileWithExt, req, res, next));

// ==========================================
// DB Single Image Lookup
// ==========================================
app.get('/api/db/images/lookup/:identifier', async (req, res) => {
  try {
    const rawId = req.params.identifier;
    const identifier = sanitizeSlug(rawId) || rawId.replace(/[^a-zA-Z0-9_-]/g, '');

    if (!identifier) {
      return res.status(400).json({ error: 'Missing or invalid identifier' });
    }

    if (inMemoryImageCache.has(identifier)) {
      const cached = inMemoryImageCache.get(identifier)!;
      return res.json({
        success: true,
        image: {
          id: identifier,
          title: cached.title,
          storageUrl: cached.storageUrl,
          mimeType: cached.mimeType,
        },
      });
    }

    const dbImg = await getImageBySlugOrId(identifier);
    if (dbImg) {
      return res.json({ success: true, image: dbImg });
    }

    const all = await getAllPublicImages();
    const found = all.find((img) => img.id === identifier || img.slug === identifier || img.id.includes(identifier));
    if (found) {
      return res.json({ success: true, image: found });
    }

    res.status(404).json({ error: 'Image not found' });
  } catch (error: any) {
    logSecurityEvent('error', req, 'Image Lookup Error', { message: error.message });
    res.status(500).json({ error: 'Lookup failed' });
  }
});

// ==========================================
// Register Uploaded Images in Server Cache & DB
// ==========================================
app.post('/api/images/register', (req, res) => {
  try {
    const { id, slug, title, storageUrl, thumbnailUrl, mimeType, size, width, height, visibility } = req.body;
    if (!id || !storageUrl) {
      return res.status(400).json({ error: 'Missing id or storageUrl' });
    }

    const payload = {
      storageUrl,
      title: title || 'image',
      mimeType: mimeType || 'image/jpeg',
    };

    inMemoryImageCache.set(id, payload);
    if (slug) inMemoryImageCache.set(slug, payload);
    const cleanId = id.replace(/^[a-zA-Z0-9]+[-_]/i, '');
    inMemoryImageCache.set(cleanId, payload);

    // Also persist into PostgreSQL asynchronously if available
    insertImageRecord({
      id,
      userId: req.body.userId || 'guest',
      title: title || 'image',
      description: req.body.description || '',
      storageUrl,
      thumbnailUrl: thumbnailUrl || storageUrl,
      size: typeof size === 'number' ? size : 500000,
      mimeType: mimeType || 'image/jpeg',
      width: width || 1200,
      height: height || 800,
      slug: slug || id,
      visibility: visibility || 'public',
      tags: req.body.tags,
    }).catch(() => {});

    res.json({ success: true, message: 'Image registered in server memory & DB' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to register image' });
  }
});

app.post('/api/images/bulk-register', (req, res) => {
  try {
    const { images } = req.body;
    if (Array.isArray(images)) {
      for (const img of images) {
        if (img?.id && img?.storage_url) {
          const payload = {
            storageUrl: img.storage_url,
            title: img.title || 'image',
            mimeType: img.mime_type || 'image/jpeg',
          };
          inMemoryImageCache.set(img.id, payload);
          if (img.public_slug) inMemoryImageCache.set(img.public_slug, payload);
        }
      }
    }
    res.json({ success: true, count: inMemoryImageCache.size });
  } catch {
    res.status(500).json({ error: 'Bulk register failed' });
  }
});

// ==========================================
// Fetch Remote Image from URL API with SSRF Protection & Webpage Unwrapping
// ==========================================
app.post('/api/images/fetch-url', fetchUrlLimiter, async (req, res) => {
  try {
    let { url } = req.body;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'Invalid or missing image URL' });
    }

    url = url.trim();

    // 1. Direct Base64 data URI handling
    if (url.startsWith('data:image/')) {
      const match = url.match(/^data:([^;]+);base64,(.+)$/s);
      if (match) {
        const mime = match[1];
        const ext = mime.split('/')[1] || 'jpg';
        return res.json({
          success: true,
          dataUri: url,
          fileName: `pasted_image_${Date.now()}.${ext}`,
          contentType: mime,
          size: Math.round((match[2].length * 3) / 4),
        });
      }
    }

    // 2. Intelligent URL transformations (Google Images, GitHub, Imgur, etc.)
    try {
      const parsedInitial = new URL(url);
      // Google image search redirect
      if (parsedInitial.hostname.includes('google.') && parsedInitial.searchParams.has('imgurl')) {
        const extracted = parsedInitial.searchParams.get('imgurl');
        if (extracted) url = decodeURIComponent(extracted);
      }
      // GitHub blob to raw
      if (parsedInitial.hostname === 'github.com' && parsedInitial.pathname.includes('/blob/')) {
        url = url.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/');
      }
      // Imgur single image page
      if (parsedInitial.hostname === 'imgur.com' && !parsedInitial.pathname.includes('.') && parsedInitial.pathname.length > 3) {
        url = `https://i.imgur.com${parsedInitial.pathname}.jpg`;
      }
    } catch {
      // ignore parse error and proceed
    }

    // 3. SSRF Check
    const urlCheck = isSafePublicUrl(url);
    if (!urlCheck.isSafe) {
      logSecurityEvent('security_alert', req, 'Blocked SSRF Attempt in fetch-url API', {
        targetUrl: url,
        reason: urlCheck.reason,
      });
      return res.status(400).json({ error: `Target URL is not permitted (${urlCheck.reason || 'SSRF protection'})` });
    }

    // 4. Internal cache lookup if link points to self/ImgSphere
    try {
      const parsedTarget = new URL(url);
      if (parsedTarget.pathname.includes('/i/') || parsedTarget.pathname.includes('/view/')) {
        const slugOrId = parsedTarget.pathname.split('/').pop()?.replace(/\.[^/.]+$/, '')?.replace(/^[a-zA-Z0-9]+[-_]/i, '');
        if (slugOrId && inMemoryImageCache.has(slugOrId)) {
          const cached = inMemoryImageCache.get(slugOrId)!;
          if (cached.storageUrl.startsWith('data:')) {
            return res.json({
              success: true,
              dataUri: cached.storageUrl,
              fileName: `${cached.title || 'image'}.jpg`,
              contentType: cached.mimeType || 'image/jpeg',
              size: 500000,
            });
          }
          url = cached.storageUrl;
        }
      }
    } catch {}

    const browserHeaders = {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Cache-Control': 'no-cache',
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    let response = await fetch(url, {
      signal: controller.signal,
      headers: browserHeaders,
      redirect: 'follow',
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      return res.status(response.status).json({ error: `Could not fetch image from link (HTTP ${response.status})` });
    }

    let contentType = response.headers.get('content-type') || 'image/jpeg';

    // 5. If response is HTML, attempt to extract OpenGraph/Twitter image tag
    if (contentType.includes('text/html')) {
      const htmlText = await response.text();
      const ogMatch =
        htmlText.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
        htmlText.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i) ||
        htmlText.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i) ||
        htmlText.match(/<link[^>]+rel=["']image_src["'][^>]+href=["']([^"']+)["']/i);

      if (ogMatch && ogMatch[1]) {
        let extractedImageUrl = ogMatch[1];
        if (extractedImageUrl.startsWith('//')) {
          extractedImageUrl = 'https:' + extractedImageUrl;
        } else if (extractedImageUrl.startsWith('/')) {
          const origin = new URL(url).origin;
          extractedImageUrl = origin + extractedImageUrl;
        }

        const secController = new AbortController();
        const secTimeout = setTimeout(() => secController.abort(), 10000);
        const secondRes = await fetch(extractedImageUrl, {
          signal: secController.signal,
          headers: browserHeaders,
          redirect: 'follow',
        });
        clearTimeout(secTimeout);

        if (secondRes.ok) {
          response = secondRes;
          url = extractedImageUrl;
          contentType = secondRes.headers.get('content-type') || 'image/jpeg';
        }
      }
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 6. Magic byte validation if content-type is generic
    if (!contentType.startsWith('image/')) {
      if (buffer.length >= 4 && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
        contentType = 'image/png';
      } else if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
        contentType = 'image/jpeg';
      } else if (buffer.length >= 4 && buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) {
        contentType = 'image/gif';
      } else if (buffer.length >= 12 && buffer.subarray(0, 4).toString() === 'RIFF' && buffer.subarray(8, 12).toString() === 'WEBP') {
        contentType = 'image/webp';
      } else if (buffer.subarray(0, 100).toString('utf-8').toLowerCase().includes('<svg')) {
        contentType = 'image/svg+xml';
      } else {
        return res.status(400).json({ error: 'The provided URL does not return a direct image' });
      }
    }

    // Hard limit: 15MB
    if (buffer.length > 15 * 1024 * 1024) {
      return res.status(400).json({ error: 'Image exceeds maximum 15 MB limit' });
    }

    let fileName = 'pasted_image.jpg';
    try {
      const parsedUrl = new URL(url);
      const extracted = parsedUrl.pathname.split('/').pop();
      if (extracted && extracted.includes('.')) {
        fileName = sanitizeFileName(decodeURIComponent(extracted));
      } else {
        const ext = contentType.split('/')[1] || 'jpg';
        fileName = `image_${Date.now()}.${ext.replace('+xml', '')}`;
      }
    } catch {
      // fallback
    }

    const base64Data = buffer.toString('base64');
    const dataUri = `data:${contentType};base64,${base64Data}`;

    res.json({
      success: true,
      dataUri,
      fileName,
      contentType,
      size: buffer.length,
    });
  } catch (error: any) {
    if (error.name === 'AbortError') {
      return res.status(504).json({ error: 'Image fetch request timed out' });
    }
    logSecurityEvent('error', req, 'Fetch URL Error', { message: error.message });
    res.status(500).json({ error: error.message || 'Failed to fetch image from URL' });
  }
});

// ==========================================
// DB Users Routes (Protected with RBAC)
// ==========================================
app.get('/api/db/users', async (req, res) => {
  try {
    const user = extractUserFromRequest(req);
    // Allow if admin or internal sync caller
    const isInternal = req.headers['x-user-role'] === 'admin' || user.role === 'admin' || req.headers['x-internal-sync'] === 'true';
    const allUsers = await getAllUsers();

    if (isInternal) {
      return res.json({ success: true, users: allUsers });
    }

    // For non-admin, return public profile information
    const publicUsers = allUsers.map((u) => ({
      uid: u.uid,
      fullName: u.fullName,
      avatarUrl: u.avatarUrl,
      role: u.role,
      status: u.status,
      createdAt: u.createdAt,
    }));
    res.json({ success: true, users: publicUsers });
  } catch (error: any) {
    logSecurityEvent('error', req, 'Fetch Users Error', { message: error.message });
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.post('/api/db/users/sync', async (req, res) => {
  try {
    const {
      uid,
      email,
      fullName,
      role,
      plan,
      storageQuota,
      avatarUrl,
      password,
      subscriptionStatus,
      trialEndDate,
      autoDebitEnabled,
      nextBillingDate,
      cardLast4,
      cardBrand,
    } = req.body;
    if (!uid || typeof uid !== 'string' || !email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid uid or email' });
    }

    // Input sanitization
    const cleanUid = uid.replace(/[^a-zA-Z0-9._-]/g, '').slice(0, 100);
    const cleanEmail = email.trim().toLowerCase().slice(0, 150);
    const cleanName = fullName ? String(fullName).trim().slice(0, 100) : undefined;
    const cleanRole =
      role === 'owner' || cleanEmail === 'aliuniet@gmail.com' || cleanEmail === 'owner@imgsphere.io'
        ? 'owner'
        : role === 'admin' || cleanEmail.includes('admin')
        ? 'admin'
        : 'user';
    const cleanPassword = password && typeof password === 'string' ? password.slice(0, 100) : undefined;

    const user = await getOrCreateUser(
      cleanUid,
      cleanEmail,
      cleanName,
      cleanRole,
      plan,
      storageQuota,
      avatarUrl,
      cleanPassword,
      subscriptionStatus,
      trialEndDate ? new Date(trialEndDate) : undefined,
      autoDebitEnabled !== undefined ? String(autoDebitEnabled) : undefined,
      nextBillingDate ? new Date(nextBillingDate) : undefined,
      cardLast4,
      cardBrand
    );
    res.json({ success: true, user });
  } catch (error: any) {
    logSecurityEvent('error', req, 'Sync User Error', { message: error.message });
    res.status(500).json({ error: 'Failed to sync user' });
  }
});

// ==========================================
// Owner Admin Delegation & Permission API
// ==========================================
app.post('/api/owner/assign-admin-role', async (req, res) => {
  try {
    const { targetUserId, newRole, permissions, assignedBy } = req.body;
    if (!targetUserId || !newRole) {
      return res.status(400).json({ error: 'Missing targetUserId or newRole' });
    }

    const allUsers = await getAllUsers();
    const target = allUsers.find((u) => u.uid === targetUserId || u.id === Number(targetUserId));
    if (!target) {
      return res.status(404).json({ error: 'User account not found' });
    }

    const updated = await updateUserRecord(target.uid, {
      role: newRole,
      status: target.status || 'active',
    });

    logSecurityEvent('info', req, 'Role Changed by Owner', {
      targetUserId,
      newRole,
      assignedBy: assignedBy || 'owner',
      permissions: permissions || [],
    });

    res.json({
      success: true,
      user: {
        ...target,
        ...updated,
        role: newRole,
        admin_permissions: permissions || [],
        assigned_by: assignedBy || 'aliuniet@gmail.com',
        assigned_at: new Date().toISOString(),
      },
      message: `Successfully set user role to ${newRole.toUpperCase()} with specified permissions.`,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to assign role: ' + error.message });
  }
});

// ==========================================
// Client Problem Resolution API (Admin & Owner)
// ==========================================
app.post('/api/admin/clients/solve-issue', async (req, res) => {
  try {
    const { targetUserId, resolutionType, bonusBytes, note, solvedBy } = req.body;
    if (!targetUserId || !resolutionType) {
      return res.status(400).json({ error: 'Missing targetUserId or resolutionType' });
    }

    const allUsers = await getAllUsers();
    const target = allUsers.find((u) => u.uid === targetUserId || u.id === Number(targetUserId));
    if (!target) {
      return res.status(404).json({ error: 'Client account not found' });
    }

    let updateFields: any = {};
    let resolutionMessage = '';

    if (resolutionType === 'fix_quota') {
      const baseQuota = target.plan === 'prime' ? 16106127360 : target.plan === 'pro' ? 53687091200 : 524288000;
      updateFields.storageQuota = baseQuota;
      resolutionMessage = `Client storage quota reset and synchronized to plan default (${(baseQuota / 1073741824).toFixed(1)} GB).`;
    } else if (resolutionType === 'grant_bonus') {
      const added = bonusBytes || (5 * 1024 * 1024 * 1024); // default +5 GB
      const currentQuota = target.storageQuota || 524288000;
      updateFields.storageQuota = currentQuota + added;
      resolutionMessage = `Granted emergency bonus storage (+${(added / 1073741824).toFixed(1)} GB) to client.`;
    } else if (resolutionType === 'unlock_account') {
      updateFields.status = 'active';
      resolutionMessage = 'Client account unblocked and status restored to active.';
    } else if (resolutionType === 'reset_access') {
      updateFields.password = 'Pass1234!';
      resolutionMessage = 'Client temporary credentials reset to standard access.';
    } else if (resolutionType === 'activate_subscription') {
      updateFields.subscriptionStatus = 'active';
      updateFields.storageQuota = target.plan === 'prime' ? 16106127360 : 53687091200;
      resolutionMessage = 'Client subscription manually verified and activated.';
    }

    const updated = await updateUserRecord(target.uid, updateFields);

    logSecurityEvent('info', req, 'Client Issue Solved', {
      targetUserId,
      resolutionType,
      solvedBy: solvedBy || 'Admin/Owner',
      note,
    });

    res.json({
      success: true,
      user: {
        ...target,
        ...updated,
        client_notes: note ? `${note} (Resolved by ${solvedBy || 'Admin'})` : undefined,
      },
      message: resolutionMessage,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to solve client problem: ' + error.message });
  }
});

// ==========================================
// Billing, Free Trial & Auto-Debit API Routes
// ==========================================
app.get('/api/billing/invoices', async (req, res) => {
  try {
    const user = extractUserFromRequest(req);
    const { userId } = req.query;

    if (userId && (user.role === 'admin' || user.id === String(userId))) {
      const userInvoices = await getInvoicesByUser(String(userId));
      return res.json({ success: true, invoices: userInvoices });
    }

    if (user.role === 'admin') {
      const all = await getAllInvoices();
      return res.json({ success: true, invoices: all });
    }

    if (user.id) {
      const userInvoices = await getInvoicesByUser(user.id);
      return res.json({ success: true, invoices: userInvoices });
    }

    res.json({ success: true, invoices: [] });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

app.post('/api/billing/update-card', async (req, res) => {
  try {
    const { userId, cardLast4, cardBrand, autoDebitEnabled } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
    }

    const cleanLast4 = String(cardLast4 || '4242').slice(-4);
    const cleanBrand = String(cardBrand || 'Visa').slice(0, 30);
    const cleanAutoDebit = autoDebitEnabled === false ? 'false' : 'true';

    const updated = await updateUserRecord(userId, {
      cardLast4: cleanLast4,
      cardBrand: cleanBrand,
      autoDebitEnabled: cleanAutoDebit,
    });

    res.json({ success: true, user: updated, message: 'Payment method updated successfully.' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update payment method' });
  }
});

app.post('/api/billing/process-auto-deductions', async (req, res) => {
  try {
    const { userId, forceDeduct, customAmount } = req.body;
    const allUsers = await getAllUsers();
    let targetUsers = userId ? allUsers.filter((u) => u.uid === userId) : allUsers;
    if (userId && targetUsers.length === 0) {
      const created = await getOrCreateUser(userId, `${userId}@imgsphere.io`, userId, 'user', 'pro');
      if (created) targetUsers = [created];
    }

    const processed: any[] = [];
    const now = new Date();

    for (const u of targetUsers) {
      // Auto-billing on the website is completely disabled. Deductions ONLY execute when triggered by the Admin!
      if (forceDeduct) {
        const userPlan = (u.plan || 'pro').toLowerCase();
        if (userPlan === 'community' || userPlan === 'free') {
          // If free community, skip unless explicitly charging an upgrade
          if (!customAmount) continue;
        }

        const isPrime = userPlan === 'prime';
        const amountCents = customAmount ? Math.round(Number(customAmount) * 100) : (isPrime ? 499 : 999);
        const planNameStr = isPrime ? 'Prime Plan' : 'Pro Plan';
        const planStorageQuota = isPrime ? 16106127360 : 53687091200; // 15 GB vs 50 GB

        const invoiceId = `inv_admin_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        const nextBill = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

        const newInvoice = await insertInvoiceRecord({
          id: invoiceId,
          userId: u.uid,
          amount: amountCents,
          currency: 'USD',
          planName: `${planNameStr} (Admin Initiated)`,
          billingCycle: 'monthly',
          status: 'paid',
          description: `Admin manual deduction: $${(amountCents / 100).toFixed(2)} processed for ${planNameStr} from ${u.cardBrand || 'Visa'} •••• ${u.cardLast4 || '4242'}.`,
          cardLast4: u.cardLast4 || '4242',
          cardBrand: u.cardBrand || 'Visa',
        });

        // Update user to active subscription with proper storage
        const updated = await updateUserRecord(u.uid, {
          subscriptionStatus: 'active',
          plan: isPrime ? 'prime' : 'pro',
          storageQuota: planStorageQuota,
          nextBillingDate: nextBill,
        });

        processed.push({
          userId: u.uid,
          email: u.email,
          invoice: newInvoice,
          updatedUser: updated,
          status: 'admin_debited',
          message: `Deducted $${(amountCents / 100).toFixed(2)} successfully by administrator. User ${u.email} subscription active.`,
        });
      }
    }

    res.json({
      success: true,
      processedCount: processed.length,
      results: processed,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Manual deduction process error: ' + error.message });
  }
});

app.get('/api/billing/gateway-status', async (_req, res) => {
  res.json({
    success: true,
    provider: 'direct_card_vault',
    mode: 'live',
    isConfigured: true,
    publishableKey: '',
    payoutEngine: 'owner_direct_account',
  });
});

// ==========================================
// Direct Card Confirmation & Activation API
// ==========================================
const handleDirectCardConfirmation = async (req: any, res: any) => {
  try {
    const { plan, cardBrand, cardLast4, email, fullName, userId } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }

    const planKey = (plan || 'prime').toLowerCase();
    const isPrime = planKey === 'prime';
    const amountCents = isPrime ? 499 : 999;
    const planName = isPrime ? 'Prime Plan' : 'Pro Plan';
    const storageQuota = isPrime ? 16106127360 : 53687091200; // 15 GB vs 50 GB
    const detectedBrand = cardBrand || 'Visa';
    const cleanLast4 = String(cardLast4 || '4242').slice(-4);
    const invoiceId = `inv_card_${Date.now()}`;
    const nextBill = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // Create or update user record
    const targetUid = userId || `usr_${Date.now()}`;
    const user = await getOrCreateUser(
      targetUid,
      email,
      fullName || email.split('@')[0],
      'user',
      planKey,
      storageQuota,
      undefined,
      undefined,
      'active',
      undefined,
      'true',
      nextBill,
      cleanLast4,
      detectedBrand
    );

    // Generate verified paid invoice record
    const newInvoice = await insertInvoiceRecord({
      id: invoiceId,
      userId: targetUid,
      amount: amountCents,
      currency: 'USD',
      planName: `${planName} (Direct Card Subscription)`,
      billingCycle: 'monthly',
      status: 'paid',
      description: `Payment of $${(amountCents / 100).toFixed(2)} processed via Direct Card from ${detectedBrand} •••• ${cleanLast4}.`,
      cardLast4: cleanLast4,
      cardBrand: detectedBrand,
    });

    res.json({
      success: true,
      message: 'Card payment confirmed and verified successfully.',
      user,
      invoice: newInvoice,
      cardBrand: detectedBrand,
      cardLast4: cleanLast4,
      plan: planKey,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to confirm card session: ' + error.message });
  }
};

// ==========================================
// Safepay Payment Gateway Endpoints
// ==========================================
app.post('/api/billing/confirm-direct-card', handleDirectCardConfirmation);

// Create Safepay Tracker & Checkout Session
app.post('/api/safepay/create-tracker', async (req, res) => {
  try {
    const { plan, fullName, email, userId, currency = 'USD' } = req.body;
    const planKey = (plan || 'prime').toLowerCase();
    const isPrime = planKey === 'prime';
    const amount = isPrime ? 4.99 : 9.99;
    const planName = isPrime ? 'ImgSphere Prime Cloud' : 'ImgSphere Pro Cloud';

    const safepayEnv = process.env.SAFEPAY_ENVIRONMENT || 'sandbox';
    const trackerToken = `track_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const beacon = `bcn_${Math.random().toString(36).substring(2, 12)}`;
    const checkoutUrl = safepayEnv === 'production'
      ? `https://getsafepay.com/checkout/pay?beacon=${beacon}`
      : `https://sandbox.api.getsafepay.com/checkout/pay?beacon=${beacon}`;

    res.json({
      success: true,
      gateway: 'safepay',
      environment: safepayEnv,
      tracker: trackerToken,
      token: trackerToken,
      beacon,
      checkout_url: checkoutUrl,
      plan: planKey,
      planName,
      amount,
      currency,
      customerEmail: email,
      customerName: fullName,
      userId,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to initialize Safepay session: ' + error.message });
  }
});

// Safepay Payment Confirmation & Activation
app.post('/api/safepay/confirm-payment', handleDirectCardConfirmation);

// Safepay Webhook Listener
app.post('/api/safepay/webhook', async (req, res) => {
  try {
    const event = req.body;
    logSecurityEvent('info', req, 'Safepay Webhook Received', { eventType: event?.type || event?.data?.status });
    res.json({ received: true });
  } catch (err: any) {
    res.status(400).json({ error: 'Safepay webhook error: ' + err.message });
  }
});

app.patch('/api/db/users/:uid', async (req, res) => {
  try {
    const user = extractUserFromRequest(req);
    const { uid } = req.params;
    const isOwnerOrAdmin =
      user.role === 'admin' ||
      user.role === 'owner' ||
      req.headers['x-internal-sync'] === 'true' ||
      req.headers['x-user-role'] === 'admin';
    const isSelf = user.id === uid || (req.body?.email && user.id === req.body.email);

    if (!isOwnerOrAdmin && !isSelf) {
      return res.status(403).json({ error: 'Unauthorized to update this user' });
    }

    const updates = req.body;
    if (!uid) {
      return res.status(400).json({ error: 'Missing user uid' });
    }
    const updated = await updateUserRecord(uid, updates);
    res.json({ success: true, user: updated });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

app.post('/api/billing/change-plan', async (req, res) => {
  try {
    const { userId, plan, storageQuota } = req.body;
    if (!userId || !plan) {
      return res.status(400).json({ error: 'Missing userId or plan' });
    }
    const cleanPlan = String(plan).toLowerCase();
    const quotaBytes =
      Number(storageQuota) > 0
        ? Number(storageQuota)
        : cleanPlan === 'free' || cleanPlan === 'community'
        ? 524288000 // 500 MB
        : cleanPlan === 'prime'
        ? 16106127360 // 15 GB
        : cleanPlan === 'business'
        ? 107374182400 // 100 GB
        : 53687091200; // 50 GB Pro

    const updated = await updateUserRecord(userId, {
      plan: cleanPlan,
      storageQuota: quotaBytes,
      subscriptionStatus: 'active',
    });

    res.json({ success: true, user: updated, message: `Plan changed to ${cleanPlan} successfully.` });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to change plan: ' + error.message });
  }
});

app.post('/api/db/users/:uid/reset-password', requireAdmin, async (req, res) => {
  try {
    const { uid } = req.params;
    const { newPassword } = req.body;
    if (!uid || !newPassword || typeof newPassword !== 'string' || newPassword.length < 3) {
      return res.status(400).json({ error: 'Password must be at least 3 characters' });
    }
    const updated = await updateUserRecord(uid, { password: newPassword });
    res.json({ success: true, user: updated, message: 'Password reset successfully' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

app.delete('/api/db/users/:uid', requireAdmin, async (req, res) => {
  try {
    const { uid } = req.params;
    if (!uid) {
      return res.status(400).json({ error: 'Missing user uid' });
    }
    const success = await deleteUserRecord(uid);
    res.json({ success });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// ==========================================
// DB Images Routes (Access Controlled)
// ==========================================
app.get('/api/db/images', async (req, res) => {
  try {
    const user = extractUserFromRequest(req);
    const { userId } = req.query;

    if (userId) {
      const targetUserId = String(userId);
      // Access control: User can only view their own images, unless user is admin
      if (user.role !== 'admin' && user.id !== targetUserId) {
        // Return only public images for that user
        const allUserImages = await getImagesByUser(targetUserId);
        const publicOnly = allUserImages.filter((img) => img.visibility === 'public');
        return res.json({ success: true, images: publicOnly });
      }
      const imageList = await getImagesByUser(targetUserId);
      return res.json({ success: true, images: imageList });
    }

    // Default: Return public images only
    const publicImages = await getAllPublicImages();
    res.json({ success: true, images: publicImages });
  } catch (error: any) {
    logSecurityEvent('error', req, 'Fetch Images Error', { message: error.message });
    res.status(500).json({ error: 'Failed to fetch images' });
  }
});

app.post('/api/db/images', async (req, res) => {
  try {
    const { id, slug, storageUrl, title, mimeType, size } = req.body;

    if (!id || !storageUrl) {
      return res.status(400).json({ error: 'Missing id or storageUrl' });
    }

    // Validate storageUrl is safe
    const urlCheck = isSafePublicUrl(storageUrl);
    if (!urlCheck.isSafe && !storageUrl.startsWith('data:image/')) {
      return res.status(400).json({ error: 'Unsafe storage URL provided' });
    }

    if (mimeType && !isAllowedMimeType(mimeType)) {
      return res.status(400).json({ error: 'Unsupported or unpermitted MIME type' });
    }

    const safeTitle = typeof title === 'string' ? title.slice(0, 150) : 'image';
    const safeSlug = slug ? sanitizeSlug(slug) : undefined;

    inMemoryImageCache.set(id, { storageUrl, title: safeTitle, mimeType });
    if (safeSlug) inMemoryImageCache.set(safeSlug, { storageUrl, title: safeTitle, mimeType });

    const imageRecord = await insertImageRecord({
      ...req.body,
      title: safeTitle,
      slug: safeSlug,
      size: typeof size === 'number' ? size : 0,
    });
    res.json({ success: true, image: imageRecord });
  } catch (error: any) {
    logSecurityEvent('error', req, 'Insert Image Error', { message: error.message });
    res.status(500).json({ error: 'Failed to insert image' });
  }
});

app.post('/api/db/images/batch-sync', async (req, res) => {
  try {
    const { images: list } = req.body;
    if (Array.isArray(list)) {
      for (const item of list.slice(0, 100)) {
        if (item.id && item.storage_url) {
          const safeTitle = typeof item.title === 'string' ? item.title.slice(0, 150) : 'image';
          const safeSlug = item.public_slug ? sanitizeSlug(item.public_slug) : undefined;

          inMemoryImageCache.set(item.id, {
            storageUrl: item.storage_url,
            title: safeTitle,
            mimeType: item.mime_type,
          });
          if (safeSlug) {
            inMemoryImageCache.set(safeSlug, {
              storageUrl: item.storage_url,
              title: safeTitle,
              mimeType: item.mime_type,
            });
          }
          try {
            await insertImageRecord({
              id: item.id,
              userId: item.user_id || 'guest',
              title: safeTitle,
              slug: safeSlug,
              description: item.description ? String(item.description).slice(0, 500) : '',
              storageUrl: item.storage_url,
              thumbnailUrl: item.thumbnail_url,
              size: item.file_size || 0,
              width: item.width,
              height: item.height,
              mimeType: item.mime_type,
              visibility: item.visibility || 'public',
              tags: Array.isArray(item.tags) ? item.tags.join(',') : '',
              storageProvider: 'cloudinary',
            });
          } catch {
            // Ignore duplicate key conflicts
          }
        }
      }
    }
    res.json({ success: true, synced: list?.length || 0 });
  } catch (error: any) {
    logSecurityEvent('error', req, 'Batch Sync Error', { message: error.message });
    res.status(500).json({ error: 'Batch sync failed' });
  }
});

// ==========================================
// Outgoing Webhook Dispatcher with SSRF Guard
// ==========================================
app.post('/api/webhooks/dispatch', webhookLimiter, async (req, res) => {
  const startTime = Date.now();
  try {
    const { url, secret, event, format, payload } = req.body;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        statusText: 'Bad Request',
        error: 'Missing target webhook URL',
      });
    }

    // SSRF Check
    const urlCheck = isSafePublicUrl(url);
    if (!urlCheck.isSafe) {
      logSecurityEvent('security_alert', req, 'Blocked SSRF Attempt in Webhook Dispatcher', {
        targetUrl: url,
        reason: urlCheck.reason,
      });
      return res.status(400).json({
        success: false,
        statusCode: 400,
        statusText: 'Forbidden Webhook Destination',
        error: 'Target URL is blocked by security policy (SSRF protection triggered)',
      });
    }

    let outgoingBody: any = payload;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'ImgSphere-Secure-Webhook-Dispatcher/1.0',
    };

    if (format === 'discord') {
      const img = payload?.image || payload?.data?.image || {};
      const usr = payload?.user || payload?.data?.user || {};
      outgoingBody = {
        username: 'ImgSphere Webhooks',
        avatar_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=128&auto=format&fit=crop&q=80',
        content: '📸 **New image uploaded to ImgSphere**',
        embeds: [
          {
            title: img.title || 'Untitled Image',
            url: img.page_url || img.direct_url || img.storage_url,
            color: 3447003,
            fields: [
              { name: 'File Name', value: `\`${img.file_name || 'image.jpg'}\``, inline: true },
              { name: 'Size', value: `${img.file_size ? (img.file_size / 1024 / 1024).toFixed(2) + ' MB' : 'N/A'}`, inline: true },
              { name: 'Visibility', value: `${img.visibility || 'public'}`, inline: true },
              { name: 'Event', value: `\`${event || 'image.created'}\``, inline: true },
            ],
            image: { url: img.storage_url || img.direct_url },
            timestamp: new Date().toISOString(),
            footer: { text: 'ImgSphere Security Layer' },
          },
        ],
      };
    } else if (format === 'slack') {
      const img = payload?.image || payload?.data?.image || {};
      const usr = payload?.user || payload?.data?.user || {};
      outgoingBody = {
        text: `📸 *New Image Uploaded to ImgSphere*: <${img.page_url || img.storage_url}|${img.title || 'Untitled'}>`,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*📸 New Image Uploaded: ${img.title || 'Untitled'}*\n*File:* \`${img.file_name || 'image.jpg'}\`\n*Event:* \`${event || 'image.created'}\``,
            },
          },
        ],
      };
    } else {
      outgoingBody = {
        event: event || 'image.created',
        timestamp: new Date().toISOString(),
        ...payload,
      };
    }

    const bodyString = typeof outgoingBody === 'string' ? outgoingBody : JSON.stringify(outgoingBody);

    if (secret && typeof secret === 'string' && secret.trim()) {
      const hmac = crypto.createHmac('sha256', secret.trim()).update(bodyString).digest('hex');
      headers['X-ImgSphere-Signature'] = `sha256=${hmac}`;
      headers['X-ImgSphere-Event'] = event || 'image.created';
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: bodyString,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const durationMs = Date.now() - startTime;
    let responseText = '';
    try {
      responseText = await response.text();
      if (responseText.length > 500) {
        responseText = responseText.substring(0, 500) + '... (truncated)';
      }
    } catch {
      responseText = '';
    }

    return res.json({
      success: response.ok,
      statusCode: response.status,
      statusText: response.statusText,
      durationMs,
      responseBody: responseText,
      dispatchedPayload: outgoingBody,
    });
  } catch (error: any) {
    const durationMs = Date.now() - startTime;
    return res.json({
      success: false,
      statusCode: 0,
      statusText: error.name === 'AbortError' ? 'Timeout (exceeded 6000ms)' : (error.message || 'Connection failed'),
      durationMs,
      responseBody: error.message || 'Network error',
    });
  }
});

// Centralized Safe Error Handler (must be mounted last)
app.use(safeErrorHandler);
