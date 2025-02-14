-- Create roles enum with three levels
CREATE TYPE user_role AS ENUM ('user', 'supporter', 'administrator');

-- Add role column to profiles table
ALTER TABLE profiles 
ADD COLUMN role user_role DEFAULT 'user'::user_role;

-- Create articles table
CREATE TABLE articles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  content TEXT NOT NULL,
  excerpt TEXT,
  featured_image_url TEXT,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  author_id UUID REFERENCES profiles(id) NOT NULL,
  view_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create comments table
CREATE TABLE comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  content TEXT NOT NULL,
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  author_id UUID REFERENCES profiles(id) NOT NULL,
  parent_id UUID REFERENCES comments(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable RLS
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Articles policies
CREATE POLICY "Published articles are viewable by everyone" 
ON articles FOR SELECT 
TO PUBLIC 
USING (status = 'published');

CREATE POLICY "Draft articles are viewable by their authors and administrators" 
ON articles FOR SELECT 
TO authenticated 
USING (
  author_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'administrator'::user_role
  )
);

CREATE POLICY "Articles are insertable by administrators" 
ON articles FOR INSERT 
TO authenticated 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'administrator'::user_role
  )
);

CREATE POLICY "Articles are deletable by authors and administrators" 
ON articles FOR DELETE
TO authenticated 
USING (
  author_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'administrator'::user_role
  )
);

CREATE POLICY "Articles are updatable by authors and administrators" 
ON articles FOR UPDATE
TO authenticated 
USING (
  author_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'administrator'::user_role
  )
);

-- Comments policies
CREATE POLICY "Comments are viewable by everyone" 
ON comments FOR SELECT 
TO PUBLIC 
USING (true);

CREATE POLICY "Comments are insertable by authenticated users" 
ON comments FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Comments are deletable by author and administrators" 
ON comments FOR DELETE
TO authenticated 
USING (
  author_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'administrator'::user_role
  )
);

-- Add indexes for better performance
CREATE INDEX articles_status_idx ON articles(status);
CREATE INDEX articles_published_at_idx ON articles(published_at);
CREATE INDEX comments_article_id_idx ON comments(article_id);