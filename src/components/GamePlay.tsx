import { useState } from 'react';
import { Sparkles, X, ArrowRight, RefreshCw } from 'lucide-react';

interface GamePlayProps {
    currentWord: string;
    playerName: string;
    onSubmit: (word: string) => void;
    hasSubmitted: boolean;
    waitingForOther: boolean;
    matchResult: { matched: boolean; player1Word: string; player2Word: string } | null;
    isDarkMode: boolean;
    onNextClick?: () => void;
    onOverrideClick?: () => void;
    nextButtonState?: 'idle' | 'waiting';
    overrideButtonState?: 'idle' | 'waiting';
}

export default function GamePlay({
    currentWord,
    playerName,
    onSubmit,
    hasSubmitted,
    waitingForOther,
    matchResult,
    isDarkMode,
    onNextClick,
    onOverrideClick,
    nextButtonState = 'idle',
    overrideButtonState = 'idle',
}: GamePlayProps) {
    const [inputWord, setInputWord] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputWord.trim()) {
            onSubmit(inputWord.trim());
            setInputWord('');
        }
    };

    return (
        <div className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-blue-50 to-indigo-50'} flex items-center justify-center p-4`}>
            <div className={`rounded-2xl shadow-xl p-8 max-w-2xl w-full ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="text-center mb-8">
                    <p className={`text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-600'} mb-2`}>Playing as: {playerName}</p>
                    <h1 className={`text-2xl font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'} mb-4`}>
                        Word Association Game
                    </h1>
                </div>

                {matchResult ? (
                    <div className="mb-8">
                        {matchResult.matched ? (
                            <div className={`bg-green-50 border-2 border-green-300 rounded-xl p-6 text-center ${isDarkMode ? 'bg-green-900 border-green-700' : 'bg-green-50 border-green-300'}`}>
                                <Sparkles className="w-16 h-16 text-green-600 mx-auto mb-4" />
                                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-green-200' : 'text-green-800'} mb-2`}>
                                    Perfect Match!
                                </h2>
                                <p className={`text-green-700 ${isDarkMode ? 'text-green-200' : 'text-green-700'}`}>
                                    You both said: <span className="font-bold">{matchResult.player1Word}</span>
                                </p>
                            </div>
                        ) : (
                            <div className={`bg-red-50 border-2 border-red-300 rounded-xl p-6 text-center ${isDarkMode ? 'bg-red-900 border-red-700' : 'bg-red-50 border-red-300'}`}>
                                <X className="w-16 h-16 text-red-600 mx-auto mb-4" />
                                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-red-200' : 'text-red-800'} mb-2`}>
                                    No Match
                                </h2>
                                <p className={`text-red-700 ${isDarkMode ? 'text-red-200' : 'text-red-700'} mb-2`}>Different associations:</p>
                                <div className="flex justify-center gap-4">
                                    <span className="font-semibold">{matchResult.player1Word}</span>
                                    <span className={`${isDarkMode ? 'text-red-400' : 'text-red-400'}`}>vs</span>
                                    <span className="font-semibold">{matchResult.player2Word}</span>
                                </div>
                            </div>
                        )}
                        
                        {/* Action buttons */}
                        <div className="flex justify-center gap-4 mt-6">
                            {/* Override button - only show if not a match */}
                            {!matchResult.matched && (
                                <button
                                    onClick={onOverrideClick}
                                    disabled={overrideButtonState === 'waiting' || nextButtonState === 'waiting'}
                                    className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2
                                        ${overrideButtonState === 'waiting'
                                            ? `opacity-50 cursor-not-allowed ${isDarkMode ? 'bg-yellow-800 text-yellow-300' : 'bg-yellow-100 text-yellow-700'}`
                                            : `${isDarkMode ? 'bg-yellow-600 hover:bg-yellow-700 text-white' : 'bg-yellow-500 hover:bg-yellow-600 text-white'}`
                                        }
                                        ${nextButtonState === 'waiting' ? 'opacity-50 cursor-not-allowed' : ''}
                                    `}
                                >
                                    <RefreshCw className={`w-5 h-5 ${overrideButtonState === 'waiting' ? 'animate-spin' : ''}`} />
                                    {overrideButtonState === 'waiting' ? 'Waiting...' : 'Override'}
                                </button>
                            )}
                            
                            {/* Next button */}
                            <button
                                onClick={onNextClick}
                                disabled={nextButtonState === 'waiting' || overrideButtonState === 'waiting'}
                                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2
                                    ${nextButtonState === 'waiting'
                                        ? `opacity-50 cursor-not-allowed ${isDarkMode ? 'bg-blue-800 text-blue-300' : 'bg-blue-100 text-blue-700'}`
                                        : `${isDarkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}`
                                    }
                                    ${overrideButtonState === 'waiting' ? 'opacity-50 cursor-not-allowed' : ''}
                                `}
                            >
                                <ArrowRight className={`w-5 h-5 ${nextButtonState === 'waiting' ? 'animate-pulse' : ''}`} />
                                {nextButtonState === 'waiting' ? 'Waiting...' : 'Next'}
                            </button>
                        </div>
                    </div>
                ) : null}

                <div className={`bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl p-8 mb-8 ${isDarkMode ? 'from-gray-700 to-gray-600' : 'from-blue-100 to-indigo-100'}`}>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-600'} text-center mb-2`}>Current Word:</p>
                    <h2 className={`text-5xl font-bold text-center ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                        {currentWord}
                    </h2>
                </div>

                {waitingForOther ? (
                    <div className="text-center">
                        <div className={`inline-block animate-pulse px-6 py-3 rounded-lg font-semibold ${isDarkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-700'}`}>
                            Waiting for other player...
                        </div>
                    </div>
                ) : hasSubmitted ? (
                    <div className="text-center">
                        <div className={`inline-block bg-gray-100 px-6 py-3 rounded-lg font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                            Submitted! Waiting for other player...
                        </div>
                    </div>
                ) : !matchResult ? (
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} mb-2`}>
                                What word do you associate with this?
                            </label>
                            <input
                                type="text"
                                value={inputWord}
                                onChange={(e) => setInputWord(e.target.value)}
                                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:border-blue-500 text-lg ${isDarkMode ? 'border-gray-600 bg-gray-700 text-gray-200' : 'border-gray-300 bg-white text-gray-900'}`}
                                placeholder="Type your word..."
                                autoFocus
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={!inputWord.trim()}
                            className={`w-full py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors ${isDarkMode ? 'bg-blue-700 text-white disabled:bg-gray-700' : 'bg-blue-600 text-white disabled:bg-gray-300'} disabled:cursor-not-allowed`}
                        >
                            Submit
                        </button>
                    </form>
                ) : null}
            </div>
        </div>
    );
}