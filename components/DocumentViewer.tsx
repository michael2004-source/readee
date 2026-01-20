
import React, { useMemo } from 'react';

interface DocumentViewerProps {
    content: string;
    onWordSelect: (word: string, event: React.MouseEvent<HTMLSpanElement>) => void;
}

const DocumentViewer: React.FC<DocumentViewerProps> = React.memo(({ content, onWordSelect }) => {
    const processedContent = useMemo(() => {
        // Split by whitespace while keeping the delimiter, which preserves spacing and newlines.
        return content.split(/(\s+)/).map((segment, index) => {
            if (segment.trim() === '') {
                // This is a whitespace segment
                return <React.Fragment key={index}>{segment}</React.Fragment>;
            }
            // This is a word segment
            return (
                <span
                    key={index}
                    onClick={(e) => onWordSelect(segment, e)}
                    className="cursor-pointer transition-colors hover:bg-yellow-200"
                >
                    {segment}
                </span>
            );
        });
    }, [content, onWordSelect]);

    return (
        <div className="bg-white p-6 sm:p-8 md:p-12 rounded-lg shadow-md">
             <article className="prose prose-slate max-w-none lg:prose-lg" style={{ whiteSpace: 'pre-wrap' }}>
                {processedContent}
            </article>
        </div>
    );
});

export default DocumentViewer;
