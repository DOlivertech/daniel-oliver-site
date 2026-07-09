import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://danieloliverracing.com',
  output: 'static',
  server: { port: 4642 },
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
