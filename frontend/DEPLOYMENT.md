# Frontend Deployment Guide

## Vercel Deployment

### Environment Variables

Set the following environment variables in your Vercel project settings:

```
VITE_API_URL=https://your-backend-api-url.com/api
```

Replace `https://your-backend-api-url.com` with your actual backend API URL.

### Build Settings

Vercel should automatically detect this as a Vite React project. If not, set:

- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### CORS Configuration

Make sure your backend allows requests from your Vercel domain. Add your Vercel domain to the CORS allowed origins in your backend.

### Troubleshooting

If you get errors like "Cannot read properties of undefined (reading '0')":

1. **Check API URL**: Ensure `VITE_API_URL` is set correctly
2. **Check Backend**: Make sure your backend is running and accessible
3. **Check CORS**: Backend must allow requests from your Vercel domain
4. **Check User Data**: The API should return user objects with `name` and `email` properties

### Local Development

For local development, create a `.env.local` file:

```
VITE_API_URL=http://localhost:5000/api
```

### Production Checklist

- [ ] Set `VITE_API_URL` environment variable
- [ ] Backend CORS allows Vercel domain
- [ ] Backend is deployed and accessible
- [ ] Test authentication flow
- [ ] Test API calls work correctly
