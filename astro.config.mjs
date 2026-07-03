import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://danieloliverracing.com',
  output: 'static',
  server: { port: 4642 },
  vite: {
    plugins: [tailwindcss()],
  },
});
