# 🚀 Vercel Deployment Guide

This project is optimized for a seamless deployment on **Vercel**. Follow these instructions to ensure your frontend connects correctly to your backend and handles all routes properly.

## 📋 Prerequisites

1.  **Backend Deployed**: Your backend should be live (e.g., on Render or Railway).
    - In this project, the backend is targeted at: `https://ecommerce-jbs7.onrender.com`
2.  **Environment Variables**: You will need to configure your backend URL in the Vercel dashboard.

---

## 🛠️ Deployment Steps

### 1. Push to GitHub

Ensure your latest changes (including the updated `vercel.json`) are pushed to your repository.

### 2. Import to Vercel

1.  Go to [Vercel Dashboard](https://vercel.com/dashboard).
2.  Click **"Add New..."** → **"Project"**.
3.  Import your GitHub repository.

### 3. Configure Settings

Vercel should automatically detect **Vite** as the framework. If not, set the following:

- **Framework Preset**: `Vite`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### 4. Environment Variables (Required)

Add the following variable in the **Environment Variables** section:

| Variable Name  | Value                                     | Description                          |
| :------------- | :---------------------------------------- | :----------------------------------- |
| `VITE_API_URL` | `https://ecommerce-jbs7.onrender.com/api` | The base URL for your API endpoints. |

> **⚠️ Important**: Do **not** add a trailing slash to the URL.

### 5. Deploy

Click **Deploy**. Vercel will build your project and provide you with a production URL.

---

## ⚙️ How Routing & API Calls Work

### Single Page Application (SPA) Routing

We have configured `vercel.json` to handle client-side routing. This ensures that refreshing the page on routes like `/cart` or `/orders` doesn't result in a 404 error.

### API Proxying

Even if you forget to set the `VITE_API_URL` environment variable, we have added a fallback rewrite rule in `vercel.json`. This rule proxies all requests starting with `/api` directly to your Render backend:

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://ecommerce-jbs7.onrender.com/api/:path*"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

## 🔒 CORS Configuration

Ensure your backend (Render) is configured to allow requests from your Vercel domain. In your backend `app.js` or `cors` middleware:

```javascript
app.use(
  cors({
    origin: ["https://your-app-name.vercel.app", "http://localhost:5173"],
    credentials: true,
  })
);
```

---

## 🐛 Troubleshooting "TypeError: Cannot read properties of undefined"

If you previously saw this error, it was likely due to:

1.  **Missing Environment Variables**: Ensure `VITE_API_URL` is set.
2.  **Async Data Timing**: We have added defensive checks (`?.` and `Array.isArray`) throughout the codebase to ensure the app doesn't crash while waiting for data from the backend.
3.  **Vercel Caching**: If the error persists after a fix, try deploying with the **"Redeploy"** button and check **"Delegate to Vercel to fetch the latest code"**.
