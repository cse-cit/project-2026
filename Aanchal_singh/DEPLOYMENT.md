# BloodConnect — Deployment Guide

## Architecture

| Layer | Technology | Hosting |
|---|---|---|
| Frontend | React 18 (CRA) + Tailwind CSS | **Vercel (free tier)** |
| Backend | Node.js + Express + Socket.io | **Render (free tier)** |
| Database | MongoDB + Mongoose | **MongoDB Atlas (free tier)** |
| Chatbot | Local FAQ engine (no API key needed) | — |

> **Render free tier note:** The service sleeps after ~15 minutes of inactivity.
> The first request after a period of no traffic can take **20–30 seconds** (cold start). This is normal.

---

## Prerequisites

- [ ] A **GitHub** account and this project pushed to a repository
- [ ] A **MongoDB Atlas** account with a free M0 cluster → [Sign up](https://www.mongodb.com/cloud/atlas/register)
- [ ] A **Render** account → [Sign up](https://render.com)
- [ ] A **Vercel** account → [Sign up](https://vercel.com)

---

## Step 1 — Set Up MongoDB Atlas (Database)

1. Create a free M0 cluster on MongoDB Atlas.
2. Create a **database user** (e.g. `bloodconnect_user`) with a strong password.
3. Under **Network Access**, add IP `0.0.0.0/0` (allow access from anywhere — required for Render).
4. Get your connection string from **Connect → Drivers**:
   ```
   mongodb+srv://<user>:<password>@<cluster>.mongodb.net/bloodconnect?retryWrites=true&w=majority
   ```
5. Save this string — you'll need it for Render.

---

## Step 2 — Deploy Backend on Render

### 2a. Create the Web Service

1. Go to [render.com/dashboard](https://dashboard.render.com) → **New** → **Web Service**
2. Connect your GitHub account and select the **BloodConnect** repository.
3. Configure:
   - **Root Directory:** *(leave blank — the `render.yaml` is at the repo root)*
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free

> **Tip:** Render auto-detects `render.yaml` if you use **New → Blueprint**. This is the easiest way.

### 2b. Set Environment Variables in Render

Go to your service → **Environment** → add these:

#### Required

| Variable | Value |
|---|---|
| `NODE_ENV` | `production` |
| `PORT` | `5000` |
| `MONGODB_URI` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | A long random string (click **Generate** in Render) |
| `JWT_EXPIRE` | `7d` |
| `CLIENT_URL` | Your Vercel URL (set after Step 3, e.g. `https://your-app.vercel.app`) |
| `CLIENT_URLS` | Same as CLIENT_URL (can be comma-separated for multiple preview URLs) |

#### Optional (Email Notifications)

| Variable | Value |
|---|---|
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `587` |
| `SMTP_USER` | Your Gmail address |
| `SMTP_PASS` | Your Gmail App Password ([how to get one](https://support.google.com/accounts/answer/185833)) |

#### Optional (SMS — Twilio)

| Variable | Value |
|---|---|
| `TWILIO_ACCOUNT_SID` | From Twilio dashboard |
| `TWILIO_AUTH_TOKEN` | From Twilio dashboard |
| `TWILIO_PHONE_NUMBER` | Your Twilio phone number |

### 2c. Deploy and Test Backend

1. Click **Deploy**. Wait for the build to complete (~2–3 minutes).
2. Once live, open:
   ```
   https://<your-render-service>.onrender.com/api/health
   ```
3. Expected response:
   ```json
   { "status": "ok", "environment": "production" }
   ```
4. Note your Render URL (e.g. `https://bloodconnect-api.onrender.com`) — you need it for Step 3.

---

## Step 3 — Deploy Frontend on Vercel

### 3a. Import the Project

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard) → **Add New** → **Project**
2. Import from GitHub — select the **BloodConnect** repository.
3. **Important:** Set the **Root Directory** to `client` (not the repo root).
4. Framework Preset: **Create React App** (auto-detected)
5. Build Command: `CI=false npm run build` *(already set in `client/vercel.json`)*
6. Output Directory: `build`

### 3b. Set Environment Variables in Vercel

Go to your project → **Settings** → **Environment Variables** → add:

| Variable | Value |
|---|---|
| `REACT_APP_API_URL` | `https://<your-render-service>.onrender.com/api` |
| `REACT_APP_SOCKET_URL` | `https://<your-render-service>.onrender.com` |

> ⚠️ Do **not** add a trailing slash to these URLs.

### 3c. Deploy

1. Click **Deploy**.
2. Once live, note your Vercel URL (e.g. `https://bloodconnect.vercel.app`).

---

## Step 4 — Connect Frontend ↔ Backend (CORS)

1. Go back to your **Render service** → **Environment**.
2. Update `CLIENT_URL` to your Vercel URL:
   ```
   CLIENT_URL=https://your-app.vercel.app
   CLIENT_URLS=https://your-app.vercel.app
   ```
3. Render auto-redeploys when you save env vars. Wait for the redeploy.

---

## Step 5 — Smoke Tests (Post-Deployment Checklist)

Run through these checks after everything is live:

- [ ] `https://<render>.onrender.com/api/health` → `{"status":"ok"}`
- [ ] `https://<render>.onrender.com/api` → API endpoint listing
- [ ] Open the Vercel frontend URL → landing page loads
- [ ] Register a new user → redirected to dashboard
- [ ] Open browser DevTools → Network tab → confirm API calls go to `onrender.com/api`
- [ ] Login → Socket.io connection succeeds (no WebSocket errors in console)
- [ ] Login → Chatbot bubble appears (bottom-right) → ask "how to raise a request" → gets an answer

---

## Chatbot — No API Key Required

The Nexus chatbot uses a **local FAQ knowledge base** — it does **not** call any external AI API.
No `REACT_APP_GEMINI_API_KEY` is needed. The chatbot:
- Is shown only to logged-in users
- Answers questions about the platform workflow, donor/hospital/receiver processes, blood types, eligibility, scheduling, privacy, and more
- Falls back to a helpful "here's what I can help with" message for unrecognized questions

---

## Troubleshooting

| Issue | Fix |
|---|---|
| `MONGODB_URI is not set` | Add the Atlas connection string in Render environment variables |
| CORS error on Vercel | Ensure `CLIENT_URL` in Render matches the **exact** Vercel origin (no trailing slash) |
| Socket.io connection fails | Ensure `REACT_APP_SOCKET_URL` is set in Vercel and the frontend was redeployed |
| Render service slow on first load | Normal — free tier cold start takes 20–30s after inactivity |
| Build fails on Vercel | Ensure the Vercel Root Directory is set to `client`, not the repo root |
| File uploads lost after redeploy | Expected on Render free tier (ephemeral filesystem) — use Cloudinary for persistence |
| Login shows "Session expired" immediately | Check that `JWT_SECRET` is set in Render and is consistent between deploys |

---

## File Upload Limitation (Render Free Tier)

Render free tier uses an **ephemeral filesystem** — any files uploaded to `./uploads`
(profile pictures, hospital documents) are **deleted on every redeploy or restart**.

For production with persistent uploads, integrate a cloud storage provider:
- [Cloudinary](https://cloudinary.com) — free tier available, easy to integrate
- [AWS S3](https://aws.amazon.com/s3/) — flexible, requires setup

This is out of scope for initial deployment but important to address before going fully live.
