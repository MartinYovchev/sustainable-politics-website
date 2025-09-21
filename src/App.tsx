import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { TranslationProvider } from './hooks/useTranslation';
import { NewsProvider } from './hooks/useNews';
import { AdminProvider } from './hooks/useAdmin';
import Layout from './components/Layout';
import Home from './pages/Home';
import News from './pages/News';
import NewsDetail from './pages/NewsDetail';
import Admin from './pages/Admin';
import NotFound from './pages/NotFound';
import "./index.css";
import './styles/main.css';

function App() {
  return (
    <TranslationProvider>
      <NewsProvider>
        <AdminProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="news" element={<News />} />
                <Route path="news/:slug" element={<NewsDetail />} />
                <Route path="*" element={<NotFound />} />
              </Route>
              <Route path="admin" element={<Admin />} />
            </Routes>
          </Router>
        </AdminProvider>
      </NewsProvider>
    </TranslationProvider>
  );
}

export default App;
