import React, { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, Images, Video, User, Share2, Facebook, Twitter, Linkedin, Mail } from 'lucide-react';
import useTranslation from '../hooks/useTranslationHook';
import useNews from '../hooks/useNewsHook';
import type { Article } from '../types/index';

const NewsDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useTranslation();
  const { getArticleBySlug } = useNews();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  useEffect(() => {
    const loadArticle = async () => {
      if (!slug) return;

      setLoading(true);
      try {
        const foundArticle = await getArticleBySlug(slug);
        setArticle(foundArticle);
      } catch (error) {
        console.error('Error loading article:', error);
      } finally {
        setLoading(false);
      }
    };

    loadArticle();
  }, [slug, getArticleBySlug]);

  const calculateReadingTime = (content: string): number => {
    const wordsPerMinute = 200;
    const words = content.split(/\s+/).length;
    return Math.max(1, Math.ceil(words / wordsPerMinute));
  };

  const handleShare = (platform: 'facebook' | 'twitter' | 'linkedin' | 'email') => {
    const url = window.location.href;
    const title = article?.title || '';

    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      email: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${t('news.read_more')}: ${url}`)}`,
    };

    if (platform === 'email') {
      window.location.href = shareUrls[platform];
    } else {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
  };

  const openLightbox = (imageSrc: string) => {
    setLightboxImage(imageSrc);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setLightboxImage(null);
    document.body.style.overflow = 'unset';
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeLightbox();
      }
    };

    if (lightboxImage) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [lightboxImage]);

  if (loading) {
    return (
      <div className="news-detail-loading">
        <div className="loading-spinner" />
        <p>{t('news.loading_article')}</p>
      </div>
    );
  }

  if (!article) {
    return <Navigate to="/news" replace />;
  }

  const readingTime = calculateReadingTime(article.content);

  return (
    <div className="news-detail">
      <header className="news-detail-header">
        <nav className="news-detail-nav">
          <Link to="/news" className="news-detail-back">
            <ArrowLeft size={20} />
            {t('news.back_to_news')}
          </Link>
          <Link to="/" className="news-detail-home">
            {t('news.back_to_home')}
          </Link>
        </nav>

        <div className="news-detail-header-content">
          <h1 className="news-detail-title">{article.title}</h1>
          <p className="news-detail-excerpt">{article.excerpt}</p>
        </div>
      </header>

      <main className="news-detail-main">
        <article className="news-detail-article">
          {/* Article Meta */}
          <div className="article-meta">
            <div className="article-meta-item">
              <Calendar size={16} />
              <span>{article.dateDisplay}</span>
            </div>
            <div className="article-meta-item">
              <Clock size={16} />
              <span>{readingTime} {t('common.minutes_read')}</span>
            </div>
            {article.images && article.images.length > 0 && (
              <div className="article-meta-item">
                <Images size={16} />
                <span>{article.images.length} {t('common.images')}</span>
              </div>
            )}
            {article.videos && article.videos.length > 0 && (
              <div className="article-meta-item">
                <Video size={16} />
                <span>{article.videos.length} {t('common.videos')}</span>
              </div>
            )}
            <div className="article-meta-item">
              <User size={16} />
              <span>{t('common.author')}</span>
            </div>
          </div>

          {/* Cover Image */}
          {article.coverImage && (
            <div className="article-cover">
              <img
                src={article.coverImage}
                alt={article.title}
                className="article-cover-image"
              />
            </div>
          )}

          {/* Article Content */}
          <div
            className="article-content"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {/* Photo Gallery */}
          {article.images && article.images.length > 0 && (
            <section className="article-gallery">
              <h3 className="article-gallery-title">
                <Images size={24} />
                {t('news.photo_gallery')} ({article.images.length})
              </h3>
              <div className="article-gallery-grid">
                {article.images.map((image, index) => (
                  <div
                    key={index}
                    className="article-gallery-item"
                    onClick={() => openLightbox(image)}
                  >
                    <img
                      src={image}
                      alt={`${t('common.images')} ${index + 1}`}
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Videos */}
          {article.videos && article.videos.length > 0 && (
            <section className="article-videos">
              <h3 className="article-videos-title">
                <Video size={24} />
                {t('news.event_videos')} ({article.videos.length})
              </h3>
              <div className="article-videos-grid">
                {article.videos.map((video, index) => (
                  <div key={index} className="article-video-item">
                    <iframe
                      src={video}
                      allowFullScreen
                      loading="lazy"
                      title={`${t('common.videos')} ${index + 1}`}
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Share Section */}
          <section className="article-share">
            <h3 className="article-share-title">
              <Share2 size={24} />
              {t('news.share_article')}
            </h3>
            <div className="article-share-buttons">
              <button
                className="share-button share-facebook"
                onClick={() => handleShare('facebook')}
                aria-label="Share on Facebook"
              >
                <Facebook size={20} />
              </button>
              <button
                className="share-button share-twitter"
                onClick={() => handleShare('twitter')}
                aria-label="Share on Twitter"
              >
                <Twitter size={20} />
              </button>
              <button
                className="share-button share-linkedin"
                onClick={() => handleShare('linkedin')}
                aria-label="Share on LinkedIn"
              >
                <Linkedin size={20} />
              </button>
              <button
                className="share-button share-email"
                onClick={() => handleShare('email')}
                aria-label="Share via Email"
              >
                <Mail size={20} />
              </button>
            </div>
          </section>
        </article>
      </main>

      <footer className="news-detail-footer">
        <nav className="news-detail-footer-nav">
          <Link to="/news" className="btn btn-primary">
            <ArrowLeft size={20} />
            {t('news.back_to_news')}
          </Link>
        </nav>
      </footer>

      {/* Lightbox */}
      {lightboxImage && (
        <div className="lightbox" onClick={closeLightbox}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close" onClick={closeLightbox}>
              ×
            </button>
            <img src={lightboxImage} alt="Enlarged view" />
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsDetail;