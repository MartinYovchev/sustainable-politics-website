import { nanoid } from "nanoid"
import type { Article, CreateArticleRequest, UpdateArticleRequest } from "../types"
import { Redis } from '@upstash/redis'

// Production KV client using Vercel KV REST API
class VercelKVClient {
  private baseUrl: string
  private token: string

  constructor() {
    // Use environment variables for production
    this.baseUrl = import.meta.env.VITE_KV_REST_API_URL || ""
    this.token = import.meta.env.VITE_KV_REST_API_TOKEN || ""

    if (!this.baseUrl || !this.token) {
      console.warn("KV credentials not found, falling back to localStorage")
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      if (!this.baseUrl || !this.token) {
        // Fallback to localStorage for development
        const value = localStorage.getItem(`kv:${key}`)
        return value ? JSON.parse(value) : null
      }

      const response = await fetch(`${this.baseUrl}/get/${key}`, {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      })
      console.log('KV GET response:', response)
      if (!response.ok) {
        if (response.status === 404) return null
        throw new Error(`KV GET failed: ${response.status}`)
      }

      const data = await response.json()
      return data.result
    } catch (error) {
      console.error(`KV get error for key ${key}:`, error)
      return null
    }
  }

  async set(key: string, value: unknown): Promise<void> {
    try {
      if (!this.baseUrl || !this.token) {
        // Fallback to localStorage for development
        localStorage.setItem(`kv:${key}`, JSON.stringify(value))
        return
      }

      const response = await fetch(`${this.baseUrl}/set/${key}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(value),
      })

      if (!response.ok) {
        throw new Error(`KV SET failed: ${response.status}`)
      }
    } catch (error) {
      console.error(`KV set error for key ${key}:`, error)
      throw error
    }
  }

  async del(key: string): Promise<void> {
    try {
      if (!this.baseUrl || !this.token) {
        // Fallback to localStorage for development
        localStorage.removeItem(`kv:${key}`)
        return
      }

      const response = await fetch(`${this.baseUrl}/del/${key}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`KV DEL failed: ${response.status}`)
      }
    } catch (error) {
      console.error(`KV del error for key ${key}:`, error)
      throw error
    }
  }
}

// const kv = new VercelKVClient()

const redis = new Redis({
  url: import.meta.env.VITE_KV_REST_API_URL || "",
  token: import.meta.env.VITE_KV_REST_API_TOKEN || "",
})


const ARTICLES_KEY = "articles"
const ARTICLE_PREFIX = "article:"

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

async function getArticleIds(): Promise<string[]> {
  try {
    const ids = await redis.get<string[]>(ARTICLES_KEY)
    return ids || []
  } catch {
    return []
  }
}

async function saveArticleIds(ids: string[]): Promise<void> {
  await redis.set(ARTICLES_KEY, ids)
}

// KV Storage API
export class KVStorage {
  static async getArticles(): Promise<Article[]> {
    const ids = await getArticleIds()
    const articles: Article[] = []

    for (const id of ids) {
      const article = await redis.get<Article>(`${ARTICLE_PREFIX}${id}`)
      if (article) articles.push(article)
    }

    return articles.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }

  static async initializeDefaultArticle(): Promise<void> {
    const existingArticles = await getArticleIds()
    if (existingArticles.length > 0) return

    const defaultArticle: CreateArticleRequest = {
      title: "Welcome to Sustainable Politics",
      content:
        "This is our first article about sustainable politics and environmental policies. We believe in creating a better future through informed political discourse and sustainable practices.",
      excerpt: "Welcome to our platform for sustainable political discourse.",
      date: new Date().toISOString(),
      coverImage: "/sustainable-politics-news.jpg",
      images: [],
      videos: [],
      category: "news",
      tags: ["welcome", "sustainability", "politics"],
      featured: true,
    }

    await this.createArticle(defaultArticle)
  }

  static async createArticle(data: CreateArticleRequest): Promise<Article> {
    const id = nanoid()
    const slug = generateSlug(data.title)

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
    }

    // Save article in KV
    await redis.set(`${ARTICLE_PREFIX}${id}`, article)

    // Update article IDs list
    const ids = await getArticleIds()
    ids.unshift(id)
    await saveArticleIds(ids)

    return article
  }

  static async updateArticle(data: UpdateArticleRequest): Promise<Article | null> {
    const existing = await redis.get<Article>(`${ARTICLE_PREFIX}${data.id}`)
    if (!existing) return null

    const updated: Article = {
      ...existing,
      ...data,
      slug: data.title ? generateSlug(data.title) : existing.slug,
      dateDisplay: data.date ? formatDate(data.date) : existing.dateDisplay,
      updatedAt: new Date().toISOString(),
    }

    await redis.set(`${ARTICLE_PREFIX}${data.id}`, updated)
    return updated
  }

  static async deleteArticle(id: string): Promise<boolean> {
    await redis.del(`${ARTICLE_PREFIX}${id}`)
    const ids = await getArticleIds()
    await saveArticleIds(ids.filter((x) => x !== id))
    return true
  }

  static async getArticleBySlug(slug: string): Promise<Article | null> {
    const ids = await getArticleIds()
    for (const id of ids) {
      const article = await redis.get<Article>(`${ARTICLE_PREFIX}${id}`)
      if (article && article.slug === slug) {
        return article
      }
    }
    return null
  }

  static async getArticleById(id: string): Promise<Article | null> {
    return await redis.get<Article>(`${ARTICLE_PREFIX}${id}`)
  }

  static async searchArticles(query: string): Promise<Article[]> {
    const articles = await this.getArticles()
    const lowerQuery = query.toLowerCase()
    return articles.filter(
      (article) =>
        article.title.toLowerCase().includes(lowerQuery) ||
        article.excerpt.toLowerCase().includes(lowerQuery) ||
        article.content.toLowerCase().includes(lowerQuery) ||
        (article.tags && article.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))),
    )
  }

  static async getFeaturedArticles(): Promise<Article[]> {
    const articles = await this.getArticles()
    return articles.filter((article) => article.featured)
  }

  static async getRecentArticles(limit = 5): Promise<Article[]> {
    const articles = await this.getArticles()
    return articles.slice(0, limit)
  }
}
