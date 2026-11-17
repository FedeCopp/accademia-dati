// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// Pubblicato su GitHub Pages: https://fedecopp.github.io/accademia-dati/
export default defineConfig({
  site: 'https://fedecopp.github.io',
  base: '/accademia-dati',
  trailingSlash: 'ignore',
  integrations: [mdx(), react()],
  vite: {
    plugins: [tailwindcss()],
  },
});
