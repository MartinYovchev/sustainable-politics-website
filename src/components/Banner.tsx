import React, { useState } from 'react';
import useTranslation from '../hooks/useTranslationHook';
import ContactOverlay from './ContactOverlay';

const Banner: React.FC = () => {
  const { t } = useTranslation();
  const [isContactOpen, setIsContactOpen] = useState(false);

  const handleLearnMore = () => {
    const aboutSection = document.getElementById('about');
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <section id="banner">
        <div className="inner">
          <h2>{t('banner.title')}</h2>
          <p>
            {t('banner.subtitle').split('\n').map((line, index) => (
              <React.Fragment key={index}>
                {line}
                {index < t('banner.subtitle').split('\n').length - 1 && <br />}
              </React.Fragment>
            ))}
          </p>
          <ul className="actions special">
            <li>
              <button
                className="button primary"
                onClick={() => setIsContactOpen(true)}
              >
                {t('contact.title')}
              </button>
            </li>
          </ul>
        </div>
        <button
          className="more scrolly"
          onClick={handleLearnMore}
          aria-label="Learn more"
        >
          {t('banner.learnMore')}
        </button>
      </section>

      <ContactOverlay
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
      />
    </>
  );
};

export default Banner;