
import React, { useState } from 'react';
import { SavedWord } from '../types.ts';
import { exportWordsToCsv } from '../utils/exportUtils.ts';
import { TrashIcon, SearchIcon, DownloadIcon } from './icons.tsx';

interface WordBankSectionProps {
    words: SavedWord[];
    onRemove: (text: string) => void;
}

const WordBankSection: React.FC<WordBankSectionProps> = ({ words, onRemove }) => {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredWords = words.filter(word => 
        word.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        word.translation.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleExport = () => {
        exportWordsToCsv(words);
    };

    return (
        <div className="max-w-4xl mx-auto w-full bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
            <div className="p-6 border-b border-stone-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                     <div className="flex-grow">
                        <h2 className="text-xl font-bold text-stone-800">My Vocabulary Bank</h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                            <input 
                                type="text" 
                                placeholder="Search words..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none w-full md:w-52"
                            />
                        </div>
                        <button 
                            onClick={handleExport}
                            disabled={words.length === 0}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-700 text-white text-xs font-bold rounded-lg hover:bg-emerald-800 transition-colors shadow-sm shadow-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <DownloadIcon className="w-4 h-4" />
                            <span>Export to CSV</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="divide-y divide-stone-100 max-h-[600px] overflow-y-auto">
                {filteredWords.length === 0 ? (
                    <div className="p-12 text-center text-stone-500">
                        {searchQuery ? 'No matches found for your search.' : 'Your word bank is empty. Save words from the reader to see them here!'}
                    </div>
                ) : (
                    filteredWords.map((word) => (
                        <div key={word.timestamp} className="p-4 flex items-center justify-between hover:bg-stone-50 transition-colors group">
                            <div className="flex-grow">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-bold text-stone-800">{word.text}</span>
                                    <span className="text-xs font-medium text-stone-400 uppercase bg-stone-100 px-1.5 py-0.5 rounded">{word.sourceLang}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-emerald-700 font-medium">{word.translation}</span>
                                    <span className="text-xs font-medium text-emerald-600 uppercase bg-emerald-50 px-1.5 py-0.5 rounded">{word.targetLang}</span>
                                </div>
                            </div>
                            <button 
                                onClick={() => onRemove(word.text)}
                                className="p-2 text-stone-300 hover:text-red-700 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                            >
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        </div>
                    ))
                )}
            </div>
            
            <div className="p-4 bg-stone-50 border-t border-stone-100">
                <p className="text-xs text-stone-400 text-center">{filteredWords.length} words saved</p>
            </div>
        </div>
    );
};

export default WordBankSection;
