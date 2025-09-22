const { Redis } = require('@upstash/redis');

const redis = Redis.fromEnv();

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const ARTICLES_KEY = 'articles';
const ARTICLE_PREFIX = 'article:';

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }

  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  const { slug } = req.query;

  try {
    // Get all articles and find by slug
    const ids = await redis.get(ARTICLES_KEY) || [];

    for (const id of ids) {
      const article = await redis.get(`${ARTICLE_PREFIX}${id}`);
      if (article && article.slug === slug) {
        return res.status(200).json({
          success: true,
          data: article
        });
      }
    }

    return res.status(404).json({
      success: false,
      error: 'Article not found'
    });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}