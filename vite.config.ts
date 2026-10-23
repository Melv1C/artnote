import tailwindcss from '@tailwindcss/vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import viteReact from '@vitejs/plugin-react';
import { nitro } from 'nitro/vite';
import { defineConfig } from 'vite';
import vercelJson from './vercel.json' with { type: 'json' };

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
    // Crons are copied into the Build Output config, which is what Vercel reads for framework builds.
    nitro({ vercel: { config: { version: 3, crons: vercelJson.crons } } }),
  ],
});
