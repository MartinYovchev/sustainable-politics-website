import React from 'react';
import useTranslation from '../hooks/useTranslationHook';

const About: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section id="about" className="section about-section">
      <div className="section-inner">
        <header className="section-header">
          <h2 className="section-title">{t('about.title')}</h2>
        </header>

        <div className="about-content">
          <div className="about-logo">
            <img src="/images/logo_csp.png" alt="Logo" className="logo-image" />
          </div>

          <div className="about-text">
            <p className="about-description">
              {t('about.description')}
            </p>
            <p className="about-values">
              {t('about.values')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;