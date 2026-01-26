
import React, { useMemo } from 'react';

interface DocumentViewerProps {
    content: string;
    scrollRef: React.RefObject<HTMLDivElement>;
    onScroll: () => void;
    selectionRange: { start: number; end: number } | null;
    onWordPointerDown: (index: number) => void;
    onWordPointerEnter: (index: number) => void;
    onSelectionEnd: () => void;
}

const DocumentViewer: React.FC<DocumentViewerProps> = React.memo(({ 
    content, 
    scrollRef, 
    onScroll, 
    selectionRange,
    onWordPointerDown,
    onWordPointerEnter,
    onSelectionEnd
}) => {
    // Split content into words and whitespace to preserve formatting while allowing word-level interaction
    const tokens = useMemo(() => content.split(/(\s+)/), [content]);

    const isTokenSelected = (index: number) => {
        if (!selectionRange) return false;
        const min = Math.min(selectionRange.start, selectionRange.end);
        const max = Math.max(selectionRange.start, selectionRange.end);
        return index >= min && index <= max;
    };

    return (
        <div
            ref={scrollRef}
            onScroll={onScroll}
            onPointerUp={onSelectionEnd}
            className="bg-white p-6 sm:p-8 md:p-12 rounded-lg shadow-md h-[calc(100vh-200px)] overflow-y-auto select-none touch-none"
        >
             <article className="prose prose-slate max-w-none lg:prose-lg leading-relaxed">
                {tokens.map((token, index) => {
                    const isWhitespace = /^\s+$/.test(token);
                    if (isWhitespace) {
                        return <span key={index}>{token}</span>;
                    }
                    
                    const selected = isTokenSelected(index);
                    
                    return (
                        <span
                            key={index}
                            onPointerDown={(e) => {
                                // Only trigger for primary button
                                if (e.button === 0) {
                                    onWordPointerDown(index);
                                }
                            }}
                            onPointerEnter={() => onWordPointerEnter(index)}
                            className={`cursor-pointer transition-colors duration-150 rounded px-0.5 -mx-0.5 ${
                                selected 
                                    ? 'bg-blue-500 text-white shadow-sm' 
                                    : 'hover:bg-blue-50 text-slate-800'
                            }`}
                        >
                            {token}
                        </span>
                    );
                })}
            </article>
        </div>
    );
});

export default DocumentViewer;
