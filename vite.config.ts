import tailwindcss from '@tailwindcss/vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import viteReact from '@vitejs/plugin-react';
import { nitro } from 'nitro/vite';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const { BASE_URL = 'http://localhost:3000' } = loadEnv(mode, process.cwd(), '');
  // Better Auth rejects sign-ins from any origin other than BASE_URL, so never fall back to another port
  const listen = { port: Number(new URL(BASE_URL).port) || 3000, strictPort: true };

  return {
    server: listen,
    preview: listen,
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
  };
});
