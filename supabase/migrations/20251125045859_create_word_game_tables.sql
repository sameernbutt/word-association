/*
  # Word Association Game Schema

  1. New Tables
    - `games`
      - `id` (uuid, primary key) - Unique game identifier
      - `current_word` (text) - The current word being played
      - `status` (text) - Game status: 'waiting', 'playing', 'finished'
      - `created_at` (timestamptz) - Game creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp
    
    - `players`
      - `id` (uuid, primary key) - Unique player identifier
      - `game_id` (uuid, foreign key) - Reference to games table
      - `player_name` (text) - Player's display name
      - `player_number` (int) - Player 1 or Player 2
      - `created_at` (timestamptz) - Player join timestamp
    
    - `submissions`
      - `id` (uuid, primary key) - Unique submission identifier
      - `game_id` (uuid, foreign key) - Reference to games table
      - `player_id` (uuid, foreign key) - Reference to players table
      - `word` (text) - The word submitted
      - `submission_word` (text) - The word the player submitted as association
      - `created_at` (timestamptz) - Submission timestamp

  2. Security
    - Enable RLS on all tables
    - Add policies for public access (since this is a casual game without authentication)
    - Players can read and write to their own game data
*/

CREATE TABLE IF NOT EXISTS games (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  current_word text NOT NULL,
  status text DEFAULT 'waiting',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid REFERENCES games(id) ON DELETE CASCADE NOT NULL,
  player_name text NOT NULL,
  player_number int NOT NULL CHECK (player_number IN (1, 2)),
  created_at timestamptz DEFAULT now(),
  UNIQUE(game_id, player_number)
);

CREATE TABLE IF NOT EXISTS submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid REFERENCES games(id) ON DELETE CASCADE NOT NULL,
  player_id uuid REFERENCES players(id) ON DELETE CASCADE NOT NULL,
  word text NOT NULL,
  submission_word text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view games"
  ON games FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create games"
  ON games FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update games"
  ON games FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can view players"
  ON players FOR SELECT
  USING (true);

CREATE POLICY "Anyone can join as player"
  ON players FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view submissions"
  ON submissions FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create submissions"
  ON submissions FOR INSERT
  WITH CHECK (true);