import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Game {
    id: string;
    current_word: string;
    status: 'waiting' | 'playing' | 'finished';
    created_at: string;
    updated_at: string;
}

export interface Player {
    id: string;
    game_id: string;
    player_name: string;
    player_number: 1 | 2;
    created_at: string;
}

export interface Submission {
    id: string;
    game_id: string;
    player_id: string;
    word: string;
    submission_word: string;
    created_at: string;
}