import { useState } from 'react';
import { Gamepad2 } from 'lucide-react';

interface JoinGameProps {
  onJoin: (name: string) => void;
  isDarkMode: boolean;
}

export default function JoinGame({ onJoin, isDarkMode }: JoinGameProps) {
  const [playerName, setPlayerName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim()) {
      onJoin(playerName.trim());
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${isDarkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-blue-50 to-indigo-50'}`}>
      <div className={`rounded-2xl shadow-xl p-8 max-w-md w-full ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="flex items-center justify-center mb-6">
          <div className="bg-blue-100 p-4 rounded-full">
            <Gamepad2 className="w-12 h-12 text-blue-600" />
          </div>
        </div>

        <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'} text-center mb-2`}>
          Word Association Game
        </h1>

        <p className={`text-gray-600 ${isDarkMode ? 'text-gray-100' : 'text-gray-600'} text-center mb-8`}>
          Match words with your friend!
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} mb-2`}>
              Enter your name
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:border-blue-500 ${isDarkMode ? 'border-gray-600 bg-gray-700 text-gray-200' : 'border-gray-300 bg-white text-gray-900'}`}
              placeholder="Your name..."
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={!playerName.trim()}
            className={`w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors ${isDarkMode ? 'bg-blue-700' : 'bg-blue-600'} ${isDarkMode ? 'disabled:bg-gray-700' : 'disabled:bg-gray-300'} disabled:cursor-not-allowed`}
          >
            Start Playing
          </button>
        </form>
      </div>
    </div>
  );
}