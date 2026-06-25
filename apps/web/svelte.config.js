import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/**
 * SvelteKit config — static adapter because v2 is a pure PWA with no server
 * runtime. All routes prerendered; data lives in OPFS / IndexedDB. Hosting
 * is just a static bucket (Netlify, GitHub Pages, etc.).
 */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: 'index.html',
      precompress: false,
      strict: true,
    }),
    alias: {
      $lib: 'src/lib',
    },
  },
};

export default config;
