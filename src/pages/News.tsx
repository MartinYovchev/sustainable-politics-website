import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search, Loader } from 'lucide-react';
import useTranslation from '../hooks/useTranslationHook';
import useNews from '../hooks/useNewsHook';
import NewsCard from '../components/NewsCard';

const News: React.FC = () => {
  const { t } = useTranslation();
  const { articles, loading, error, searchArticles, filterArticles } = useNews();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentFilter, setCurrentFilter] = useState<'all' | 'recent' | 'popular'>('all');
  const [displayedArticles, setDisplayedArticles] = useState(articles);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout>();

  // Update displayed articles when articles change or filters change
  useEffect(() => {
    let filtered = filterArticles(currentFilter);

    if (searchQuery.trim()) {
      filtered = searchArticles(searchQuery);
    }

    setDisplayedArticles(filtered);
  }, [articles, searchQuery, currentFilter, searchArticles, filterArticles]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    // Debounce search
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      // Search logic is handled in useEffect
    }, 300);

    setSearchTimeout(timeout);
  };

  const handleFilterChange = (filter: 'all' | 'recent' | 'popular') => {
    setCurrentFilter(filter);
    setSearchQuery(''); // Clear search when changing filter
  };

  return (
    <div className="news-page">
      <header className="news-header">
        <div className="news-header-content">
          <h1 className="news-title">{t('news.title')}</h1>
          <p className="news-subtitle">{t('news.subtitle')}</p>

          <nav className="news-nav">
            <Link to="/" className="news-nav-link">
              <ArrowLeft size={20} />
              {t('news.back_to_home')}
            </Link>
          </nav>

          {/* Search */}
          <div className="news-search">
            <div className="search-input-wrapper">
              <Search size={20} className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder={t('news.search_placeholder')}
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
          </div>

          {/* Filters */}
          <div className="news-filters">
            <div className="filter-buttons">
              {(['all', 'recent', 'popular'] as const).map((filter) => (
                <button
                  key={filter}
                  className={`filter-button ${currentFilter === filter ? 'active' : ''}`}
                  onClick={() => handleFilterChange(filter)}
                >
                  {t(`news.filters.${filter}`)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="news-main">
        <div className="news-container">
          {loading ? (
            <div className="news-loading">
              <Loader size={32} className="spinner" />
              <p>{t('news.loading')}</p>
            </div>
          ) : error ? (
            <div className="news-error">
              <p>{error}</p>
            </div>
          ) : displayedArticles.length === 0 ? (
            <div className="news-empty">
              {searchQuery ? (
                <>
                  <Search size={48} className="empty-icon" />
                  <h3>{t('news.no_results')}</h3>
                  <p>{t('news.no_results_for')} "{searchQuery}"</p>
                </>
              ) : (
                <>
                  <h3>{t('news.no_articles')}</h3>
                  <p>{t('news.check_later')}</p>
                </>
              )}
            </div>
          ) : (
            <div className="news-grid">
              {displayedArticles.map((article) => (
                <NewsCard
                  key={article.id}
                  article={article}
                  className="news-grid-item"
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="news-footer">
        <nav className="news-footer-nav">
          <Link to="/" className="btn btn-primary">
            <ArrowLeft size={20} />
            {t('news.back_to_news')}
          </Link>
        </nav>
      </footer>
    </div>
  );
};

export default News;