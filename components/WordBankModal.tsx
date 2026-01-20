
import React from 'react';
import { useClickOutside } from '../hooks/useClickOutside';
import { SavedWord } from '../types';
import { CloseIcon, TrashIcon } from './icons';

interface WordBankModalProps {
    words: SavedWord[];
    onClose: () => void;
    onRemove: (text: string) => void;
}

const WordBankModal: React.FC<WordBankModalProps> = ({ words, onClose, onRemove }) => {
    const modalRef = React.useRef<HTMLDivElement>(null);
    useClickOutside(modalRef, onClose);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div ref={modalRef} className="bg-white rounded-lg shadow-xl w-full max-w-2xl h-[80vh] flex flex-col">
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-800">My Word Bank</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100">
                        <CloseIcon className="w-6 h-6 text-slate-500" />
                    </button>
                </div>
                
                <div className="flex-grow overflow-y-auto">
                    {words.length === 0 ? (
                        <div className="text-center p-10">
                            <p className="text-slate-500">Your word bank is empty.</p>
                            <p className="text-sm text-slate-400 mt-2">Select text in your document to translate and save words.</p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-slate-200">
                            {words.map((word, index) => (
                                <li key={index} className="p-4 flex justify-between items-start hover:bg-slate-50">
                                    <div>
                                        <p className="font-semibold text-slate-800">{word.text}</p>
                                        <p className="text-blue-600">{word.translation}</p>
                                        <p className="text-xs text-slate-400 mt-1">
                                            {word.sourceLang.toUpperCase()} &rarr; {word.targetLang.toUpperCase()}
                                        </p>
                                    </div>
                                    <button 
                                        onClick={() => onRemove(word.text)}
                                        className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-full"
                                        aria-label={`Remove "${word.text}"`}
                                    >
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WordBankModal;
