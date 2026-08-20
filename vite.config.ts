import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';

const LTA_ACCOUNT_KEY = process.env.LTA_ACCOUNT_KEY || 'aJ/kjdfiQMyuFDRzw2Ju5g==';

// Vite dev server API handler plugin to handle /api/bus-arrival and /api/health
function ltaApiPlugin(): Plugin {
  return {
    name: 'lta-api-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.method === 'OPTIONS') {
          res.statusCode = 204;
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', '*');
          res.end();
          return;
        }

        if (req.url && req.url.startsWith('/api/bus-arrival')) {
          try {
            const urlObj = new URL(req.url, 'http://localhost:3000');
            const busStopCode = urlObj.searchParams.get('busStopCode') || urlObj.searchParams.get('BusStopCode') || '83139';
            const serviceNo = urlObj.searchParams.get('serviceNo') || urlObj.searchParams.get('ServiceNo');
            const cleanCode = busStopCode.trim().padStart(5, '0');

            let targetUrl = `https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival?BusStopCode=${encodeURIComponent(cleanCode)}`;
            if (serviceNo) {
              targetUrl += `&ServiceNo=${encodeURIComponent(serviceNo.trim())}`;
            }

            const ltaRes = await fetch(targetUrl, {
              method: 'GET',
              headers: {
                AccountKey: LTA_ACCOUNT_KEY,
                accept: 'application/json',
              },
            });

            if (!ltaRes.ok) {
              const errText = await ltaRes.text();
              res.statusCode = ltaRes.status;
              res.setHeader('Content-Type', 'application/json');
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.end(JSON.stringify({ error: `LTA API responded with status ${ltaRes.status}`, details: errText }));
              return;
            }

            const data = await ltaRes.json();
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.end(JSON.stringify(data));
            return;
          } catch (error) {
            console.error('[Vite LTA Middleware Error]:', error);
            res.statusCode = 502;
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.end(JSON.stringify({
              error: 'Failed to connect to LTA DataMall service',
              message: error instanceof Error ? error.message : String(error),
            }));
            return;
          }
        }

        if (req.url && req.url.startsWith('/api/health')) {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), ltaApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      strictPort: true,
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
