import React, { useState, useEffect, useRef } from 'react';
import { Save, X, Plus, Image, Video, Calendar, FileText, Quote, Upload } from 'lucide-react';
import useTranslation from '../../hooks/useTranslationHook';
import useNews from '../../hooks/useNewsHook';
import { SupabaseUpload } from '../../utils/supabase-upload';
import type { CreateArticleRequest } from '../../types/index';

interface ArticleEditorProps {
  editingId?: string | null;
  onArticleCreated?: () => void;
  onCancel?: () => void;
}

const ArticleEditor: React.FC<ArticleEditorProps> = ({
  editingId,
  onArticleCreated,
  onCancel,
}) => {
  const { t } = useTranslation();
  const { articles, createArticle, updateArticle } = useNews();

  const [formData, setFormData] = useState<CreateArticleRequest>({
    title: '',
    content: '',
    excerpt: '',
    date: new Date().toISOString().split('T')[0],
    coverImage: '',
    images: [],
    videos: [],
    category: 'news',
    tags: [],
    featured: false,
  });

  const [tempImageUrl, setTempImageUrl] = useState('');
  const [tempVideoUrl, setTempVideoUrl] = useState('');
  const [saving, setSaving] = useState(false);

  // File upload refs
  const coverImageInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Load article for editing
  useEffect(() => {
    if (editingId) {
      const article = articles.find(a => a.id === editingId);
      if (article) {
        setFormData({
          title: article.title,
          content: article.content,
          excerpt: article.excerpt,
          date: article.date,
          coverImage: article.coverImage || '',
          images: article.images || [],
          videos: article.videos || [],
          category: article.category || 'news',
          tags: article.tags || [],
          featured: article.featured || false,
        });
      }
    } else {
      // Reset form for new article
      setFormData({
        title: '',
        content: '',
        excerpt: '',
        date: new Date().toISOString().split('T')[0],
        coverImage: '',
        images: [],
        videos: [],
        category: 'news',
        tags: [],
        featured: false,
      });
    }
  }, [editingId, articles]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };


  const handleCoverImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = SupabaseUpload.validateImage(file);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    try {
      const result = await SupabaseUpload.uploadImage(file);
      setFormData(prev => ({
        ...prev,
        coverImage: result.url,
      }));
      alert('Cover image uploaded successfully!');
    } catch (error) {
      console.error('Error uploading cover image:', error);
      alert('Failed to upload cover image');
    }

    // Reset file input
    if (coverImageInputRef.current) {
      coverImageInputRef.current.value = '';
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    for (const file of files) {
      const validation = SupabaseUpload.validateImage(file);
      if (!validation.valid) {
        alert(`${file.name}: ${validation.error}`);
        continue;
      }

      try {
        const result = await SupabaseUpload.uploadImage(file);
        setFormData(prev => ({
          ...prev,
          images: [...(prev.images || []), result.url],
        }));
        alert(`${file.name} uploaded successfully!`);
      } catch (error) {
        console.error('Error uploading image:', error);
        alert(`Failed to upload ${file.name}`);
      }
    }

    // Reset file input
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    for (const file of files) {
      const validation = SupabaseUpload.validateVideo(file);
      if (!validation.valid) {
        alert(`${file.name}: ${validation.error}`);
        continue;
      }

      try {
        const result = await SupabaseUpload.uploadVideo(file);
        setFormData(prev => ({
          ...prev,
          videos: [...(prev.videos || []), result.url],
        }));
        alert(`${file.name} uploaded successfully!`);
      } catch (error) {
        console.error('Error uploading video:', error);
        alert(`Failed to upload ${file.name}`);
      }
    }

    // Reset file input
    if (videoInputRef.current) {
      videoInputRef.current.value = '';
    }
  };

  const addImage = () => {
    if (tempImageUrl.trim()) {
      setFormData(prev => ({
        ...prev,
        images: [...(prev.images || []), tempImageUrl.trim()],
      }));
      setTempImageUrl('');
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images?.filter((_, i) => i !== index) || [],
    }));
  };

  const addVideo = () => {
    if (tempVideoUrl.trim()) {
      let embedUrl = tempVideoUrl.trim();

      // Convert YouTube URLs to embed format
      if (embedUrl.includes('youtube.com/watch')) {
        const videoId = embedUrl.split('v=')[1]?.split('&')[0];
        embedUrl = `https://www.youtube.com/embed/${videoId}`;
      } else if (embedUrl.includes('youtu.be/')) {
        const videoId = embedUrl.split('youtu.be/')[1]?.split('?')[0];
        embedUrl = `https://www.youtube.com/embed/${videoId}`;
      }

      setFormData(prev => ({
        ...prev,
        videos: [...(prev.videos || []), embedUrl],
      }));
      setTempVideoUrl('');
    }
  };

  const removeVideo = (index: number) => {
    setFormData(prev => ({
      ...prev,
      videos: prev.videos?.filter((_, i) => i !== index) || [],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingId) {
        await updateArticle({ id: editingId, ...formData });
      } else {
        await createArticle(formData);
      }
      onArticleCreated?.();
    } catch (error) {
      console.error('Error saving article:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="article-editor">
      <form onSubmit={handleSubmit} className="article-form">
        {/* Basic Information */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="title" className="form-label">
              <FileText size={20} />
              Article Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              className="form-input"
              placeholder="Enter article title..."
              value={formData.title}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="date" className="form-label">
              <Calendar size={20} />
              Publication Date
            </label>
            <input
              type="date"
              id="date"
              name="date"
              className="form-input"
              value={formData.date}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>

        {/* Content */}
        <div className="form-group">
          <label htmlFor="excerpt" className="form-label">
            <Quote size={20} />
            Article Excerpt
          </label>
          <textarea
            id="excerpt"
            name="excerpt"
            className="form-textarea"
            placeholder="Brief summary of the article..."
            value={formData.excerpt}
            onChange={handleInputChange}
            rows={3}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="content" className="form-label">
            <FileText size={20} />
            Article Content
          </label>
          <textarea
            id="content"
            name="content"
            className="form-textarea"
            placeholder="Full article content (HTML supported)..."
            value={formData.content}
            onChange={handleInputChange}
            rows={12}
            required
          />
        </div>

        {/* Cover Image */}
        <div className="form-group">
          <label htmlFor="coverImage" className="form-label">
            <Image size={20} />
            Cover Image
          </label>

          <div className="dual-input-container">
            <input
              type="url"
              id="coverImage"
              name="coverImage"
              className="form-input"
              placeholder="https://example.com/cover-image.jpg"
              value={formData.coverImage}
              onChange={handleInputChange}
            />
            <span className="input-separator">OR</span>
            <div className="file-upload-section">
              <input
                type="file"
                ref={coverImageInputRef}
                onChange={handleCoverImageUpload}
                accept="image/*"
                style={{ display: 'none' }}
              />
              <button
                type="button"
                className="btn btn-secondary file-upload-btn"
                onClick={() => coverImageInputRef.current?.click()}
              >
                <Upload size={20} />
                Upload Image
              </button>
            </div>
          </div>

          {formData.coverImage && (
            <div className="image-preview">
              <img src={formData.coverImage} alt="Cover preview" />
              <button
                type="button"
                className="remove-preview-btn"
                onClick={() => setFormData(prev => ({ ...prev, coverImage: '' }))}
              >
                <X size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Gallery Images */}
        <div className="media-section">
          <h3 className="media-section-title">
            <Image size={20} />
            Gallery Images ({formData.images?.length || 0})
          </h3>

          <div className="dual-input-container">
            <div className="media-input-row">
              <input
                type="url"
                className="form-input"
                placeholder="https://example.com/image.jpg"
                value={tempImageUrl}
                onChange={(e) => setTempImageUrl(e.target.value)}
              />
              <button type="button" className="btn btn-secondary" onClick={addImage}>
                <Plus size={20} />
                Add URL
              </button>
            </div>
            <span className="input-separator">OR</span>
            <div className="file-upload-section">
              <input
                type="file"
                ref={imageInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                multiple
                style={{ display: 'none' }}
              />
              <button
                type="button"
                className="btn btn-secondary file-upload-btn"
                onClick={() => imageInputRef.current?.click()}
              >
                <Upload size={20} />
                Upload Images
              </button>
            </div>
          </div>

          {formData.images && formData.images.length > 0 && (
            <div className="media-preview-grid">
              {formData.images.map((image, index) => (
                <div key={index} className="media-preview-item">
                  <img src={image} alt={`Gallery ${index + 1}`} />
                  <button
                    type="button"
                    className="media-remove-btn"
                    onClick={() => removeImage(index)}
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Videos */}
        <div className="media-section">
          <h3 className="media-section-title">
            <Video size={20} />
            Video Content ({formData.videos?.length || 0})
          </h3>

          <div className="dual-input-container">
            <div className="media-input-row">
              <input
                type="url"
                className="form-input"
                placeholder="https://youtube.com/watch?v=..."
                value={tempVideoUrl}
                onChange={(e) => setTempVideoUrl(e.target.value)}
              />
              <button type="button" className="btn btn-secondary" onClick={addVideo}>
                <Plus size={20} />
                Add URL
              </button>
            </div>
            <span className="input-separator">OR</span>
            <div className="file-upload-section">
              <input
                type="file"
                ref={videoInputRef}
                onChange={handleVideoUpload}
                accept="video/*"
                multiple
                style={{ display: 'none' }}
              />
              <button
                type="button"
                className="btn btn-secondary file-upload-btn"
                onClick={() => videoInputRef.current?.click()}
              >
                <Upload size={20} />
                Upload Videos
              </button>
            </div>
          </div>

          {formData.videos && formData.videos.length > 0 && (
            <div className="media-preview-grid">
              {formData.videos.map((video, index) => (
                <div key={index} className="media-preview-item video-preview">
                  <iframe
                    src={video}
                    allowFullScreen
                    title={`Video ${index + 1}`}
                  />
                  <button
                    type="button"
                    className="media-remove-btn"
                    onClick={() => removeVideo(index)}
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Buttons */}
        <div className="form-actions">
          {onCancel && (
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              {t('common.cancel')}
            </button>
          )}
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? (
              'Saving...'
            ) : (
              <>
                <Save size={20} />
                {editingId ? 'Update Article' : 'Create Article'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ArticleEditor;