import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://danieloliverracing.com',
  output: 'static',
  server: { port: 4642 },
  integrations: [
    sitemap({
      // /store just 301-redirects to the Shopify store — keep it out of the sitemap.
      filter: (page) => !/\/store\/?$/.test(page),
      // Give crawlers a freshness signal and rank the homepage above deep pages.
      serialize(item) {
        item.lastmod = new Date().toISOString();
        item.changefreq = 'weekly';
        item.priority = item.url === 'https://danieloliverracing.com/' ? 1.0 : 0.7;
        return item;
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
