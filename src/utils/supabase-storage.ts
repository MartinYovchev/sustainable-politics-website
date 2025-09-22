import { nanoid } from "nanoid"
import { createClient } from '@supabase/supabase-js'
import type { Article, CreateArticleRequest, UpdateArticleRequest } from "../types"

// Supabase client configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase credentials not found. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file")
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '')

// Database types for Supabase
export interface DatabaseArticle {
  id: string
  slug: string
  title: string
  content: string
  excerpt: string
  date: string
  date_display: string
  cover_image: string
  images: string[]
  videos: string[]
  category: string
  tags: string[]
  featured: boolean
  created_at: string
  updated_at?: string
  published: boolean
  source: string
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function formatDate(dateString: string): string {
  // Handle both "YYYY-MM-DD" and ISO timestamp formats
  const date = new Date(dateString.includes('T') ? dateString : `${dateString}T00:00:00.000Z`)
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

// Convert database article to frontend article format
function dbToArticle(dbArticle: DatabaseArticle): Article {
  return {
    id: dbArticle.id,
    slug: dbArticle.slug,
    title: dbArticle.title,
    content: dbArticle.content,
    excerpt: dbArticle.excerpt,
    date: dbArticle.date,
    dateDisplay: dbArticle.date_display,
    coverImage: dbArticle.cover_image,
    images: dbArticle.images,
    videos: dbArticle.videos,
    category: dbArticle.category,
    tags: dbArticle.tags,
    featured: dbArticle.featured,
    createdAt: dbArticle.created_at,
    updatedAt: dbArticle.updated_at,
    published: dbArticle.published,
    source: dbArticle.source as "local" | "database" | "kv",
  }
}


// Supabase Storage API
export class SupabaseStorage {
  static async getArticles(): Promise<Article[]> {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('published', true)
      .order('date', { ascending: false })

    if (error) {
      console.error('Error fetching articles:', error)
      return []
    }

    return data?.map(dbToArticle) || []
  }

  static async initializeDefaultArticle(): Promise<void> {
    const { count } = await supabase
      .from('articles')
      .select('*', { count: 'exact', head: true })

    if (count && count > 0) return

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
    console.log('Create request data:', data)

    const id = nanoid()
    const slug = generateSlug(data.title)

    const article: Omit<DatabaseArticle, 'created_at' | 'updated_at'> = {
      id,
      slug,
      title: data.title,
      content: data.content,
      excerpt: data.excerpt,
      date: data.date.includes('T') ? data.date : `${data.date}T00:00:00.000Z`,
      date_display: formatDate(data.date),
      cover_image: data.coverImage || "",
      images: data.images || [],
      videos: data.videos || [],
      category: data.category || "news",
      tags: data.tags || [],
      featured: data.featured || false,
      published: true,
      source: "database",
    }

    console.log('Create article data:', article)

    const { data: insertedData, error } = await supabase
      .from('articles')
      .insert([article])
      .select()
      .single()

    if (error) {
      console.error('Error creating article:', error)
      throw new Error(`Failed to create article: ${error.message}`)
    }

    if (!insertedData) {
      throw new Error('No data returned after creating article')
    }

    return dbToArticle(insertedData)
  }

  static async updateArticle(data: UpdateArticleRequest): Promise<Article | null> {
    console.log('Update request data:', data)

    // Create clean update object with only database column names
    const updateData: Record<string, any> = {}

    // Map frontend field names to database column names
    if (data.title !== undefined) {
      updateData.title = data.title
      updateData.slug = generateSlug(data.title)
    }
    if (data.content !== undefined) updateData.content = data.content
    if (data.excerpt !== undefined) updateData.excerpt = data.excerpt
    if (data.date !== undefined) {
      updateData.date = data.date.includes('T') ? data.date : `${data.date}T00:00:00.000Z`
      updateData.date_display = formatDate(data.date)
    }
    if (data.coverImage !== undefined) updateData.cover_image = data.coverImage
    if (data.images !== undefined) updateData.images = data.images
    if (data.videos !== undefined) updateData.videos = data.videos
    if (data.category !== undefined) updateData.category = data.category
    if (data.tags !== undefined) updateData.tags = data.tags
    if (data.featured !== undefined) updateData.featured = data.featured

    console.log('Mapped update data:', updateData)

    const { data: updatedData, error } = await supabase
      .from('articles')
      .update(updateData)
      .eq('id', data.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating article:', error)
      console.error('Update data that failed:', JSON.stringify(updateData, null, 2))
      return null
    }

    return updatedData ? dbToArticle(updatedData) : null
  }

  static async deleteArticle(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('articles')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting article:', error)
      return false
    }

    return true
  }

  static async getArticleBySlug(slug: string): Promise<Article | null> {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .single()

    if (error) {
      if (error.code !== 'PGRST116') { // Not found error
        console.error('Error fetching article by slug:', error)
      }
      return null
    }

    return data ? dbToArticle(data) : null
  }

  static async getArticleById(id: string): Promise<Article | null> {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code !== 'PGRST116') { // Not found error
        console.error('Error fetching article by id:', error)
      }
      return null
    }

    return data ? dbToArticle(data) : null
  }

  static async searchArticles(query: string): Promise<Article[]> {
    const lowerQuery = query.toLowerCase()

    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('published', true)
      .or(`title.ilike.%${lowerQuery}%,excerpt.ilike.%${lowerQuery}%,content.ilike.%${lowerQuery}%`)
      .order('date', { ascending: false })

    if (error) {
      console.error('Error searching articles:', error)
      return []
    }

    return data?.map(dbToArticle) || []
  }

  static async getFeaturedArticles(): Promise<Article[]> {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('published', true)
      .eq('featured', true)
      .order('date', { ascending: false })

    if (error) {
      console.error('Error fetching featured articles:', error)
      return []
    }

    return data?.map(dbToArticle) || []
  }

  static async getRecentArticles(limit = 5): Promise<Article[]> {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('published', true)
      .order('date', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching recent articles:', error)
      return []
    }

    return data?.map(dbToArticle) || []
  }
}