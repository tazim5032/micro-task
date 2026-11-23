import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

const demo = (f: string) => path.resolve(__dirname, 'demo', f);

// `npm run build:demo` produces a static "live demo": the real API routes from ../server
// run in the browser, with Express/JWT/crypto/db swapped for the browser versions in ./demo.
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'demo-db',
      enforce: 'pre',
      resolveId(source, importer) {
        if (importer && /[\\/]server[\\/]src[\\/]/.test(importer) && /^\.\.?\/db$/.test(source)) return demo('db.ts');
        return null;
      },
    },
  ],
  resolve: {
    alias: {
      '@demo-server': demo('server.ts'),
      express: demo('express-shim.ts'),
      jsonwebtoken: demo('jwt-shim.ts'),
      crypto: demo('crypto-shim.ts'),
    },
  },
  server: {
    port: 5174,
    proxy: { '/api': 'http://127.0.0.1:5070' },
  },
});
