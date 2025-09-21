import { useState, useCallback, useEffect, type ReactNode } from 'react';
import type { Article, NewsState, CreateArticleRequest, UpdateArticleRequest } from '../types/index';
import { apiClient, KVStorageAPI } from '../utils/api';
import { NewsContext } from '../contexts/NewsContext';

interface NewsProviderProps {
  children: ReactNode;
}

export function NewsProvider({ children }: NewsProviderProps) {
  const [state, setState] = useState<NewsState>({
    articles: [],
    loading: false,
    error: null,
    selectedArticle: null,
  });

  // Check if we should use API or KV storage
  const useAPI = import.meta.env.VITE_USE_API === 'true';
  const useKV = import.meta.env.VITE_USE_KV !== 'false'; // Default to true

  const loadArticles = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      let articles: Article[] = [];

      if (useAPI) {
        // Try to load from PostgreSQL via API
        const response = await apiClient.getArticles({ published: true });
        if (response.success && response.data) {
          articles = response.data.articles;
        } else {
          throw new Error(response.error || 'Failed to load articles from API');
        }
      } else if (useKV) {
        // Use Vercel KV storage
        articles = await KVStorageAPI.getArticles();
      } else {
        // Fallback to localStorage (development only)
        articles = [];
      }

      setState(prev => ({
        ...prev,
        articles: articles.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
        loading: false,
      }));
    } catch (error) {
      console.warn('Failed to load articles:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load articles',
      }));
    }
  }, [useAPI, useKV]);

  const createArticle = useCallback(async (articleData: CreateArticleRequest): Promise<Article | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      let newArticle: Article;

      if (useAPI) {
        const response = await apiClient.createArticle(articleData);
        if (response.success && response.data) {
          newArticle = response.data;
        } else {
          throw new Error(response.error || 'Failed to create article via API');
        }
      } else if (useKV) {
        newArticle = await KVStorageAPI.createArticle(articleData);
      } else {
        throw new Error('No storage method available');
      }

      setState(prev => ({
        ...prev,
        articles: [newArticle, ...prev.articles],
        loading: false,
      }));

      return newArticle;
    } catch (error) {
      console.error('Failed to create article:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to create article',
      }));
      return null;
    }
  }, [useAPI, useKV]);

  const updateArticle = useCallback(async (updateData: UpdateArticleRequest): Promise<Article | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      let updatedArticle: Article | null = null;

      if (useAPI) {
        const response = await apiClient.updateArticle(updateData);
        if (response.success && response.data) {
          updatedArticle = response.data;
        } else {
          throw new Error(response.error || 'Failed to update article via API');
        }
      } else if (useKV) {
        updatedArticle = await KVStorageAPI.updateArticle(updateData);
      } else {
        throw new Error('No storage method available');
      }

      if (updatedArticle) {
        setState(prev => ({
          ...prev,
          articles: prev.articles.map(article =>
            article.id === updateData.id ? updatedArticle! : article
          ),
          loading: false,
        }));
      }

      return updatedArticle;
    } catch (error) {
      console.warn('Failed to update via API, falling back to localStorage:', error);

      try {
        const updatedArticle = await KVStorageAPI.updateArticle(updateData);
        if (updatedArticle) {
          setState(prev => ({
            ...prev,
            articles: prev.articles.map(article =>
              article.id === updateData.id ? updatedArticle! : article
            ),
            loading: false,
            error: null,
          }));
        }
        return updatedArticle;
      } catch (fallbackError) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: fallbackError instanceof Error ? fallbackError.message : 'Failed to update article',
        }));
        return null;
      }
    }
  }, [useAPI, useKV]);

  const deleteArticle = useCallback(async (id: string): Promise<boolean> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      let success = false;

      if (useAPI) {
        const response = await apiClient.deleteArticle({ id });
        success = response.success;
        if (!success) {
          throw new Error(response.error || 'Failed to delete article via API');
        }
      } else if (useKV) {
        success = await KVStorageAPI.deleteArticle(id);
      } else {
        throw new Error('No storage method available');
      }

      if (success) {
        setState(prev => ({
          ...prev,
          articles: prev.articles.filter(article => article.id !== id),
          loading: false,
        }));
      }

      return success;
    } catch (error) {
      console.warn('Failed to delete via API, falling back to localStorage:', error);

      try {
        const success = await KVStorageAPI.deleteArticle(id);
        if (success) {
          setState(prev => ({
            ...prev,
            articles: prev.articles.filter(article => article.id !== id),
            loading: false,
            error: null,
          }));
        }
        return success;
      } catch (fallbackError) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: fallbackError instanceof Error ? fallbackError.message : 'Failed to delete article',
        }));
        return false;
      }
    }
  }, [useAPI, useKV]);

  const getArticleBySlug = useCallback(async (slug: string): Promise<Article | null> => {
    try {
      if (useAPI) {
        const response = await apiClient.getArticleBySlug(slug);
        if (response.success && response.data) {
          return response.data;
        }
      }

      // Fallback to local articles
      const article = state.articles.find(a => a.slug === slug);
      return article || null;
    } catch (error) {
      console.error('Failed to get article by slug:', error);
      return null;
    }
  }, [useAPI, state.articles]);

  const refreshArticles = useCallback(async () => {
    await loadArticles();
  }, [loadArticles]);

  const searchArticles = useCallback((query: string): Article[] => {
    if (!query.trim()) return state.articles;

    const lowerQuery = query.toLowerCase();
    return state.articles.filter(article =>
      article.title.toLowerCase().includes(lowerQuery) ||
      article.excerpt.toLowerCase().includes(lowerQuery) ||
      article.content.toLowerCase().includes(lowerQuery)
    );
  }, [state.articles]);

  const filterArticles = useCallback((filter: 'all' | 'recent' | 'popular'): Article[] => {
    switch (filter) {
      case 'recent':
        return [...state.articles]
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 5);
      case 'popular':
        return [...state.articles]
          .sort((a, b) => {
            const aMedia = (a.images?.length || 0) + (a.videos?.length || 0);
            const bMedia = (b.images?.length || 0) + (b.videos?.length || 0);
            return bMedia - aMedia;
          });
      default:
        return state.articles;
    }
  }, [state.articles]);

  // Load articles on mount
  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  const value = {
    ...state,
    createArticle,
    updateArticle,
    deleteArticle,
    getArticleBySlug,
    refreshArticles,
    searchArticles,
    filterArticles,
  };

  return (
    <NewsContext.Provider value={value}>
      {children}
    </NewsContext.Provider>
  );
}