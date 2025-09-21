import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import useTranslation from '../hooks/useTranslationHook';
import ContactOverlay from './ContactOverlay';

interface HeaderProps {
  variant?: 'landing' | 'page';
}

const Header: React.FC<HeaderProps> = ({ variant = 'landing' }) => {
  const { t, language, changeLanguage } = useTranslation();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isAlt, setIsAlt] = useState(variant === 'landing');

  // Handle scroll behavior for landing page
  useEffect(() => {
    if (variant !== 'landing') return;

    const handleScroll = () => {
      const banner = document.getElementById('banner');
      if (banner) {
        const bannerBottom = banner.offsetTop + banner.offsetHeight;
        const scrollPosition = window.scrollY + 80; // Header height offset

        setIsAlt(scrollPosition < bannerBottom);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [variant]);

  const navigationItems = [
    { key: 'home', label: t('navigation.home'), href: '/', section: 'home' },
    { key: 'news', label: t('navigation.news'), href: '/news' },
    { key: 'about', label: t('navigation.about'), href: '/', section: 'about' },
    { key: 'activities', label: t('navigation.activities'), href: '/', section: 'activities' },
    { key: 'goals', label: t('navigation.goals'), href: '/', section: 'goals' },
    { key: 'contact', label: t('navigation.contact'), href: '/', section: 'contact' },
  ];

  const handleLanguageToggle = () => {
    changeLanguage(language.code === 'bg' ? 'en' : 'bg');
  };

  const handleNavClick = (item: typeof navigationItems[0]) => {
    if (item.section && location.pathname === '/') {
      // Smooth scroll to section on homepage
      const element = document.getElementById(item.section);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setIsMenuOpen(false);
  };

  return (
    <>
      <header id="header" className={isAlt ? 'alt' : ''}>
        <h1>
          <Link to="/">
            {t('banner.title')}
          </Link>
        </h1>

        <nav id="nav">
          <ul>
            <li>
              <button
                id="langToggle"
                className="button primary"
                onClick={handleLanguageToggle}
              >
                {language.code === 'bg' ? 'BG' : 'EN'}
              </button>
            </li>
            <li className="special">
              <a
                href="#menu"
                className="menuToggle"
                onClick={(e) => {
                  e.preventDefault();
                  setIsMenuOpen(!isMenuOpen);
                }}
              >
                <span>{t('navigation.menu')}</span>
              </a>
              <div id="menu" className={isMenuOpen ? 'menu-open' : ''}>
                <a
                  href="#"
                  className="close"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsMenuOpen(false);
                  }}
                ></a>
                <ul>
                  {navigationItems.map((item) => (
                    <li key={item.key}>
                      {item.href === '/' && item.section ? (
                        <a
                          href="javascript:void(0)"
                          data-section={item.section}
                          onClick={() => handleNavClick(item)}
                        >
                          {item.label}
                        </a>
                      ) : (
                        <Link
                          to={item.href}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {item.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          </ul>
        </nav>
      </header>

      <ContactOverlay
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
      />
    </>
  );
};

export default Header;