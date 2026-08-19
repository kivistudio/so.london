import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://shortobsessions.com',
  output: 'static',
  build: { format: 'directory' },
  trailingSlash: 'ignore',
});
