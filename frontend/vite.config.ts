import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// Load env from backend/.env (VITE_API_URL, GEMINI_API_KEY) so one file for both apps
const backendEnvDir = path.resolve(__dirname, '../backend');

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, backendEnvDir, '');
    return {
      envDir: backendEnvDir,
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      preview: {
        port: 4173,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
