import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const Layout: React.FC = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const headerVariant = isHomePage ? 'landing' : 'page';

  useEffect(() => {
    if (isHomePage) {
      document.body.classList.add('landing');
      // Don't add is-preload here - it's handled by main.tsx for proper timing
    } else {
      document.body.classList.remove('landing');
    }

    return () => {
      document.body.classList.remove('landing');
    };
  }, [isHomePage]);

  return (
    <div id="page-wrapper" className={`page-wrapper ${isHomePage ? 'landing-page' : ''}`}>
      <Header variant={headerVariant} />
      <main className="main-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;