-- Add used_words column to games table and initialize values for existing rows
-- Run this in your Supabase SQL editor or via CLI. Safe to run multiple times.

BEGIN;

-- add column if not exists
ALTER TABLE public.games
  ADD COLUMN IF NOT EXISTS used_words text[] DEFAULT '{}';

-- initialize existing rows so current_word is considered used
UPDATE public.games
SET used_words = ARRAY[current_word]
WHERE used_words IS NULL OR cardinality(used_words) = 0;

COMMIT;
