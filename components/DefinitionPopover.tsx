
import React, { useRef, useEffect } from 'react';
import { useClickOutside } from '../hooks/useClickOutside';
import { CloseIcon } from './icons';

interface DefinitionPopoverProps {
    word: string;
    definition: string | null;
    isLoading: boolean;
    position: { top: number; left: number };
    onClose: () => void;
}

const DefinitionPopover: React.FC<DefinitionPopoverProps> = ({
    word,
    definition,
    isLoading,
    position,
    onClose,
}) => {
    const popoverRef = useRef<HTMLDivElement>(null);
    useClickOutside(popoverRef, onClose);

    const popoverStyle: React.CSSProperties = {
        position: 'fixed',
        top: `${position.top + 10}px`, // Offset to avoid cursor overlap
        left: `${position.left + 10}px`,
        transform: 'translateX(0)',
        zIndex: 50,
    };
    
    // Adjust position if it's too close to the edge of the viewport
    useEffect(() => {
        if(popoverRef.current) {
            const rect = popoverRef.current.getBoundingClientRect();
            if(rect.right > window.innerWidth - 20) {
                 popoverRef.current.style.transform = `translateX(calc(-100% - 20px))`;
            }
             if(rect.bottom > window.innerHeight - 20) {
                 popoverRef.current.style.transform = `translateY(calc(-100% - 20px))`;
            }
            if(rect.left < 20) {
                 popoverRef.current.style.transform = `translateX(0)`;
            }
        }
    }, [definition, isLoading])


    return (
        <div
            ref={popoverRef}
            style={popoverStyle}
            className="w-80 max-w-sm bg-white rounded-lg shadow-2xl border border-slate-200"
            role="dialog"
            aria-modal="true"
        >
            <div className="p-4">
                <div className="flex justify-between items-center mb-2 pb-2 border-b border-slate-200">
                    <h3 className="text-lg font-semibold text-slate-800 capitalize">{word}</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400">
                        <CloseIcon className="w-5 h-5 text-slate-500" />
                        <span className="sr-only">Close definition</span>
                    </button>
                </div>
                <div>
                    {isLoading ? (
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-slate-500 rounded-full animate-pulse" style={{ animationDelay: '0s' }}></div>
                            <div className="w-2 h-2 bg-slate-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                            <div className="w-2 h-2 bg-slate-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                            <span className="text-slate-500">Loading...</span>
                        </div>
                    ) : (
                        <p className="text-slate-600">{definition}</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DefinitionPopover;
