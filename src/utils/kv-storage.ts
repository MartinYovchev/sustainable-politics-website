import { nanoid } from 'nanoid';
import type { Article, CreateArticleRequest, UpdateArticleRequest } from '../types';

// Mock KV for client-side development
const mockKV = {
  async get<T>(key: string): Promise<T | null> {
    const value = localStorage.getItem(`kv:${key}`);
    return value ? JSON.parse(value) : null;
  },
  async set(key: string, value: any): Promise<void> {
    localStorage.setItem(`kv:${key}`, JSON.stringify(value));
  },
  async del(key: string): Promise<void> {
    localStorage.removeItem(`kv:${key}`);
  }
};

// Use mock KV in browser environment
const kv = mockKV;

// KV keys
const ARTICLES_KEY = 'articles';
const ARTICLE_PREFIX = 'article:';

// Generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[а-я]/g, char => {
      const map: Record<string, string> = {
        'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ж': 'zh', 'з': 'z',
        'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p',
        'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch',
        'ш': 'sh', 'щ': 'sht', 'ъ': 'a', 'ь': 'y', 'ю': 'yu', 'я': 'ya'
      };
      return map[char] || char;
    })
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    || 'article';
}

// Format date for display
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const months = [
    'Януари', 'Февруари', 'Март', 'Април', 'Май', 'Юни',
    'Юли', 'Август', 'Септември', 'Октомври', 'Ноември', 'Декември'
  ];
  return `${months[date.getMonth()]} ${date.getFullYear()} г.`;
}

// Get all article IDs
async function getArticleIds(): Promise<string[]> {
  try {
    const ids = await kv.get<string[]>(ARTICLES_KEY);
    return ids || [];
  } catch (error) {
    console.error('Error getting article IDs:', error);
    return [];
  }
}

// Save article IDs list
async function saveArticleIds(ids: string[]): Promise<void> {
  try {
    await kv.set(ARTICLES_KEY, ids);
  } catch (error) {
    console.error('Error saving article IDs:', error);
  }
}

// KV Storage API
export class KVStorage {
  // Get all articles
  static async getArticles(): Promise<Article[]> {
    try {
      const ids = await getArticleIds();
      const articles: Article[] = [];

      for (const id of ids) {
        const article = await kv.get<Article>(`${ARTICLE_PREFIX}${id}`);
        if (article) {
          articles.push(article);
        }
      }

      // Sort by date (newest first)
      return articles.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (error) {
      console.error('Error getting articles:', error);
      return [];
    }
  }

  // Get article by ID
  static async getArticleById(id: string): Promise<Article | null> {
    try {
      const article = await kv.get<Article>(`${ARTICLE_PREFIX}${id}`);
      return article || null;
    } catch (error) {
      console.error('Error getting article by ID:', error);
      return null;
    }
  }

  // Get article by slug
  static async getArticleBySlug(slug: string): Promise<Article | null> {
    try {
      const articles = await this.getArticles();
      return articles.find(article => article.slug === slug) || null;
    } catch (error) {
      console.error('Error getting article by slug:', error);
      return null;
    }
  }

  // Create new article
  static async createArticle(data: CreateArticleRequest): Promise<Article> {
    try {
      const id = nanoid();
      const slug = generateSlug(data.title);

      const article: Article = {
        id,
        slug,
        title: data.title,
        content: data.content,
        excerpt: data.excerpt,
        date: data.date,
        dateDisplay: formatDate(data.date),
        coverImage: data.coverImage,
        images: data.images || [],
        videos: data.videos || [],
        category: data.category || 'news',
        tags: data.tags || [],
        featured: data.featured || false,
        createdAt: new Date().toISOString(),
        published: true,
        source: 'database'
      };

      // Save article
      await kv.set(`${ARTICLE_PREFIX}${id}`, article);

      // Update article IDs list
      const ids = await getArticleIds();
      ids.unshift(id); // Add to beginning for newest first
      await saveArticleIds(ids);

      return article;
    } catch (error) {
      console.error('Error creating article:', error);
      throw new Error('Failed to create article');
    }
  }

  // Update existing article
  static async updateArticle(data: UpdateArticleRequest): Promise<Article | null> {
    try {
      const existingArticle = await this.getArticleById(data.id);
      if (!existingArticle) {
        return null;
      }

      const updatedArticle: Article = {
        ...existingArticle,
        ...data,
        slug: data.title ? generateSlug(data.title) : existingArticle.slug,
        dateDisplay: data.date ? formatDate(data.date) : existingArticle.dateDisplay,
        updatedAt: new Date().toISOString()
      };

      // Save updated article
      await kv.set(`${ARTICLE_PREFIX}${data.id}`, updatedArticle);

      return updatedArticle;
    } catch (error) {
      console.error('Error updating article:', error);
      return null;
    }
  }

  // Delete article
  static async deleteArticle(id: string): Promise<boolean> {
    try {
      // Delete article
      await kv.del(`${ARTICLE_PREFIX}${id}`);

      // Remove from IDs list
      const ids = await getArticleIds();
      const filteredIds = ids.filter(articleId => articleId !== id);
      await saveArticleIds(filteredIds);

      return true;
    } catch (error) {
      console.error('Error deleting article:', error);
      return false;
    }
  }

  // Search articles
  static async searchArticles(query: string): Promise<Article[]> {
    try {
      const articles = await this.getArticles();
      const lowerQuery = query.toLowerCase();

      return articles.filter(article =>
        article.title.toLowerCase().includes(lowerQuery) ||
        article.excerpt.toLowerCase().includes(lowerQuery) ||
        article.content.toLowerCase().includes(lowerQuery) ||
        (article.tags && article.tags.some(tag => tag.toLowerCase().includes(lowerQuery)))
      );
    } catch (error) {
      console.error('Error searching articles:', error);
      return [];
    }
  }

  // Get articles by category
  static async getArticlesByCategory(category: string): Promise<Article[]> {
    try {
      const articles = await this.getArticles();
      return articles.filter(article => article.category === category);
    } catch (error) {
      console.error('Error getting articles by category:', error);
      return [];
    }
  }

  // Get featured articles
  static async getFeaturedArticles(): Promise<Article[]> {
    try {
      const articles = await this.getArticles();
      return articles.filter(article => article.featured);
    } catch (error) {
      console.error('Error getting featured articles:', error);
      return [];
    }
  }

  // Get recent articles
  static async getRecentArticles(limit: number = 5): Promise<Article[]> {
    try {
      const articles = await this.getArticles();
      return articles.slice(0, limit);
    } catch (error) {
      console.error('Error getting recent articles:', error);
      return [];
    }
  }

  // Initialize with default article if none exist
  static async initializeDefaultArticle(): Promise<void> {
    try {
      const articles = await this.getArticles();

      if (articles.length === 0) {
        const defaultArticle: CreateArticleRequest = {
          title: "Работна среща с ОИЦ София",
          content: `<p>Сдружение "Център за устойчиви политики" в партньорство със Стопанския факултет на СУ „Св. Климент Охридски" организира форум, фокусиран върху предизвикателствата и добрите практики при управлението на европейски средства.</p>

<p>Събитието се проведе в зала „Яйцето" в Ректората на СУ и събра представители от академичните среди, институции, правни и финансови експерти.</p>

<p>Откриващата сесия бе уважена от проф. д-р Иван Шишков, доц. д-р Атанас Георгиев, посланик д-р Елена Кирчева, Надя Данкинова, доц. д-р Иван Стойнев и др.</p>`,
          excerpt: "Екипът на EU Funds Forum проведе работна среща с екипа на Областен информационен център София-град и София-област за обсъждане на възможности за партньорство и съвместна промоция на събитието.",
          date: "2025-05-01",
          coverImage: "/images/newsImags/news-1-cover.png",
          images: [
            "/images/newsImags/first-event-imags/event-1-image-1.png",
            "/images/newsImags/first-event-imags/event-1-image-2.jpg",
            "/images/newsImags/first-event-imags/event-1-image-3.jpg",
            "/images/newsImags/first-event-imags/event-1-image-4.jpg",
            "/images/newsImags/first-event-imags/event-1-image-5.jpg",
            "/images/newsImags/first-event-imags/event-1-image-6.jpg"
          ],
          videos: [
            "https://www.youtube.com/embed/z126n8yqYgc",
            "https://www.youtube.com/embed/IydDerwui4E"
          ],
          category: "news",
          tags: ["форум", "европейски средства", "партньорство"],
          featured: true
        };

        await this.createArticle(defaultArticle);
        console.log('✅ Default article created');
      }
    } catch (error) {
      console.error('Error initializing default article:', error);
    }
  }

  // Clear all articles (for development/testing)
  static async clearAllArticles(): Promise<void> {
    try {
      const ids = await getArticleIds();

      // Delete all article records
      for (const id of ids) {
        await kv.del(`${ARTICLE_PREFIX}${id}`);
      }

      // Clear the IDs list
      await kv.del(ARTICLES_KEY);

      console.log('✅ All articles cleared');
    } catch (error) {
      console.error('Error clearing articles:', error);
    }
  }
}

export default KVStorage;