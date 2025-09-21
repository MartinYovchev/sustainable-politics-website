import { useState, useCallback, useEffect, type ReactNode } from 'react';
import type { Article, NewsState, CreateArticleRequest, UpdateArticleRequest } from '../types/index';
import { KVStorageAPI } from '../utils/api';
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

  const loadArticles = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Always use KV storage for production consistency
      const articles = await KVStorageAPI.getArticles();

      setState(prev => ({
        ...prev,
        articles: articles.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
        loading: false,
      }));
    } catch (error) {
      console.error('Failed to load articles:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load articles',
      }));
    }
  }, []);

  const createArticle = useCallback(async (articleData: CreateArticleRequest): Promise<Article | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const newArticle = await KVStorageAPI.createArticle(articleData);

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
  }, []);

  const updateArticle = useCallback(async (updateData: UpdateArticleRequest): Promise<Article | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const updatedArticle = await KVStorageAPI.updateArticle(updateData);

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
      console.error('Failed to update article:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to update article',
      }));
      return null;
    }
  }, []);

  const deleteArticle = useCallback(async (id: string): Promise<boolean> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const success = await KVStorageAPI.deleteArticle(id);

      if (success) {
        setState(prev => ({
          ...prev,
          articles: prev.articles.filter(article => article.id !== id),
          loading: false,
        }));
      }

      return success;
    } catch (error) {
      console.error('Failed to delete article:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to delete article',
      }));
      return false;
    }
  }, []);

  const getArticleBySlug = useCallback(async (slug: string): Promise<Article | null> => {
    try {
      return await KVStorageAPI.getArticleBySlug(slug);
    } catch (error) {
      console.error('Failed to get article by slug:', error);
      return null;
    }
  }, []);

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