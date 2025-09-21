# Център за Устойчиви Политики v2

A modern React/TypeScript rewrite of the Center for Sustainable Policies website with PostgreSQL database integration.

## Features

- 🚀 **Modern Stack**: Built with Vite, React 19, TypeScript
- 🗄️ **Database Ready**: PostgreSQL integration for news articles
- 🌐 **Multilingual**: Bulgarian/English language support
- 📱 **Responsive**: Mobile-first design
- 🎨 **Modern UI**: Clean, professional design
- ⚡ **Fast**: Optimized performance with Vite
- 🔒 **Admin Panel**: Secure content management system

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: CSS3 with CSS Variables
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **Package Manager**: pnpm
- **Database**: PostgreSQL (ready for integration)

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+
- PostgreSQL (for production)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd sustainable-policies/v2
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Start the development server:
```bash
pnpm dev
```

The application will be available at `http://localhost:3000`.

## Development

### Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build
- `pnpm lint` - Run ESLint

### Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── admin/          # Admin panel components
│   ├── Banner.tsx      # Hero banner
│   ├── Header.tsx      # Navigation header
│   └── ...
├── pages/              # Page components
│   ├── Home.tsx        # Homepage
│   ├── News.tsx        # News listing
│   ├── NewsDetail.tsx  # Article detail
│   └── Admin.tsx       # Admin panel
├── hooks/              # Custom React hooks
│   ├── useTranslation.tsx
│   ├── useNews.tsx
│   └── useAdmin.tsx
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
│   ├── api.ts          # API client
│   └── translations.ts # Language translations
└── styles/             # CSS stylesheets
```

## Database Integration

The application is prepared for PostgreSQL integration with the following features:

### API Layer
- RESTful API client with fallback to localStorage
- Type-safe API responses
- Error handling and retry logic

### Articles Schema
```sql
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(500) NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  cover_image VARCHAR(500),
  images TEXT[],
  videos TEXT[],
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  published BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  category VARCHAR(100),
  tags TEXT[]
);
```

### Environment Variables

Create a `.env` file:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3001/api
VITE_USE_API=false

# Database (for backend)
DATABASE_URL=postgresql://username:password@localhost:5432/sustainable_policies
```

## Features

### Homepage
- Responsive hero banner
- About section with company logo
- Activities showcase with images
- Interactive goals carousel
- Contact overlay

### News System
- Article listing with search and filters
- Detailed article view with media galleries
- Social sharing functionality
- Responsive design

### Admin Panel
- Secure login with credentials
- Article creation and editing
- Media management (images/videos)
- Article preview and management
- Responsive admin interface

### Language Support
- Bulgarian/English translations
- Persistent language preference
- Comprehensive translation coverage

## Production Deployment

1. Build the application:
```bash
pnpm build
```

2. Set up PostgreSQL database with the required schema

3. Deploy the `dist` folder to your hosting provider

4. Set up environment variables on your hosting platform

## Admin Access

Default admin credentials (change in production):
- Email: `info.sustainable.politics@gmail.com`
- Password: `Cspa2@24`
- Keyword: `info2024`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

This project is proprietary and belongs to Център за Устойчиви Политики.

## Contact

For questions or support, contact: info.sustainable.politics@gmail.com