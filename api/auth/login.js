// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }

  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    const { email, password } = req.body;

    // Get admin credentials from environment
    const adminEmail = process.env.VITE_ADMIN_EMAIL;
    const adminPassword = process.env.VITE_ADMIN_PASSWORD;

    if (email === adminEmail && password === adminPassword) {
      return res.status(200).json({
        success: true,
        data: {
          user: { email, username: 'admin' },
          token: 'admin-authenticated'
        }
      });
    }

    return res.status(401).json({
      success: false,
      error: 'Invalid credentials'
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      error: 'Login failed'
    });
  }
}