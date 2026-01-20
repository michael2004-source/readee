
import React, { useState, useEffect, useCallback } from 'react';
import { PopoverState } from './types';
import { parseFile } from './utils/fileUtils';
import { getDefinition } from './services/geminiService';
import FileUpload from './components/FileUpload';
import DocumentViewer from './components/DocumentViewer';
import DefinitionPopover from './components/DefinitionPopover';

const App: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [content, setContent] = useState<string>('');
    const [isParsing, setIsParsing] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [popover, setPopover] = useState<PopoverState>({
        word: null,
        definition: null,
        isLoading: false,
        position: null,
    });

    useEffect(() => {
        const processFile = async () => {
            if (!file) return;

            setIsParsing(true);
            setError(null);
            setContent('');
            setPopover({ word: null, definition: null, isLoading: false, position: null });

            try {
                const textContent = await parseFile(file);
                setContent(textContent);
            } catch (err) {
                setError(err instanceof Error ? `Failed to parse file: ${err.message}` : 'An unknown error occurred during parsing.');
                console.error(err);
            } finally {
                setIsParsing(false);
            }
        };

        processFile();
    }, [file]);
    
    useEffect(() => {
        const fetchDefinition = async () => {
            if (popover.word && popover.isLoading) {
                try {
                    const definitionText = await getDefinition(popover.word);
                    setPopover(p => p.word ? { ...p, definition: definitionText, isLoading: false } : p);
                } catch (err) {
                     const errorMessage = err instanceof Error ? `Failed to fetch definition: ${err.message}` : 'An unknown error occurred.';
                    setPopover(p => p.word ? { ...p, definition: errorMessage, isLoading: false } : p);
                    console.error(err);
                }
            }
        };

        fetchDefinition();
    }, [popover.word, popover.isLoading]);

    const handleFileChange = (selectedFile: File | null) => {
        if (selectedFile) {
            setFile(selectedFile);
        }
    };
    
    const handleReset = () => {
        setFile(null);
        setContent('');
        setError(null);
        setPopover({ word: null, definition: null, isLoading: false, position: null });
    };

    const handleWordSelect = useCallback((word: string, event: React.MouseEvent<HTMLSpanElement>) => {
        // Sanitize word
        const cleanedWord = word.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").trim().toLowerCase();
        if (!cleanedWord || cleanedWord.length < 2) return;

        setPopover({
            word: cleanedWord,
            definition: null,
            isLoading: true,
            position: { top: event.clientY, left: event.clientX },
        });
    }, []);

    const handleClosePopover = useCallback(() => {
        setPopover({ word: null, definition: null, isLoading: false, position: null });
    }, []);

    return (
        <div className="min-h-screen font-sans text-slate-800">
            <header className="bg-white shadow-sm sticky top-0 z-20">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <h1 className="text-2xl font-bold text-slate-700">Interactive Reader</h1>
                        {file && (
                            <button
                                onClick={handleReset}
                                className="px-4 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
                            >
                                Load New Document
                            </button>
                        )}
                    </div>
                </div>
            </header>

            <main className="container mx-auto p-4 sm:p-6 lg:p-8">
                {!file && <FileUpload onFileSelect={handleFileChange} />}
                
                {isParsing && (
                    <div className="text-center">
                        <p className="text-lg text-slate-600">Parsing document, please wait...</p>
                    </div>
                )}

                {error && (
                    <div className="text-center bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                        <strong className="font-bold">Error:</strong>
                        <span className="block sm:inline ml-2">{error}</span>
                    </div>
                )}
                
                {content && <DocumentViewer content={content} onWordSelect={handleWordSelect} />}

                {popover.position && popover.word && (
                    <DefinitionPopover
                        word={popover.word}
                        definition={popover.definition}
                        isLoading={popover.isLoading}
                        position={popover.position}
                        onClose={handleClosePopover}
                    />
                )}
            </main>
        </div>
    );
};

export default App;
