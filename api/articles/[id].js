const { kv } = require('@vercel/kv');

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const ARTICLES_KEY = 'articles';
const ARTICLE_PREFIX = 'article:';

function formatDate(dateString) {
  const date = new Date(dateString);
  const months = [
    'Януари', 'Февруари', 'Март', 'Април', 'Май', 'Юни',
    'Юли', 'Август', 'Септември', 'Октомври', 'Ноември', 'Декември'
  ];
  return `${months[date.getMonth()]} ${date.getFullYear()} г.`;
}

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }

  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  const { id } = req.query;

  try {
    if (req.method === 'GET') {
      // Get article by ID
      const article = await kv.get(`${ARTICLE_PREFIX}${id}`);

      if (!article) {
        return res.status(404).json({
          success: false,
          error: 'Article not found'
        });
      }

      return res.status(200).json({
        success: true,
        data: article
      });
    }

    if (req.method === 'PUT') {
      // Update article
      const updateData = req.body;
      const existingArticle = await kv.get(`${ARTICLE_PREFIX}${id}`);

      if (!existingArticle) {
        return res.status(404).json({
          success: false,
          error: 'Article not found'
        });
      }

      const updatedArticle = {
        ...existingArticle,
        ...updateData,
        dateDisplay: updateData.date ? formatDate(updateData.date) : existingArticle.dateDisplay,
        updatedAt: new Date().toISOString()
      };

      await kv.set(`${ARTICLE_PREFIX}${id}`, updatedArticle);

      return res.status(200).json({
        success: true,
        data: updatedArticle
      });
    }

    if (req.method === 'DELETE') {
      // Delete article
      const article = await kv.get(`${ARTICLE_PREFIX}${id}`);

      if (!article) {
        return res.status(404).json({
          success: false,
          error: 'Article not found'
        });
      }

      // Delete article
      await kv.del(`${ARTICLE_PREFIX}${id}`);

      // Remove from IDs list
      const ids = await kv.get(ARTICLES_KEY) || [];
      const filteredIds = ids.filter(articleId => articleId !== id);
      await kv.set(ARTICLES_KEY, filteredIds);

      return res.status(200).json({
        success: true,
        data: null
      });
    }

    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}