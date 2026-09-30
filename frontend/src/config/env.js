// Environment configuration for different deployment environments
const config = {
  // API base URL - defaults to relative path for same-domain deployment
  API_BASE_URL: import.meta.env.VITE_API_URL || "/api",

  // Environment detection
  isProduction: import.meta.env.PROD,
  isDevelopment: import.meta.env.DEV,

  // Vercel-specific environment variables
  isVercel: import.meta.env.VERCEL === "1",
};

export default config;
