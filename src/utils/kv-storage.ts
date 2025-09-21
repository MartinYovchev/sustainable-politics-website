import { nanoid } from "nanoid";
import type { Article, CreateArticleRequest, UpdateArticleRequest } from "../types";

// Development fallback storage using localStorage
class LocalStorageKVClient {
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = localStorage.getItem(`kv:${key}`);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Local KV get error for key ${key}:`, error);
      return null;
    }
  }

  async set(key: string, value: unknown): Promise<void> {
    try {
      localStorage.setItem(`kv:${key}`, JSON.stringify(value));
    } catch (error) {
      console.error(`Local KV set error for key ${key}:`, error);
      throw error;
    }
  }

  async del(key: string): Promise<void> {
    try {
      localStorage.removeItem(`kv:${key}`);
    } catch (error) {
      console.error(`Local KV del error for key ${key}:`, error);
      throw error;
    }
  }
}

// Production API client for server-side endpoints
class ServerKVClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = '/api';
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      if (key === 'articles') {
        // Get list of articles
        const response = await fetch(`${this.baseUrl}/articles`);
        if (!response.ok) return null;

        const data = await response.json();
        if (data.success && data.data?.articles) {
          return data.data.articles.map((article: Article) => article.id) as T;
        }
        return null;
      } else if (key.startsWith('article:')) {
        // Get individual article by ID
        const articleId = key.replace('article:', '');
        const response = await fetch(`${this.baseUrl}/articles/${articleId}`);
        if (!response.ok) return null;

        const data = await response.json();
        return data.success ? data.data : null;
      }
      return null;
    } catch (error) {
      console.error(`KV get error for key ${key}:`, error);
      return null;
    }
  }

  async set(key: string, value: unknown): Promise<void> {
    try {
      if (key === 'articles') {
        // This is handled by the API automatically
        return;
      } else if (key.startsWith('article:')) {
        // Create or update article
        const article = value as Article;
        const response = await fetch(`${this.baseUrl}/articles`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(article),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
      }
    } catch (error) {
      console.error(`KV set error for key ${key}:`, error);
      throw error;
    }
  }

  async del(key: string): Promise<void> {
    try {
      if (key.startsWith('article:')) {
        const articleId = key.replace('article:', '');
        const response = await fetch(`${this.baseUrl}/articles/${articleId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
      }
    } catch (error) {
      console.error(`KV del error for key ${key}:`, error);
      throw error;
    }
  }
}

// Use localStorage for development, server API for production
const isDevelopment = import.meta.env.DEV;
const kv = isDevelopment ? new LocalStorageKVClient() : new ServerKVClient();

console.log('KV Storage Mode:', isDevelopment ? 'Development (localStorage)' : 'Production (Server API)');

const ARTICLES_KEY = "articles";
const ARTICLE_PREFIX = "article:";

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

async function getArticleIds(): Promise<string[]> {
  try {
    const ids = await kv.get<string[]>(ARTICLES_KEY);
    return ids || [];
  } catch {
    return [];
  }
}

async function saveArticleIds(ids: string[]): Promise<void> {
  await kv.set(ARTICLES_KEY, ids);
}

// KV Storage API
export class KVStorage {
  static async getArticles(): Promise<Article[]> {
    const ids = await getArticleIds();
    const articles: Article[] = [];

    for (const id of ids) {
      const article = await kv.get<Article>(`${ARTICLE_PREFIX}${id}`);
      if (article) articles.push(article);
    }

    return articles.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  static async initializeDefaultArticle(): Promise<void> {
    const existingArticles = await getArticleIds();
    if (existingArticles.length > 0) return;

    const defaultArticle: CreateArticleRequest = {
      title: "Welcome to Sustainable Politics",
      content: "This is our first article about sustainable politics and environmental policies.",
      excerpt: "Welcome to our platform for sustainable political discourse.",
      date: new Date().toISOString(),
      coverImage: "/images/news-1-cover.png",
      images: [],
      videos: [],
      category: "news",
      tags: ["welcome", "sustainability"],
      featured: true
    };

    await this.createArticle(defaultArticle);
  }

  static async createArticle(data: CreateArticleRequest): Promise<Article> {
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
      category: data.category || "news",
      tags: data.tags || [],
      featured: data.featured || false,
      createdAt: new Date().toISOString(),
      published: true,
      source: "kv",
    };

    // Save in Redis
    await kv.set(`${ARTICLE_PREFIX}${id}`, article);

    const ids = await getArticleIds();
    ids.unshift(id);
    await saveArticleIds(ids);

    return article;
  }

  static async updateArticle(data: UpdateArticleRequest): Promise<Article | null> {
    const existing = await kv.get<Article>(`${ARTICLE_PREFIX}${data.id}`);
    if (!existing) return null;

    const updated: Article = {
      ...existing,
      ...data,
      slug: data.title ? generateSlug(data.title) : existing.slug,
      dateDisplay: data.date ? formatDate(data.date) : existing.dateDisplay,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`${ARTICLE_PREFIX}${data.id}`, updated);
    return updated;
  }

  static async deleteArticle(id: string): Promise<boolean> {
    await kv.del(`${ARTICLE_PREFIX}${id}`);
    const ids = await getArticleIds();
    await saveArticleIds(ids.filter((x) => x !== id));
    return true;
  }

  static async getArticleBySlug(slug: string): Promise<Article | null> {
    const ids = await getArticleIds();
    for (const id of ids) {
      const article = await kv.get<Article>(`${ARTICLE_PREFIX}${id}`);
      if (article && article.slug === slug) {
        return article;
      }
    }
    return null;
  }

  static async searchArticles(query: string): Promise<Article[]> {
    const articles = await this.getArticles();
    const lowerQuery = query.toLowerCase();
    return articles.filter(article =>
      article.title.toLowerCase().includes(lowerQuery) ||
      article.excerpt.toLowerCase().includes(lowerQuery) ||
      article.content.toLowerCase().includes(lowerQuery) ||
      (article.tags && article.tags.some(tag => tag.toLowerCase().includes(lowerQuery)))
    );
  }

  static async getFeaturedArticles(): Promise<Article[]> {
    const articles = await this.getArticles();
    return articles.filter(article => article.featured);
  }

  static async getRecentArticles(limit = 5): Promise<Article[]> {
    const articles = await this.getArticles();
    return articles.slice(0, limit);
  }
}
