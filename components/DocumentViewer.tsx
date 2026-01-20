
import React from 'react';

interface DocumentViewerProps {
    content: string;
    scrollRef: React.RefObject<HTMLDivElement>;
    onScroll: () => void;
}

const DocumentViewer: React.FC<DocumentViewerProps> = React.memo(({ content, scrollRef, onScroll }) => {
    return (
        <div
            ref={scrollRef}
            onScroll={onScroll}
            className="bg-white p-6 sm:p-8 md:p-12 rounded-lg shadow-md h-[calc(100vh-200px)] overflow-y-auto"
        >
             <article className="prose prose-slate max-w-none lg:prose-lg select-text" style={{ whiteSpace: 'pre-wrap' }}>
                {content}
            </article>
        </div>
    );
});

export default DocumentViewer;
