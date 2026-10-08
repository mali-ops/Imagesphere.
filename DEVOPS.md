# 🚀 ImgSphere DevOps & Deployment Guide

This repository comes pre-configured with a complete DevOps architecture:
- ⚡ **Vercel Serverless Ready** (Vite SPA + Express Serverless Functions via `/api`)
- 🐳 **Docker & Docker Compose** (Multi-stage lightweight production container + PostgreSQL)
- 🔄 **GitHub Actions CI/CD** (Automated linting, type-checking, and build validation on push)
- 🛡️ **Production Security & Health Check** (`/api/health`, rate-limiting, and security headers)

---

## 📋 1. Vercel Deployment (Recommended for Cloud)

### Step-by-Step Vercel Setup:
1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "feat: complete devops and production deployment configs"
   git push origin main
   ```
2. **Import Project into Vercel**:
   - Go to [vercel.com](https://vercel.com) and click **"Add New..." -> "Project"**.
   - Select your GitHub repository.
3. **Configure Project Settings**:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `./` (leave default)
   - **Build Command**: `vite build` (pre-configured in `vercel.json`)
   - **Output Directory**: `dist` (pre-configured in `vercel.json`)
   - **Install Command**: `npm install --legacy-peer-deps`
4. **Set Environment Variables in Vercel**:
   Go to **Settings -> Environment Variables** in your Vercel Dashboard and add:
   | Variable | Value | Description |
   |---|---|---|
   | `SESSION_SECRET` | *(Random 32+ character string)* | Session encryption key |
   | `GEMINI_API_KEY` | *(Your Google Gemini API Key)* | AI auto-tagging & description generation |
   | `VITE_APP_URL` | `https://your-vercel-domain.vercel.app` | Production app URL |
   | `VITE_SUPABASE_URL` | *(Optional - Supabase project URL)* | Persistent PostgreSQL database |
   | `VITE_SUPABASE_ANON_KEY` | *(Optional - Supabase anon key)* | Client database access |
   | `CLOUDINARY_CLOUD_NAME` | *(Optional - Cloudinary name)* | Permanent cloud image storage |
   | `CLOUDINARY_API_KEY` | *(Optional - Cloudinary API key)* | Cloud image upload API |
   | `CLOUDINARY_API_SECRET` | *(Optional - Cloudinary API secret)* | Cloud image signature |

5. **Hit "Deploy"**!
   - Your frontend will load from Vercel Edge CDN.
   - Your backend endpoints (`/api/health`, `/api/images`, `/api/auth/*`) execute automatically as Vercel serverless functions via `api/index.ts`.

---

## 🐳 2. Docker & Container Deployment (VPS / Self-Hosted)

For deploying on AWS EC2, DigitalOcean, Hetzner, Linode, Railway, or Coolify:

### Option A: Docker Compose (Full Stack with PostgreSQL)
```bash
# 1. Copy and configure environment variables
cp .env.example .env
nano .env

# 2. Build and launch all containers in detached mode
docker compose up -d --build

# 3. Check container status
docker compose ps

# 4. View live application logs
docker compose logs -f app
```

### Option B: Standalone Docker Image
```bash
# Build the production image
npm run docker:build

# Run the container on port 3000
docker run -d \
  -p 3000:3000 \
  --name imgsphere-app \
  -e NODE_ENV=production \
  -e SESSION_SECRET="your-strong-random-session-hmac-secret-min-32-chars" \
  imgsphere
```

### Container Health Check
The Dockerfile includes an automated health check querying the `/api/health` endpoint every 30 seconds.
Verify container health with:
```bash
docker inspect --format='{{json .State.Health}}' imgsphere-app
```

---

## 🔄 3. GitHub Actions CI/CD Pipeline

The workflow in `.github/workflows/ci.yml` automatically triggers on every `push` and `pull_request` to `main` or `master`:
1. Checks out repository code.
2. Installs clean Node.js 20 LTS dependencies with cache.
3. Executes TypeScript linting & type checks (`npm run lint`).
4. Runs full production build (`npm run build`).
5. Verifies required build artifacts (`dist/index.html` and `dist/server.cjs`).

Run the CI checks locally anytime with:
```bash
npm run ci
```

---

## 🩺 4. Health Checks & Uptime Monitoring

- **Endpoint**: `GET /api/health`
- **Response**:
  ```json
  {
    "status": "ok",
    "securityStatus": "hardened",
    "timestamp": "2026-09-24T15:42:00.000Z"
  }
  ```
- **Recommended Free Uptime Monitors**:
  - [UptimeRobot](https://uptimerobot.com) (HTTP monitor on `https://your-domain.com/api/health`, 5-min intervals)
  - [BetterStack](https://betterstack.com)

---

## 🗄️ 5. Database Setup (Supabase / PostgreSQL)

1. Create a free project on [Supabase](https://supabase.com) or [Neon](https://neon.tech).
2. Open the **SQL Editor** in Supabase and run:
   - `schema.sql` (Creates users, images, tags, comments, likes tables)
   - `supabase-rls.sql` (Enables Row Level Security and security policies)
3. Copy the project URL and Anon key into your Vercel or Docker `.env` file.

---

## 🛠️ 6. Quick Troubleshooting

| Issue | Cause | Fix |
|---|---|---|
| **Vercel Build Error (`vite: not found`)** | Missing dev dependencies during install | Ensure Install Command is `npm install --legacy-peer-deps` |
| **404 on page refresh on Vercel** | Client-side routing not rewritten to `index.html` | Handled automatically in `vercel.json` rewrites |
| **API returning 500 on Vercel** | Missing `SESSION_SECRET` | Set `SESSION_SECRET` in Vercel Environment Variables |
| **Port conflict in Docker** | Port 3000 already in use on host | Change port mapping in `docker-compose.yml` to `8080:3000` |
