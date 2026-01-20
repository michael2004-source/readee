
import React, { useState, useEffect, useRef } from 'react';
import { useClickOutside } from '../hooks/useClickOutside';
import { CloseIcon, BookmarkIcon } from './icons';

interface TranslationPopoverProps {
    text: string;
    translation: string;
    isLoading: boolean;
    position: { top: number; left: number };
    onClose: () => void;
    onSave: (text: string, translation: string) => void;
    isSaved: boolean;
}

const TranslationPopover: React.FC<TranslationPopoverProps> = ({
    text,
    translation,
    isLoading,
    position,
    onClose,
    onSave,
    isSaved,
}) => {
    const popoverRef = useRef<HTMLDivElement>(null);
    useClickOutside(popoverRef, onClose);
    const [justSaved, setJustSaved] = useState(false);

    const popoverStyle: React.CSSProperties = {
        position: 'fixed',
        top: `${position.top + 10}px`,
        left: `${position.left}px`,
        transform: 'translateX(0)',
        zIndex: 50,
    };
    
    useEffect(() => {
        if (popoverRef.current) {
            const rect = popoverRef.current.getBoundingClientRect();
            if (rect.right > window.innerWidth - 20) {
                popoverRef.current.style.left = 'auto';
                popoverRef.current.style.right = '20px';
                popoverRef.current.style.transform = 'translateX(0)';
            }
            if (rect.bottom > window.innerHeight - 20) {
                 popoverRef.current.style.top = `${position.top - rect.height - 20}px`;
            }
            if (rect.left < 20) {
                 popoverRef.current.style.left = '20px';
            }
        }
    }, [translation, isLoading, position]);

    const handleSave = () => {
        onSave(text, translation);
        setJustSaved(true);
        setTimeout(() => setJustSaved(false), 2000); // Reset after 2 seconds
    };
    
    const saved = isSaved || justSaved;

    return (
        <div
            ref={popoverRef}
            style={popoverStyle}
            className="w-80 max-w-sm bg-white rounded-lg shadow-2xl border border-slate-200"
            role="dialog"
            aria-modal="true"
        >
            <div className="p-4">
                <div className="flex justify-between items-start mb-3">
                     <p className="text-sm font-medium text-slate-500 italic truncate pr-2">"{text}"</p>
                    <div className="flex items-center space-x-1">
                        <button 
                            onClick={handleSave} 
                            disabled={saved}
                            className={`p-1 rounded-full ${saved ? 'text-blue-600' : 'text-slate-500 hover:bg-slate-100' } disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-400`}
                            aria-label={saved ? 'Saved' : 'Save to word bank'}
                        >
                            <BookmarkIcon className={`w-5 h-5 ${saved ? 'fill-current' : ''}`} />
                        </button>
                        <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400">
                            <CloseIcon className="w-5 h-5 text-slate-500" />
                            <span className="sr-only">Close translation</span>
                        </button>
                    </div>
                </div>
                <div className="border-t border-slate-200 pt-3">
                    {isLoading ? (
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-slate-500 rounded-full animate-pulse" style={{ animationDelay: '0s' }}></div>
                            <div className="w-2 h-2 bg-slate-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                            <div className="w-2 h-2 bg-slate-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                            <span className="text-slate-500">Translating...</span>
                        </div>
                    ) : (
                        <p className="text-slate-700 font-semibold text-lg">{translation}</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TranslationPopover;
