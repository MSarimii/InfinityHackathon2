/**
 * MAIN SERVER ENTRY POINT
 * File: server.ts
 *
 * Full-stack Express server with Vite middleware integration.
 * Runs on Port 3000.
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { createApiRouter } from './server/api/routes.ts';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);
  const isProd = process.env.NODE_ENV === 'production';

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Mount API router under /api
  app.use('/api', createApiRouter());

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  if (!isProd) {
    // Development mode: attach Vite dev server middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    // Production mode: serve static files from dist
    const distPath = path.resolve(process.cwd(), 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[NovaWorks Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('[NovaWorks Server] Failed to start:', err);
  process.exit(1);
});
