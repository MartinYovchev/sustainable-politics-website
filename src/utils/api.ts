import type {
  Article,
  ApiResponse,
  CreateArticleRequest,
  UpdateArticleRequest,
  DeleteArticleRequest,
  LoginRequest,
  AdminUser,
} from "../types"
import { KVStorage } from "../pages/api/kv-storage"

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? "/api" : "http://localhost:3001/api")

// Generic API client
class ApiClient {
  private baseURL: string
  private authToken: string | null = null

  constructor(baseURL: string) {
    this.baseURL = baseURL
    this.authToken = sessionStorage.getItem("auth-token")
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`

    const defaultHeaders: Record<string, string> = {
      "Content-Type": "application/json",
    }

    if (this.authToken) {
      defaultHeaders.Authorization = `Bearer ${this.authToken}`
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      return {
        data,
        success: true,
      }
    } catch (error) {
      console.error("API request failed:", error)
      return {
        data: null as T,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }
    }
  }

  setAuthToken(token: string | null) {
    this.authToken = token
    if (token) {
      sessionStorage.setItem("auth-token", token)
    } else {
      sessionStorage.removeItem("auth-token")
    }
  }

  // Authentication endpoints
  async login(credentials: LoginRequest): Promise<ApiResponse<{ user: AdminUser; token: string }>> {
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    })
  }

  async logout(): Promise<ApiResponse<null>> {
    const result = await this.request<null>("/auth/logout", {
      method: "POST",
    })
    this.setAuthToken(null)
    return result
  }

  // Articles endpoints
  async getArticles(params?: {
    page?: number
    limit?: number
    search?: string
    category?: string
    published?: boolean
  }): Promise<ApiResponse<{ articles: Article[]; total: number; page: number; totalPages: number }>> {
    const searchParams = new URLSearchParams()

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value))
        }
      })
    }

    const queryString = searchParams.toString()
    const endpoint = `/articles${queryString ? `?${queryString}` : ""}`

    return this.request(endpoint)
  }

  async getArticleById(id: string): Promise<ApiResponse<Article>> {
    return this.request(`/articles/${id}`)
  }

  async getArticleBySlug(slug: string): Promise<ApiResponse<Article>> {
    return this.request(`/articles/slug/${slug}`)
  }

  async createArticle(article: CreateArticleRequest): Promise<ApiResponse<Article>> {
    return this.request("/articles", {
      method: "POST",
      body: JSON.stringify(article),
    })
  }

  async updateArticle(article: UpdateArticleRequest): Promise<ApiResponse<Article>> {
    return this.request(`/articles/${article.id}`, {
      method: "PUT",
      body: JSON.stringify(article),
    })
  }

  async deleteArticle(request: DeleteArticleRequest): Promise<ApiResponse<null>> {
    return this.request(`/articles/${request.id}`, {
      method: "DELETE",
    })
  }

  async uploadImage(file: File): Promise<ApiResponse<{ url: string; filename: string }>> {
    const formData = new FormData()
    formData.append("image", file)

    return this.request("/upload/image", {
      method: "POST",
      body: formData,
      headers: {}, // Let browser set Content-Type for FormData
    })
  }

  async uploadVideo(file: File): Promise<ApiResponse<{ url: string; filename: string }>> {
    const formData = new FormData()
    formData.append("video", file)

    return this.request("/upload/video", {
      method: "POST",
      body: formData,
      headers: {}, // Let browser set Content-Type for FormData
    })
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<{ status: string; timestamp: string }>> {
    return this.request("/health")
  }
}

// Create and export the API client instance
export const apiClient = new ApiClient(API_BASE_URL)

// KV Storage wrapper for simpler API usage
export class KVStorageAPI {
  static async getArticles(): Promise<Article[]> {
    try {
      const articles = await KVStorage.getArticles()
      if (articles.length === 0) {
        await KVStorage.initializeDefaultArticle()
        return await KVStorage.getArticles()
      }
      return articles
    } catch (error) {
      console.error("Error loading articles from KV:", error)
      return []
    }
  }

  static async createArticle(article: CreateArticleRequest): Promise<Article> {
    return await KVStorage.createArticle(article)
  }

  static async updateArticle(update: UpdateArticleRequest): Promise<Article | null> {
    return await KVStorage.updateArticle(update)
  }

  static async deleteArticle(id: string): Promise<boolean> {
    return await KVStorage.deleteArticle(id)
  }

  static async getArticleBySlug(slug: string): Promise<Article | null> {
    return await KVStorage.getArticleBySlug(slug)
  }

  static async searchArticles(query: string): Promise<Article[]> {
    return await KVStorage.searchArticles(query)
  }

  static async getFeaturedArticles(): Promise<Article[]> {
    return await KVStorage.getFeaturedArticles()
  }

  static async getRecentArticles(limit?: number): Promise<Article[]> {
    return await KVStorage.getRecentArticles(limit)
  }
}

export default apiClient
