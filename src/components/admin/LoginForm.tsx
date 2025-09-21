import React, { useState } from 'react';
import { Mail, Lock, Key, LogIn, Loader } from 'lucide-react';
import useTranslation from '../../hooks/useTranslationHook';
import useAdmin from '../../hooks/useAdminHook';

const LoginForm: React.FC = () => {
  const { t } = useTranslation();
  const { login, loading, error } = useAdmin();
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
    keyword: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(credentials);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="admin-login-form">
      {error && (
        <div className="admin-error">
          {error}
        </div>
      )}

      <div className="form-group">
        <label htmlFor="email" className="form-label">
          <Mail size={20} />
          {t('common.email')}
        </label>
        <input
          type="email"
          id="email"
          name="email"
          className="form-input"
          placeholder="info.sustainable.politics@gmail.com"
          value={credentials.email}
          onChange={handleChange}
          required
          disabled={loading}
        />
      </div>

      <div className="form-group">
        <label htmlFor="password" className="form-label">
          <Lock size={20} />
          {t('common.password')}
        </label>
        <input
          type="password"
          id="password"
          name="password"
          className="form-input"
          placeholder="Enter password"
          value={credentials.password}
          onChange={handleChange}
          required
          disabled={loading}
        />
      </div>

      <div className="form-group">
        <label htmlFor="keyword" className="form-label">
          <Key size={20} />
          {t('common.keyword')}
        </label>
        <input
          type="text"
          id="keyword"
          name="keyword"
          className="form-input"
          placeholder="Enter keyword"
          value={credentials.keyword}
          onChange={handleChange}
          required
          disabled={loading}
        />
      </div>

      <button
        type="submit"
        className="btn btn-primary btn-block"
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader size={20} className="spinner" />
            {t('admin.logging_in')}
          </>
        ) : (
          <>
            <LogIn size={20} />
            {t('admin.login')}
          </>
        )}
      </button>
    </form>
  );
};

export default LoginForm;