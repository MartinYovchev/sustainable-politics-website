import React, { useState, useEffect } from 'react';
import { Shield, Newspaper, LogOut, Plus, List } from 'lucide-react';
import useTranslation from '../hooks/useTranslationHook';
import useAdmin from '../hooks/useAdminHook';
import LoginForm from '../components/admin/LoginForm';
import ArticleEditor from '../components/admin/ArticleEditor';
import ArticleManager from '../components/admin/ArticleManager';

type AdminTab = 'create' | 'manage';

const Admin: React.FC = () => {
  const { t } = useTranslation();
  const { logout, checkAuth } = useAdmin();
  const [activeTab, setActiveTab] = useState<AdminTab>('manage');
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);

  useEffect(() => {
    // Handle URL hash for tabs
    const hash = window.location.hash.replace('#', '');
    if (hash === 'create' || hash === 'manage') {
      setActiveTab(hash);
    }
  }, []);

  const handleTabChange = (tab: AdminTab) => {
    setActiveTab(tab);
    window.location.hash = tab;
    setEditingArticleId(null); // Clear editing state when switching tabs
  };

  const handleEditArticle = (articleId: string) => {
    setEditingArticleId(articleId);
    setActiveTab('create');
    window.location.hash = 'create';
  };

  const handleArticleCreated = () => {
    setActiveTab('manage');
    setEditingArticleId(null);
    window.location.hash = 'manage';
  };

  const handleLogout = async () => {
    await logout();
    // Optionally redirect to home page
    window.location.href = '/';
  };

  if (!checkAuth()) {
    return (
      <div className="admin-login-page">
        <div className="admin-login-container">
          <div className="admin-login-header">
            <Shield size={48} className="admin-login-icon" />
            <h2>{t('admin.title')}</h2>
            <p>{t('admin.subtitle')}</p>
          </div>
          <LoginForm />
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <header className="admin-header">
        <div className="admin-header-content">
          <div className="admin-header-info">
            <h1 className="admin-title">
              <Newspaper size={32} />
              News Management
            </h1>
            <p className="admin-subtitle">Create, edit and manage news articles</p>
          </div>
          <button
            className="admin-logout-btn"
            onClick={handleLogout}
          >
            <LogOut size={20} />
            {t('admin.logout')}
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="admin-tabs">
        <button
          className={`admin-tab ${activeTab === 'create' ? 'active' : ''}`}
          onClick={() => handleTabChange('create')}
        >
          <Plus size={20} />
          {t('admin.create_article')}
        </button>
        <button
          className={`admin-tab ${activeTab === 'manage' ? 'active' : ''}`}
          onClick={() => handleTabChange('manage')}
        >
          <List size={20} />
          {t('admin.manage_articles')}
        </button>
      </nav>

      {/* Tab Content */}
      <main className="admin-main">
        {activeTab === 'create' && (
          <div className="admin-tab-content">
            <h2 className="admin-section-title">
              {editingArticleId ? 'Edit Article' : t('admin.article_editor')}
            </h2>
            <ArticleEditor
              editingId={editingArticleId}
              onArticleCreated={handleArticleCreated}
              onCancel={() => {
                setEditingArticleId(null);
                setActiveTab('manage');
              }}
            />
          </div>
        )}

        {activeTab === 'manage' && (
          <div className="admin-tab-content">
            <div className="admin-section-header">
              <h2 className="admin-section-title">{t('admin.article_archive')}</h2>
              <button
                className="btn btn-primary"
                onClick={() => handleTabChange('create')}
              >
                <Plus size={20} />
                Create New Article
              </button>
            </div>
            <ArticleManager onEditArticle={handleEditArticle} />
          </div>
        )}
      </main>
    </div>
  );
};

export default Admin;