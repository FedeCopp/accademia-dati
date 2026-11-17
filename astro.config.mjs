// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

// Pubblicato su GitHub Pages: https://fedecopp.github.io/accademia-dati/
export default defineConfig({
  site: 'https://fedecopp.github.io',
  base: '/accademia-dati',
  trailingSlash: 'ignore',
  integrations: [mdx()],
});
