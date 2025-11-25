import { Users } from 'lucide-react';

interface WaitingRoomProps {
    gameId: string;
    playerName: string;
    playerCount: number;
    isDarkMode: boolean;
}

export default function WaitingRoom({ gameId, playerName, playerCount, isDarkMode }: WaitingRoomProps) {
    const shareUrl = `${window.location.origin}?game=${gameId}`;

    return (
        <div className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-blue-50 to-indigo-50'} flex items-center justify-center p-4`}>
            <div className={`rounded-2xl shadow-xl p-8 max-w-md w-full ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="flex items-center justify-center mb-6">
                    <div className="bg-blue-100 p-4 rounded-full">
                        <Users className="w-12 h-12 text-blue-600" />
                    </div>
                </div>

                <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'} text-center mb-2`}>
                    Waiting for Player 2
                </h1>

                <p className={`text-gray-600 ${isDarkMode ? 'text-gray-100' : 'text-gray-600'} text-center mb-6`}>
                    Hi {playerName}! Share this link with a friend to start playing:
                </p>

                <div className={`bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} break-all font-mono`}>{shareUrl}</p>
                </div>

                <button
                    onClick={() => navigator.clipboard.writeText(shareUrl)}
                    className={`w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors ${isDarkMode ? 'bg-blue-700' : 'bg-blue-600'}`}
                >
                    Copy Link
                </button>

                <div className={`mt-6 text-center ${isDarkMode ? 'text-gray-200' : 'text-gray-500'}`}>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-500'}`}>
                        Players: {playerCount} / 2
                    </p>
                </div>
            </div>
        </div>
    );
}