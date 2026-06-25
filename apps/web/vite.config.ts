import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [tailwindcss(), sveltekit()],
  // OPFS + cross-origin isolation isn't strictly required for SQLite-WASM
  // unless we want SharedArrayBuffer-backed multi-threading. We default to
  // single-threaded SQLite (still very fast for our query shapes) so the dev
  // server doesn't need COOP/COEP headers.
  server: {
    port: 5173,
  },
});
