
import React, { useState, useEffect, useRef } from 'react';
import { useClickOutside } from '../hooks/useClickOutside';
import { CloseIcon, BookmarkIcon, GlobeIcon } from './icons';
import LanguageSelector from './LanguageSelector';

interface TranslationPopoverProps {
    text: string;
    translation: string;
    isLoading: boolean;
    position: { top: number; left: number };
    onClose: () => void;
    onSave: (text: string, translation: string) => void;
    isSaved: boolean;
    translationLanguage: string;
    onTranslationLanguageChange: (lang: string) => void;
}

const TranslationPopover: React.FC<TranslationPopoverProps> = ({
    text,
    translation,
    isLoading,
    position,
    onClose,
    onSave,
    isSaved,
    translationLanguage,
    onTranslationLanguageChange
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
        setTimeout(() => setJustSaved(false), 2000); 
    };
    
    const saved = isSaved || justSaved;

    return (
        <div
            ref={popoverRef}
            style={popoverStyle}
            className="w-80 max-w-sm bg-white rounded-xl shadow-2xl border border-stone-200 overflow-hidden"
            role="dialog"
            aria-modal="true"
        >
            {/* Popover Header */}
            <div className="bg-stone-50 px-4 py-2 border-b border-stone-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5 min-w-0">
                    <GlobeIcon className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <LanguageSelector 
                        selectedLanguage={translationLanguage} 
                        onLanguageChange={onTranslationLanguageChange} 
                        minimal
                    />
                </div>
                <div className="flex items-center gap-1">
                    <button 
                        onClick={handleSave} 
                        disabled={saved || isLoading || !translation}
                        className={`p-1.5 rounded-lg transition-all ${saved ? 'text-emerald-700 bg-emerald-50' : 'text-stone-400 hover:text-stone-600 hover:bg-stone-100' } disabled:opacity-50`}
                        title={saved ? 'Saved' : 'Save to word bank'}
                    >
                        <BookmarkIcon className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
                    </button>
                    <button 
                        onClick={onClose} 
                        className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-all"
                    >
                        <CloseIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Popover Body */}
            <div className="p-4">
                <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Original</p>
                <p className="text-sm font-medium text-stone-700 mb-4 bg-stone-50 p-2 rounded-lg border border-stone-100">
                    {text}
                </p>
                
                <p className="text-xs font-bold text-emerald-700 uppercase tracking-widest mb-2">Translation</p>
                <div className="min-h-[3rem] flex flex-col justify-center">
                    {isLoading ? (
                        <div className="flex items-center gap-2">
                            <div className="flex gap-1">
                                <div className="w-1.5 h-1.5 bg-emerald-700 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                                <div className="w-1.5 h-1.5 bg-emerald-700 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                <div className="w-1.5 h-1.5 bg-emerald-700 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                            <span className="text-xs font-medium text-stone-400 italic">Thinking...</span>
                        </div>
                    ) : (
                        <p className="text-stone-900 font-bold text-lg leading-tight">
                            {translation || "No result"}
                        </p>
                    )}
                </div>
            </div>

            {/* Saved indicator */}
            {justSaved && (
                <div className="bg-emerald-600 text-white text-[10px] font-bold text-center py-1 uppercase tracking-tighter">
                    Added to Word Bank
                </div>
            )}
        </div>
    );
};

export default TranslationPopover;
