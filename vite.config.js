import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

/**
 * Generates `dist/app.html` as the SPA shell template for Vercel rewrites &
 * `/api/render-home`. On Vercel builds (`VERCEL=1`), removes static `dist/index.html`
 * so CDN file precedence does not bypass the `/` -> `/api/render-home` rewrite.
 */
function vercelSpaMetaTemplatePlugin() {
  return {
    name: 'vercel-spa-meta-template',
    closeBundle() {
      const distDir = path.resolve(process.cwd(), 'dist');
      const indexPath = path.join(distDir, 'index.html');
      const appTemplatePath = path.join(distDir, 'app.html');
      if (!fs.existsSync(indexPath)) return;

      fs.copyFileSync(indexPath, appTemplatePath);
      if (process.env.VERCEL === '1') {
        fs.unlinkSync(indexPath);
      }
    },
  };
}

function devTranslateApiPlugin(mode) {
  return {
    name: 'dev-translate-api',
    configureServer(server) {
      server.middlewares.use('/api/translate', async (req, res) => {
        const freshEnv = loadEnv(mode, process.cwd(), '');
        for (const key of [
          'SUPABASE_URL',
          'SUPABASE_PUBLISHABLE_KEY',
          'VITE_SUPABASE_URL',
          'VITE_SUPABASE_PUBLISHABLE_KEY',
          'GEMINI_API_KEY',
          'GEMINI_MODEL',
        ]) {
          if (freshEnv[key]) {
            process.env[key] = freshEnv[key];
          }
        }

        try {
          const mod = await import('./api/translate.js');
          await mod.default(req, res);
        } catch (err) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(
            JSON.stringify({
              error: err?.message || 'Internal dev translation middleware error.',
            })
          );
        }
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      vercelSpaMetaTemplatePlugin(),
      devTranslateApiPlugin(mode),
    ],
    build: {
      rolldownOptions: {
        output: {
          codeSplitting: {
            groups: [
              {
                name: 'vendor-react',
                test: /[\\/]node_modules[\\/](react|react-dom|scheduler|react-router|react-router-dom)[\\/]/,
                priority: 30,
              },
              {
                name: 'vendor-motion',
                test: /[\\/]node_modules[\\/](framer-motion|motion-dom|motion-utils|lenis)[\\/]/,
                priority: 25,
              },
              {
                name: 'vendor-query',
                test: /[\\/]node_modules[\\/]@tanstack[\\/]/,
                priority: 20,
              },
              {
                name: 'vendor-icons',
                test: /[\\/]node_modules[\\/]react-icons[\\/]/,
                priority: 15,
              },
            ],
          },
        },
      },
    },
  };
});
