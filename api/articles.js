import { kv } from '@vercel/kv';
import { nanoid } from 'nanoid';

// CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// KV keys
const ARTICLES_KEY = 'articles';
const ARTICLE_PREFIX = 'article:';

// Generate slug from title
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

// Format date for display
function formatDate(dateString) {
  const date = new Date(dateString);
  const months = [
    'Януари', 'Февруари', 'Март', 'Април', 'Май', 'Юни',
    'Юли', 'Август', 'Септември', 'Октомври', 'Ноември', 'Декември'
  ];
  return `${months[date.getMonth()]} ${date.getFullYear()} г.`;
}

export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }

  // Set CORS headers
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  try {
    if (req.method === 'GET') {
      // Get all articles
      const ids = await kv.get(ARTICLES_KEY) || [];
      const articles = [];

      for (const id of ids) {
        const article = await kv.get(`${ARTICLE_PREFIX}${id}`);
        if (article) articles.push(article);
      }

      // Sort by date (newest first)
      articles.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      return res.status(200).json({
        success: true,
        data: { articles, total: articles.length }
      });
    }

    if (req.method === 'POST') {
      // Create new article
      const articleData = req.body;
      const id = nanoid();
      const slug = generateSlug(articleData.title);

      const article = {
        id,
        slug,
        title: articleData.title,
        content: articleData.content,
        excerpt: articleData.excerpt,
        date: articleData.date,
        dateDisplay: formatDate(articleData.date),
        coverImage: articleData.coverImage,
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

      return res.status(201).json({
        success: true,
        data: article
      });
    }

    // Method not allowed
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