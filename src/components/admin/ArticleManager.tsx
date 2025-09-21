import React, { useState } from 'react';
import { Edit, Trash2, Eye, Images, Video, Calendar, User } from 'lucide-react';
import useNews from '../../hooks/useNewsHook';
import type { Article } from '../../types/index';

interface ArticleManagerProps {
  onEditArticle: (articleId: string) => void;
}

const ArticleManager: React.FC<ArticleManagerProps> = ({ onEditArticle }) => {
  const { articles, deleteArticle, loading } = useNews();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (articleId: string) => {
    if (window.confirm('Are you sure you want to delete this article?')) {
      setDeletingId(articleId);
      try {
        await deleteArticle(articleId);
      } catch (error) {
        console.error('Error deleting article:', error);
      } finally {
        setDeletingId(null);
      }
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('bg-BG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="article-manager-loading">
        <div className="loading-spinner" />
        <p>Loading articles...</p>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="article-manager-empty">
        <h3>No articles found</h3>
        <p>Create your first article to get started.</p>
      </div>
    );
  }

  return (
    <div className="article-manager">
      <div className="articles-grid">
        {articles.map((article: Article) => (
          <div key={article.id} className="article-card">
            {article.coverImage && (
              <div className="article-card-image">
                <img src={article.coverImage} alt={article.title} />
              </div>
            )}

            <div className="article-card-content">
              <h3 className="article-card-title">{article.title}</h3>

              <div className="article-card-meta">
                <div className="article-meta-item">
                  <Calendar size={16} />
                  <span>{formatDate(article.date)}</span>
                </div>
                <div className="article-meta-item">
                  <User size={16} />
                  <span>Published</span>
                </div>
              </div>

              <p className="article-card-excerpt">{article.excerpt}</p>

              <div className="article-card-stats">
                {article.images && article.images.length > 0 && (
                  <div className="article-stat">
                    <Images size={16} />
                    <span>{article.images.length}</span>
                  </div>
                )}
                {article.videos && article.videos.length > 0 && (
                  <div className="article-stat">
                    <Video size={16} />
                    <span>{article.videos.length}</span>
                  </div>
                )}
              </div>

              <div className="article-card-actions">
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={() => onEditArticle(article.id)}
                  title="Edit article"
                >
                  <Edit size={16} />
                  Edit
                </button>

                <button
                  className="btn btn-sm btn-info"
                  onClick={() => window.open(`/news/${article.slug}`, '_blank')}
                  title="Preview article"
                >
                  <Eye size={16} />
                  Preview
                </button>

                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDelete(article.id)}
                  disabled={deletingId === article.id}
                  title="Delete article"
                >
                  <Trash2 size={16} />
                  {deletingId === article.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ArticleManager;