import React, { useEffect } from 'react';
import useTranslation from '../hooks/useTranslationHook';

interface ContactOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const ContactOverlay: React.FC<ContactOverlayProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleOverlayClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`contact-overlay ${isOpen ? 'visible' : ''}`} onClick={handleOverlayClick}>
      <div className="contact-content">
        <span className="contact-close" onClick={onClose}>
          &times;
        </span>

        <h2 className="contact-title">{t('contact.title')}</h2>
        <div className="contact-number">+359 89 8779 928</div>
      </div>
    </div>
  );
};

export default ContactOverlay;