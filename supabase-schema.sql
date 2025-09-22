-- Create articles table
CREATE TABLE IF NOT EXISTS articles (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  date_display TEXT NOT NULL,
  cover_image TEXT,
  images TEXT[] DEFAULT '{}',
  videos TEXT[] DEFAULT '{}',
  category TEXT DEFAULT 'news',
  tags TEXT[] DEFAULT '{}',
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published BOOLEAN DEFAULT true,
  source TEXT DEFAULT 'supabase'
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_articles_published ON articles (published);
CREATE INDEX IF NOT EXISTS idx_articles_featured ON articles (featured);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles (category);
CREATE INDEX IF NOT EXISTS idx_articles_date ON articles (date DESC);
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles (slug);

-- Enable Row Level Security (RLS)
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Policy to allow anyone to read published articles
CREATE POLICY "Anyone can read published articles" ON articles
  FOR SELECT USING (published = true);

-- Policy to allow authenticated users to insert articles
CREATE POLICY "Authenticated users can insert articles" ON articles
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policy to allow authenticated users to update articles
CREATE POLICY "Authenticated users can update articles" ON articles
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Policy to allow authenticated users to delete articles
CREATE POLICY "Authenticated users can delete articles" ON articles
  FOR DELETE USING (auth.role() = 'authenticated');

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON articles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create a text search configuration for full-text search
CREATE INDEX IF NOT EXISTS idx_articles_search ON articles USING gin(
  to_tsvector('english', title || ' ' || excerpt || ' ' || content)
);