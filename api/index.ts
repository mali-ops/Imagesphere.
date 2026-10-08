import type { Request, Response } from 'express';
import { app } from '../src/serverApp';

export default function handler(req: Request, res: Response) {
  try {
    // 1. Recover the original requested path from Vercel query or rewrite headers
    let targetPath = '';

    if (req.url) {
      try {
        const parsed = new URL(req.url, 'http://localhost');
        const queryPath = parsed.searchParams.get('raw_path');
        if (queryPath) {
          targetPath = queryPath;
        }
      } catch {}
    }

    if (!targetPath) {
      const headerPath =
        (req.headers['x-matched-path'] as string) ||
        (req.headers['x-forwarded-uri'] as string) ||
        (req.headers['x-forwarded-url'] as string) ||
        (req.headers['x-original-url'] as string);

      if (headerPath && headerPath !== '/api' && headerPath !== '/') {
        targetPath = headerPath;
      }
    }

    if (targetPath) {
      req.url = targetPath;
    } else if (req.url && !req.url.startsWith('/api') && !req.url.startsWith('/i/') && !req.url.startsWith('/imgsphere/')) {
      req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url);
    }

    return app(req, res);
  } catch (err: any) {
    console.error('Vercel serverless handler error:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Serverless invocation error', message: err?.message });
    }
  }
}

