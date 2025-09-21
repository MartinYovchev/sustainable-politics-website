// Main types for the application

export interface Article {
  id: string;
  slug: string;
  title: string;
  date: string;
  dateDisplay: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  images?: string[];
  videos?: string[];
  createdAt: string;
  updatedAt?: string;
  published: boolean;
  featured?: boolean;
  category?: string;
  tags?: string[];
  author?: string;
  source?: 'local' | 'database';
}

export interface NewsState {
  articles: Article[];
  loading: boolean;
  error: string | null;
  selectedArticle: Article | null;
}

export interface Language {
  code: 'bg' | 'en';
  name: string;
}

export interface Translation {
  [key: string]: string | Translation;
}

export interface TranslationContext {
  language: Language;
  translations: Record<string, Translation>;
  t: (key: string) => string;
  changeLanguage: (lang: Language['code']) => void;
}

export interface ContactOverlayState {
  isOpen: boolean;
  phoneNumber: string;
}

export interface CarouselState {
  currentIndex: number;
  totalSlides: number;
  autoPlay: boolean;
  interval: number;
}

// API related types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

export interface CreateArticleRequest {
  title: string;
  content: string;
  excerpt: string;
  date: string;
  coverImage?: string;
  images?: string[];
  videos?: string[];
  category?: string;
  tags?: string[];
  featured?: boolean;
}

export interface UpdateArticleRequest extends Partial<CreateArticleRequest> {
  id: string;
}

export interface DeleteArticleRequest {
  id: string;
}

// Admin types
export interface AdminUser {
  email: string;
  authenticated: boolean;
}

export interface AdminState {
  user: AdminUser | null;
  loading: boolean;
  error: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
  keyword: string;
}

// Navigation types
export interface NavigationItem {
  key: string;
  label: string;
  href?: string;
  section?: string;
  external?: boolean;
}

// Theme types
export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    textLight: string;
    border: string;
    success: string;
    error: string;
    warning: string;
    info: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  breakpoints: {
    mobile: string;
    tablet: string;
    desktop: string;
  };
}

// Form types
export interface FormFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'password' | 'textarea' | 'date' | 'url' | 'file';
  required?: boolean;
  placeholder?: string;
  rows?: number;
  accept?: string;
  multiple?: boolean;
}

export interface FormState {
  values: Record<string, string | number | boolean | File>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
}

// Media types
export interface MediaItem {
  id: string;
  url: string;
  type: 'image' | 'video';
  alt?: string;
  caption?: string;
}

export interface FileUploadResponse {
  url: string;
  filename: string;
  size: number;
  type: string;
}