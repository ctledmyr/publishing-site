import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

export default defineConfig({
  output: 'hybrid',
  adapter: vercel({ nodeVersion: '20' }),
  site: process.env.SITE_URL,
});
