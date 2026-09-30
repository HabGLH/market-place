//
// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite"; // Import the plugin

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // Add the Tailwind CSS plugin
  ],
  server: {
    proxy: {
      "/api": {
        target: "https://ecommerce-jbs7.onrender.com",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
