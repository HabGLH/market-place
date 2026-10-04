# Deploying Backend to Render

This backend is configured for deployment on [Render.com](https://render.com).

---

## ⚠️ Common Deployment Failures & Solutions

### 1. Root Directory Not Set
Because this repository is a monorepo containing both `backend` and `frontend`, Render must know to execute commands inside the `backend` folder.
* **Fix**: Set **Root Directory** to `backend` in Render Web Service settings (or use `render.yaml` Blueprint).

### 2. Missing Environment Variables
On startup, `backend/config/env.js` validates that all required environment variables are set. If any variable is missing, the application throws an error and crashes immediately on start.
* **Fix**: Ensure **all** required environment variables are added in the Render dashboard.

### 3. MongoDB Atlas IP Whitelist (0.0.0.0/0)
Render services use dynamic IP addresses. If MongoDB Atlas blocks requests outside specified IPs, the server startup times out while trying to connect to MongoDB.
* **Fix**: In MongoDB Atlas, go to **Network Access** -> Add IP Address -> Select **Allow Access from Anywhere** (`0.0.0.0/0`).

---

## 🛠️ Deployment Steps

### Option A: Using Render Blueprints (Recommended)

1. Push the code to GitHub/GitLab.
2. Log into [Render Dashboard](https://dashboard.render.com/).
3. Click **New +** -> **Blueprint**.
4. Connect your repository.
5. Render will automatically detect `render.yaml` and configure the service.
6. Provide values for prompt environment variables (`MONGO_URL`, `ACCESS_TOKEN_SECRET`, `CLIENT_URL`, `CHAPA_SECRET_KEY`, `CHAPA_WEBHOOK_SECRET`).
7. Click **Apply**.

---

### Option B: Manual Web Service Setup

1. Log into [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** -> **Web Service**.
3. Connect your repository.
4. Fill in the basic configuration:
   * **Name**: `market-place-backend`
   * **Region**: Choose closest to target users
   * **Branch**: `main` (or active branch)
   * **Root Directory**: `backend` *(CRITICAL)*
   * **Runtime**: `Node`
   * **Build Command**: `npm install`
   * **Start Command**: `npm start`
   * **Health Check Path**: `/health`

5. Under **Environment Variables**, add the following:

| Key | Example / Description | Required |
| --- | --- | --- |
| `NODE_ENV` | `production` | Yes |
| `NODE_VERSION` | `20` | Yes |
| `MONGO_URL` | `mongodb+srv://user:pass@cluster.mongodb.net/dbname` | Yes |
| `ACCESS_TOKEN_SECRET` | Long random secret string (e.g. 32+ chars) | Yes |
| `ACCESS_TOKEN_LIFE` | `15m` | Yes |
| `CLIENT_URL` | `https://your-frontend.onrender.com` or Vercel URL | Yes |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | Required for production image uploads |
| `CLOUDINARY_API_KEY` | Cloudinary API key | Required for production image uploads |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | Required for production image uploads |
| `CHAPA_SECRET_KEY` | `CHASECK_TEST-xxxx...` | Yes |
| `CHAPA_WEBHOOK_SECRET` | `your-webhook-secret` | Yes |
| `SHIPPING_FEE_ETB` | `100` | Yes |
| `FREE_SHIPPING_THRESHOLD_ETB` | `5000` | Yes |

6. Click **Create Web Service**.

---

## 🔍 Verification & Health Check

- Once deployed, test the health check endpoint:
  ```
  GET https://<your-render-app>.onrender.com/health
  ```
  Expected Response: `{"status":"OK","timestamp":"..."}`

- Check the **Logs** tab in Render dashboard if any issues arise.
