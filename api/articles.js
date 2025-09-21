const { kv } = require('@vercel/kv');
const { nanoid } = require('nanoid');

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const ARTICLES_KEY = 'articles';
const ARTICLE_PREFIX = 'article:';

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[а-я]/g, char => {
      const map = {
        'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ж': 'zh', 'з': 'z',
        'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p',
        'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch',
        'ш': 'sh', 'щ': 'sht', 'ъ': 'a', 'ь': 'y', 'ю': 'yu', 'я': 'ya'
      };
      return map[char] || char;
    })
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'article';
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const months = [
    'Януари', 'Февруари', 'Март', 'Април', 'Май', 'Юни',
    'Юли', 'Август', 'Септември', 'Октомври', 'Ноември', 'Декември'
  ];
  return `${months[date.getMonth()]} ${date.getFullYear()} г.`;
}

module.exports = async function handler(req, res) {
  // Set CORS headers
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    console.log('Articles API called with method:', req.method);

    if (req.method === 'GET') {
      console.log('Getting articles from KV...');

      // Get all articles
      const ids = await kv.get(ARTICLES_KEY) || [];
      console.log('Article IDs:', ids);

      const articles = [];

      for (const id of ids) {
        try {
          const article = await kv.get(`${ARTICLE_PREFIX}${id}`);
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
      const slug = generateSlug(articleData.title);

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

      // Save article to KV
      await kv.set(`${ARTICLE_PREFIX}${id}`, article);

      // Update article IDs list
      const ids = await kv.get(ARTICLES_KEY) || [];
      ids.unshift(id);
      await kv.set(ARTICLES_KEY, ids);

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
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};