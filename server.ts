import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Enable CORS for all routes and preflight requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, AccountKey');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

const DEFAULT_LTA_KEY = 'aJ/kjdfiQMyuFDRzw2Ju5g==';

// Proxy endpoint for Singapore LTA DataMall v3 Bus Arrival API
app.get('/api/bus-arrival', async (req, res) => {
  const { busStopCode, serviceNo, BusStopCode, ServiceNo } = req.query;
  const targetCode = (busStopCode || BusStopCode) as string;
  const targetService = (serviceNo || ServiceNo) as string;

  if (!targetCode || typeof targetCode !== 'string') {
    return res.status(400).json({
      error: 'Missing required query parameter: busStopCode',
    });
  }

  const accountKey = process.env.LTA_ACCOUNT_KEY || DEFAULT_LTA_KEY;
  const cleanCode = targetCode.trim().padStart(5, '0');

  let url = `https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival?BusStopCode=${encodeURIComponent(cleanCode)}`;
  if (targetService && typeof targetService === 'string') {
    url += `&ServiceNo=${encodeURIComponent(targetService.trim())}`;
  }

  try {
    const ltaResponse = await fetch(url, {
      method: 'GET',
      headers: {
        AccountKey: accountKey,
        accept: 'application/json',
      },
    });

    if (!ltaResponse.ok) {
      const errorText = await ltaResponse.text();
      console.error(`[LTA API Error] status: ${ltaResponse.status}`, errorText);
      return res.status(ltaResponse.status).json({
        error: `LTA DataMall API responded with status ${ltaResponse.status}`,
        details: errorText,
      });
    }

    const data = await ltaResponse.json();
    return res.json(data);
  } catch (error) {
    console.error('[Bus Arrival Proxy Error]:', error);
    return res.status(502).json({
      error: 'Failed to connect to LTA DataMall service',
      message: error instanceof Error ? error.message : String(error),
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    ltaKeyConfigured: Boolean(process.env.LTA_ACCOUNT_KEY || DEFAULT_LTA_KEY),
  });
});

async function startServer() {
  // Vite middleware for development vs static build in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SG Bus Arrival Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
