import { createContext } from 'react';
import type { Article, NewsState, CreateArticleRequest, UpdateArticleRequest } from '../types/index';

export const NewsContext = createContext<NewsState & {
  createArticle: (article: CreateArticleRequest) => Promise<Article | null>;
  updateArticle: (article: UpdateArticleRequest) => Promise<Article | null>;
  deleteArticle: (id: string) => Promise<boolean>;
  getArticleBySlug: (slug: string) => Promise<Article | null>;
  refreshArticles: () => Promise<void>;
  searchArticles: (query: string) => Article[];
  filterArticles: (filter: 'all' | 'recent' | 'popular') => Article[];
} | undefined>(undefined);
