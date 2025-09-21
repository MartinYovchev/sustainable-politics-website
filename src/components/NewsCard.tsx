import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Images, Video, ArrowRight } from 'lucide-react';
import type { Article } from '../types/index';
import useTranslation from '../hooks/useTranslationHook';

interface NewsCardProps {
  article: Article;
  className?: string;
}

const NewsCard: React.FC<NewsCardProps> = ({ article, className = '' }) => {
  const { t } = useTranslation();

  const calculateReadingTime = (content: string): number => {
    const wordsPerMinute = 200;
    const words = content.split(/\s+/).length;
    return Math.max(1, Math.ceil(words / wordsPerMinute));
  };

  const readingTime = calculateReadingTime(article.content);

  return (
    <article className={`news-card ${className}`}>
      {article.coverImage && (
        <div className="news-card-image">
          <img
            src={article.coverImage}
            alt={article.title}
            loading="lazy"
          />
        </div>
      )}

      <div className="news-card-content">
        <h3 className="news-card-title">{article.title}</h3>

        <div className="news-card-meta">
          <div className="news-card-date">
            <Calendar size={16} />
            <span>{article.dateDisplay}</span>
          </div>
          <div className="news-card-reading-time">
            <Clock size={16} />
            <span>{readingTime} {t('common.minutes_read')}</span>
          </div>
        </div>

        <p className="news-card-excerpt">{article.excerpt}</p>

        {(article.images?.length || article.videos?.length) && (
          <div className="news-card-media-info">
            {article.images && article.images.length > 0 && (
              <div className="news-card-media-item">
                <Images size={16} />
                <span>{article.images.length} {t('common.images')}</span>
              </div>
            )}
            {article.videos && article.videos.length > 0 && (
              <div className="news-card-media-item">
                <Video size={16} />
                <span>{article.videos.length} {t('common.videos')}</span>
              </div>
            )}
          </div>
        )}

        <Link
          to={`/news/${article.slug}`}
          className="news-card-read-more"
        >
          {t('news.read_more')}
          <ArrowRight size={16} />
        </Link>
      </div>
    </article>
  );
};

export default NewsCard;