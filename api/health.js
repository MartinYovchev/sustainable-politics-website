const { kv } = require('@vercel/kv');

module.exports = async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Test KV connection
    const testKey = 'health-check';
    const testValue = { timestamp: new Date().toISOString() };

    console.log('Testing KV connection...');

    // Try to set a test value
    await kv.set(testKey, testValue);

    // Try to get it back
    const retrieved = await kv.get(testKey);

    // Clean up
    await kv.del(testKey);

    const envVars = {
      KV_URL: !!process.env.KV_URL,
      KV_REST_API_TOKEN: !!process.env.KV_REST_API_TOKEN,
      KV_REST_API_URL: !!process.env.KV_REST_API_URL,
      NODE_ENV: process.env.NODE_ENV
    };

    return res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      kv: {
        connected: true,
        testSuccessful: !!retrieved
      },
      environment: envVars
    });

  } catch (error) {
    console.error('Health check failed:', error);

    return res.status(500).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      kv: {
        connected: false,
        error: error.message
      },
      environment: {
        KV_URL: !!process.env.KV_URL,
        KV_REST_API_TOKEN: !!process.env.KV_REST_API_TOKEN,
        KV_REST_API_URL: !!process.env.KV_REST_API_URL,
        NODE_ENV: process.env.NODE_ENV
      }
    });
  }
};