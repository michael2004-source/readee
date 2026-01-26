
import React, { useState, useMemo } from 'react';
import { SavedWord } from '../types';
import { BrainIcon } from './icons';

interface VocabTrainerSectionProps {
    words: SavedWord[];
}

const VocabTrainerSection: React.FC<VocabTrainerSectionProps> = ({ words }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [masteredCount, setMasteredCount] = useState(0);

    const shuffledWords = useMemo(() => [...words].sort(() => Math.random() - 0.5), [words]);
    const currentWord = shuffledWords[currentIndex];

    if (words.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-xl shadow-sm border border-stone-200">
                <BrainIcon className="w-16 h-16 text-stone-300 mb-4" />
                <h2 className="text-xl font-bold text-stone-700">No words to practice yet</h2>
                <p className="text-stone-500 mt-2">Save words from the reader to start training!</p>
            </div>
        );
    }

    if (currentIndex >= shuffledWords.length) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-xl shadow-sm border border-stone-200">
                <h2 className="text-2xl font-bold text-emerald-700 mb-2">Session Complete!</h2>
                <p className="text-stone-600 mb-6">You reviewed {shuffledWords.length} words and mastered {masteredCount} of them.</p>
                <button 
                    onClick={() => { setCurrentIndex(0); setMasteredCount(0); setIsFlipped(false); }}
                    className="px-6 py-3 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 font-semibold transition-colors shadow-md"
                >
                    Practice Again
                </button>
            </div>
        );
    }

    const handleNext = (mastered: boolean) => {
        if (mastered) setMasteredCount(c => c + 1);
        setIsFlipped(false);
        setTimeout(() => setCurrentIndex(i => i + 1), 150);
    };

    return (
        <div className="max-w-md mx-auto w-full">
            <div className="mb-6 flex justify-between items-center px-2">
                <span className="text-sm font-medium text-stone-500">Card {currentIndex + 1} of {shuffledWords.length}</span>
                <span className="text-sm font-medium text-emerald-700 font-bold">Mastered: {masteredCount}</span>
            </div>

            <div 
                onClick={() => setIsFlipped(!isFlipped)}
                className={`relative w-full aspect-[4/3] cursor-pointer perspective-1000 group`}
            >
                <div className={`relative w-full h-full transition-transform duration-500 preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                    {/* Front */}
                    <div className="absolute inset-0 bg-white border-2 border-stone-200 rounded-2xl shadow-lg flex flex-col items-center justify-center p-8 backface-hidden">
                        <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest mb-4">{currentWord.sourceLang}</span>
                        <h3 className="text-3xl font-bold text-stone-800 text-center">{currentWord.text}</h3>
                        <p className="absolute bottom-6 text-stone-400 text-sm animate-pulse">Tap to flip</p>
                    </div>

                    {/* Back */}
                    <div className="absolute inset-0 bg-amber-50 border-2 border-amber-200 rounded-2xl shadow-lg flex flex-col items-center justify-center p-8 backface-hidden rotate-y-180">
                        <span className="text-xs font-bold text-amber-700 uppercase tracking-widest mb-4">{currentWord.targetLang}</span>
                        <h3 className="text-3xl font-bold text-amber-900 text-center">{currentWord.translation}</h3>
                    </div>
                </div>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-4">
                <button 
                    onClick={() => handleNext(false)}
                    className="py-4 px-6 bg-stone-100 text-stone-700 rounded-xl hover:bg-stone-200 font-semibold transition-colors flex flex-col items-center"
                >
                    <span>Still learning</span>
                    <span className="text-xs font-normal opacity-70">Show again later</span>
                </button>
                <button 
                    onClick={() => handleNext(true)}
                    className="py-4 px-6 bg-emerald-700 text-white rounded-xl hover:bg-emerald-800 font-semibold transition-colors flex flex-col items-center shadow-md shadow-emerald-100"
                >
                    <span>Got it!</span>
                    <span className="text-xs font-normal opacity-80">Mark as mastered</span>
                </button>
            </div>

            <style>{`
                .perspective-1000 { perspective: 1000px; }
                .preserve-3d { transform-style: preserve-3d; }
                .backface-hidden { backface-visibility: hidden; }
                .rotate-y-180 { transform: rotateY(180deg); }
            `}</style>
        </div>
    );
};

export default VocabTrainerSection;
