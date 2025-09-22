module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  res.status(200).json({
    message: 'API is working',
    timestamp: new Date().toISOString(),
    method: req.method,
    environment: {
      hasKvUrl: !!import.meta.env.KV_URL,
      hasKvToken: !!import.meta.env.KV_REST_API_TOKEN,
      hasKvApiUrl: !!import.meta.env.KV_REST_API_URL,
      nodeEnv: import.meta.env.NODE_ENV
    }
  });
};