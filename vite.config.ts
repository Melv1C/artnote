import tailwindcss from '@tailwindcss/vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import viteReact from '@vitejs/plugin-react';
import { nitro } from 'nitro/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3000,
  },
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    tailwindcss(),
    tanstackStart({
      srcDirectory: 'src',
    }),
    // React's Vite plugin must come after the Start plugin
    viteReact(),
    // Nitro builds the server output; on Vercel it auto-selects the Vercel preset.
    // Vercel merges vercel.json crons into the build output at deploy time, so they must not be duplicated here.
    nitro(),
  ],
});
