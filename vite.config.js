import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  server: {
    host: true,
    port: 8080,
    allowedHosts: [
      "mirror-contrary-platinum-fabulous.trycloudflare.com",
    ],
    proxy: {
      "/api": {
        target: "http://192.168.99.226:4000",
        changeOrigin: true,
      },
    },
  },
});
