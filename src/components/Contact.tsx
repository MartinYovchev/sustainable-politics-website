import React, { useState } from 'react';
import useTranslation from '../hooks/useTranslationHook';
import ContactOverlay from './ContactOverlay';

const Contact: React.FC = () => {
  const { t } = useTranslation();
  const [isContactOpen, setIsContactOpen] = useState(false);

  return (
    <>
      <section id="contact" className="wrapper style4 special">
        <div className="inner">
          <header className="major">
            <h2>{t('contact.title')}</h2>
          </header>
          <ul className="actions stacked">
            <li>
              <button
                className="button fit primary"
                onClick={() => setIsContactOpen(true)}
              >
                {t('contact.button')}
              </button>
            </li>
          </ul>
        </div>
      </section>

      <ContactOverlay
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
      />
    </>
  );
};

export default Contact;