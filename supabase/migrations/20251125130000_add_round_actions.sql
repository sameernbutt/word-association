-- Add round_actions table to track player clicks on Next/Override buttons
-- This table stores the action each player takes after seeing the match result

CREATE TABLE IF NOT EXISTS round_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid REFERENCES games(id) ON DELETE CASCADE NOT NULL,
  player_id uuid REFERENCES players(id) ON DELETE CASCADE NOT NULL,
  word text NOT NULL,
  action text NOT NULL CHECK (action IN ('next', 'override')),
  created_at timestamptz DEFAULT now(),
  -- Each player can only have one action per word/round
  UNIQUE(game_id, player_id, word)
);

ALTER TABLE round_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view round_actions"
  ON round_actions FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create round_actions"
  ON round_actions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can delete round_actions"
  ON round_actions FOR DELETE
  USING (true);
