module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    console.log('Articles API called with method:', req.method);

    // Check if KV is available
    const kvAvailable = !!(import.meta.env.KV_REST_API_URL && import.meta.env.KV_REST_API_TOKEN);

    if (!kvAvailable) {
      console.log('KV not available, environment check:', {
        hasKvUrl: !!import.meta.env.KV_URL,
        hasKvToken: !!import.meta.env.KV_REST_API_TOKEN,
        hasKvApiUrl: !!import.meta.env.KV_REST_API_URL
      });

      return res.status(500).json({
        success: false,
        error: 'KV database not configured',
        debug: {
          hasKvUrl: !!import.meta.env.KV_URL,
          hasKvToken: !!import.meta.env.KV_REST_API_TOKEN,
          hasKvApiUrl: !!import.meta.env.KV_REST_API_URL
        }
      });
    }

    // Use Upstash Redis SDK as recommended
    const { Redis } = require('@upstash/redis');
    const { nanoid } = require('nanoid');

    // Initialize Redis with environment variables
    const redis = Redis.fromEnv();

    const ARTICLES_KEY = 'articles';
    const ARTICLE_PREFIX = 'article:';

    if (req.method === 'GET') {
      console.log('Getting articles from KV...');

      // Get all articles
      const ids = await redis.get(ARTICLES_KEY) || [];
      console.log('Article IDs:', ids);

      const articles = [];

      for (const id of ids) {
        try {
          const article = await redis.get(`${ARTICLE_PREFIX}${id}`);
          if (article) {
            articles.push(article);
          }
        } catch (error) {
          console.error(`Error getting article ${id}:`, error);
        }
      }

      // Sort by date (newest first)
      articles.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      console.log(`Returning ${articles.length} articles`);

      return res.status(200).json({
        success: true,
        data: { articles, total: articles.length }
      });
    }

    if (req.method === 'POST') {
      console.log('Creating new article...');

      const articleData = req.body;
      if (!articleData.title || !articleData.content) {
        return res.status(400).json({
          success: false,
          error: 'Title and content are required'
        });
      }

      const id = nanoid();

      // Simple slug generation
      const slug = articleData.title
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '') || 'article';

      // Simple date formatting
      const formatDate = (dateString) => {
        const date = new Date(dateString);
        return `${date.getMonth() + 1}/${date.getFullYear()}`;
      };

      const article = {
        id,
        slug,
        title: articleData.title,
        content: articleData.content,
        excerpt: articleData.excerpt || '',
        date: articleData.date || new Date().toISOString().split('T')[0],
        dateDisplay: formatDate(articleData.date || new Date().toISOString().split('T')[0]),
        coverImage: articleData.coverImage || '',
        images: articleData.images || [],
        videos: articleData.videos || [],
        category: articleData.category || 'news',
        tags: articleData.tags || [],
        featured: articleData.featured || false,
        createdAt: new Date().toISOString(),
        published: true,
        source: 'database'
      };

      // Save article to Redis
      await redis.set(`${ARTICLE_PREFIX}${id}`, article);

      // Update article IDs list
      const ids = await redis.get(ARTICLES_KEY) || [];
      ids.unshift(id);
      await redis.set(ARTICLES_KEY, ids);

      console.log('Article created with ID:', id);

      return res.status(201).json({
        success: true,
        data: article
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
      error: error.message || 'Internal server error',
      stack: import.meta.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};