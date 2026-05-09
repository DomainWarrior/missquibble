-- Run this in your Supabase SQL editor (supabase.com → project → SQL Editor)

-- ── Tables ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS post_likes (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  post_slug  text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, post_slug)
);

CREATE TABLE IF NOT EXISTS post_saves (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  post_slug  text NOT NULL,
  post_title text,
  post_desc  text,
  post_url   text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, post_slug)
);

-- ── Row Level Security ───────────────────────────────────────

ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_saves ENABLE ROW LEVEL SECURITY;

-- Anyone can read like counts
CREATE POLICY "likes_public_read"  ON post_likes FOR SELECT USING (true);

-- Users can only insert/delete their own likes
CREATE POLICY "likes_own_insert"   ON post_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "likes_own_delete"   ON post_likes FOR DELETE USING  (auth.uid() = user_id);

-- Users can only manage their own saves
CREATE POLICY "saves_own_select"   ON post_saves FOR SELECT USING  (auth.uid() = user_id);
CREATE POLICY "saves_own_insert"   ON post_saves FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "saves_own_delete"   ON post_saves FOR DELETE USING  (auth.uid() = user_id);

-- ── Index ────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_likes_slug    ON post_likes(post_slug);
CREATE INDEX IF NOT EXISTS idx_likes_user    ON post_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_saves_user    ON post_saves(user_id);
CREATE INDEX IF NOT EXISTS idx_saves_slug    ON post_saves(post_slug);
