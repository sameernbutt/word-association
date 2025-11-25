import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { supabase, Game, Player, Submission } from './lib/supabase';
import { loadWords, getRandomWord } from './lib/gameUtils';
import JoinGame from './components/JoinGame';
import WaitingRoom from './components/WaitingRoom';
import GamePlay from './components/GamePlay';

type GameState = 'join' | 'waiting' | 'playing';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    document.body.style.backgroundColor = isDarkMode ? '#1a1a1a' : '#ffffff';
  }, [isDarkMode]);

  const [gameState, setGameState] = useState<GameState>('join');
  const [gameId, setGameId] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState<string>('');
  const [playerCount, setPlayerCount] = useState<number>(0);
  const [currentWord, setCurrentWord] = useState<string>('');
  const [words, setWords] = useState<string[]>([]);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [waitingForOther, setWaitingForOther] = useState<boolean>(false);
  const [matchResult, setMatchResult] = useState<{ matched: boolean; player1Word: string; player2Word: string } | null>(null);

  useEffect(() => {
    loadWords().then(setWords);
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const gameParam = urlParams.get('game');
    if (gameParam) {
      setGameId(gameParam);
    }
  }, []);

  useEffect(() => {
    if (!gameId) return;

    // Polling fallback for checking game status
    const pollGameStatus = async () => {
      const { data: game } = await supabase
        .from('games')
        .select('*')
        .eq('id', gameId)
        .single();

      if (game) {
        setCurrentWord(game.current_word);

        const { data: players } = await supabase
          .from('players')
          .select('*')
          .eq('game_id', gameId);

        if (players) {
          console.log('Poll: players count', players.length, 'game status', game.status);
          setPlayerCount(players.length);

          if (game.status === 'playing' && gameState !== 'playing') {
            console.log('Poll: Game is playing, transitioning');
            setGameState('playing');
          }
        }
      }
    };

    // Poll submissions when waiting for other player
    const pollSubmissions = async () => {
      console.log('Poll: checking submissions');
      await checkSubmissions();
    };

    // Poll for current word changes to keep players synced
    const pollCurrentWord = async () => {
      const { data: game } = await supabase
        .from('games')
        .select('current_word')
        .eq('id', gameId)
        .single();

      if (game && game.current_word !== currentWord) {
        console.log('Poll: word changed from', currentWord, 'to', game.current_word);
        setCurrentWord(game.current_word);
        setMatchResult(null);
        setHasSubmitted(false);
        setWaitingForOther(false);
      }
    };

    // Poll every 1 second when waiting or when playing
    let pollInterval: NodeJS.Timeout | null = null;
    if (gameState === 'waiting') {
      pollInterval = setInterval(pollGameStatus, 1000);
    } else if (gameState === 'playing' && (hasSubmitted || waitingForOther)) {
      pollInterval = setInterval(pollSubmissions, 1000);
    } else if (gameState === 'playing') {
      pollInterval = setInterval(pollCurrentWord, 1000);
    }

    const playersChannel = supabase
      .channel(`game:${gameId}:players`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'players',
          filter: `game_id=eq.${gameId}`,
        },
        async (payload) => {
          console.log('Players channel event', payload);
          const { data: players } = await supabase
            .from('players')
            .select('*')
            .eq('game_id', gameId);

          if (players) {
            console.log('Players fetched', players);
            setPlayerCount(players.length);
            if (players.length === 2) {
              console.log('Both players joined, checking game status');
              const { data: game } = await supabase
                .from('games')
                .select('*')
                .eq('id', gameId)
                .single();

              if (game && game.status === 'waiting') {
                console.log('Game still waiting, updating to playing');
                const firstWord = words.length > 0 ? getRandomWord(words) : 'loading';
                await supabase
                  .from('games')
                  .update({ current_word: firstWord, status: 'playing', used_words: [firstWord] })
                  .eq('id', gameId);
                setCurrentWord(firstWord);
                setGameState('playing');
              } else if (game && game.status === 'playing') {
                console.log('Game already playing, transitioning');
                setCurrentWord(game.current_word);
                setGameState('playing');
              }
            }
          }
        }
      )
      .subscribe();

    const gameChannel = supabase
      .channel(`game:${gameId}:state`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'games',
          filter: `id=eq.${gameId}`,
        },
        async (payload) => {
          console.log('Game channel event', payload);
          const game = payload.new as Game;
          setCurrentWord(game.current_word);
          if (game.status === 'playing') {
            console.log('Game status changed to playing');
            setGameState('playing');
          }
        }
      )
      .subscribe();

    const submissionsChannel = supabase
      .channel(`game:${gameId}:submissions`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'submissions',
          filter: `game_id=eq.${gameId}`,
        },
        async () => {
          console.log('Submissions channel event');
          await checkSubmissions();
        }
      )
      .subscribe();

    return () => {
      if (pollInterval) clearInterval(pollInterval);
      playersChannel.unsubscribe();
      gameChannel.unsubscribe();
      submissionsChannel.unsubscribe();
    };
  }, [gameId, words, gameState, hasSubmitted, waitingForOther, currentWord]);


  const checkSubmissions = async () => {
    if (!gameId || !currentWord) return;

    const { data: submissions } = await supabase
      .from('submissions')
      .select('*')
      .eq('game_id', gameId)
      .eq('word', currentWord)
      .order('created_at', { ascending: true });

    if (submissions && submissions.length === 2) {
      const player1Word = submissions[0].submission_word.toLowerCase();
      const player2Word = submissions[1].submission_word.toLowerCase();
      const matched = player1Word === player2Word;

      setMatchResult({
        matched,
        player1Word: submissions[0].submission_word,
        player2Word: submissions[1].submission_word,
      });

      setHasSubmitted(false);
      setWaitingForOther(false);

      // Only player 1 should update the word to avoid race conditions
      if (submissions[0].player_id === playerId) {
        setTimeout(async () => {
          // Fetch game's used_words to avoid repeats
          const { data: gameRecord } = await supabase
            .from('games')
            .select('used_words')
            .eq('id', gameId)
            .single();

          const used: string[] = (gameRecord && (gameRecord as any).used_words) || [];
          let unused = words.filter(w => !used.includes(w));

          // If all words used, reset
          let newUsed: string[] = [];
          if (unused.length === 0) {
            unused = [...words];
            newUsed = [];
          }

          const nextWord = getRandomWord(unused, currentWord);
          newUsed = [...newUsed, nextWord];

          console.log('Player 1 generating next word:', nextWord, 'used before:', used);
          await supabase
            .from('games')
            .update({ current_word: nextWord, updated_at: new Date().toISOString(), used_words: [...used, nextWord] })
            .eq('id', gameId);
          setCurrentWord(nextWord);
          setMatchResult(null);
        }, 3000);
      } else {
        // Player 2 just waits for the word update
        setTimeout(() => {
          console.log('Player 2 clearing match result, waiting for new word');
          setMatchResult(null);
        }, 3000);
      }
    } else if (submissions && submissions.length === 1) {
      const mySubmission = submissions.find(s => s.player_id === playerId);
      if (mySubmission) {
        setWaitingForOther(true);
      }
    }
  };

  const handleJoin = async (name: string) => {
    console.log('handleJoin', name);
    setPlayerName(name);

    if (gameId) {
      console.log('Checking existing game', gameId);
      const { data: existingGame } = await supabase
        .from('games')
        .select('*')
        .eq('id', gameId)
        .maybeSingle();

      if (existingGame) {
        console.log('Found game', existingGame);
        const { data: existingPlayers } = await supabase
          .from('players')
          .select('*')
          .eq('game_id', gameId);

        console.log('Existing players', existingPlayers);

        if (existingPlayers && existingPlayers.length >= 2) {
          console.log('Game full');
          alert('This game is full!');
          setGameId(null);
          return;
        }

        const playerNumber = existingPlayers && existingPlayers.length === 1 ? 2 : 1;
        console.log('Inserting player', playerNumber);
        const { data: newPlayer } = await supabase
          .from('players')
          .insert({ game_id: gameId, player_name: name, player_number: playerNumber })
          .select()
          .single();

        if (newPlayer) {
          console.log('Player inserted', newPlayer);
          setPlayerId(newPlayer.id);
          const newPlayerCount = existingPlayers ? existingPlayers.length + 1 : 1;
          setPlayerCount(newPlayerCount);

          if (existingGame.status === 'playing') {
            console.log('Game is playing, joining');
            setGameState('playing');
            setCurrentWord(existingGame.current_word);
          } else if (newPlayerCount === 2) {
            console.log('Second player joined, starting game');
            const firstWord = words.length > 0 ? getRandomWord(words) : existingGame.current_word;
            await supabase
              .from('games')
              .update({ current_word: firstWord, status: 'playing', used_words: [firstWord] })
              .eq('id', gameId);
            setCurrentWord(firstWord);
            setGameState('playing');
          } else {
            console.log('Waiting for other player');
            setGameState('waiting');
          }
        }
      } else {
        console.log('Game not found');
        alert('Game not found!');
        setGameId(null);
      }
    } else {
      console.log('Creating new game');
      const firstWord = words.length > 0 ? getRandomWord(words) : 'loading';
      const { data: newGame } = await supabase
        .from('games')
        .insert({ current_word: firstWord, status: 'waiting', used_words: [firstWord] })
        .select()
        .single();

      if (newGame) {
        console.log('Game created', newGame);
        setGameId(newGame.id);
        setCurrentWord(newGame.current_word);

        const { data: newPlayer } = await supabase
          .from('players')
          .insert({ game_id: newGame.id, player_name: name, player_number: 1 })
          .select()
          .single();

        if (newPlayer) {
          console.log('Player 1 inserted', newPlayer);
          setPlayerId(newPlayer.id);
          setPlayerCount(1);
          setGameState('waiting');

          window.history.pushState({}, '', `?game=${newGame.id}`);
        }
      }
    }
  };

  const handleSubmit = async (word: string) => {
    if (!gameId || !playerId || !currentWord) return;

    const { data: existingSubmission } = await supabase
      .from('submissions')
      .select('*')
      .eq('game_id', gameId)
      .eq('player_id', playerId)
      .eq('word', currentWord)
      .maybeSingle();

    if (existingSubmission) return;

    await supabase
      .from('submissions')
      .insert({
        game_id: gameId,
        player_id: playerId,
        word: currentWord,
        submission_word: word,
      });

    setHasSubmitted(true);

    // Check submissions immediately after submitting
    setTimeout(() => checkSubmissions(), 500);
  };

  // Logging goes to the browser console by default.

  return (
    <div
      className="min-h-screen transition-colors duration-300"
      style={{ backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff' }}
    >
      {/* Debug overlay removed — logs now appear in the browser console */}
      {gameState === 'join' && <JoinGame onJoin={handleJoin} isDarkMode={isDarkMode} />}
      {gameState === 'waiting' && (
        <WaitingRoom
          gameId={gameId!}
          playerName={playerName}
          playerCount={playerCount}
          isDarkMode={isDarkMode}
        />
      )}
      {gameState === 'playing' && (
        <GamePlay
          currentWord={currentWord}
          playerName={playerName}
          onSubmit={handleSubmit}
          hasSubmitted={hasSubmitted}
          waitingForOther={waitingForOther}
          matchResult={matchResult}
          isDarkMode={isDarkMode}
        />
      )}
      {/* Dark mode toggle */}
      <button
        onClick={() => setIsDarkMode(!isDarkMode)}
        aria-label="Toggle dark mode"
        className="fixed bottom-4 left-4 z-50 p-3 rounded-full shadow-lg hover:scale-110 transition-all duration-200"
        style={{
          backgroundColor: isDarkMode ? '#2d3748' : '#ffffff',
          borderColor: isDarkMode ? '#4a5568' : '#d1d5db',
          border: '2px solid',
        }}
      >
        {isDarkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-700" />}
      </button>
    </div>
  );
}

export default App;
