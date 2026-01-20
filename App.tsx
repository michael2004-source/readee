
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PopoverState } from './types';
import { parseFile } from './utils/fileUtils';
import { getTranslation } from './services/translationService';
import * as authService from './services/authService';
import * as dataService from './services/dataService';
import FileUpload from './components/FileUpload';
import DocumentViewer from './components/DocumentViewer';
import TranslationPopover from './components/TranslationPopover';
import LanguageSelector from './components/LanguageSelector';
import AuthModal from './components/AuthModal';

const App: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [fileName, setFileName] = useState<string>('');
    const [content, setContent] = useState<string>('');
    const [isParsing, setIsParsing] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [sourceLanguage, setSourceLanguage] = useState<string>('en');
    const [targetLanguage, setTargetLanguage] = useState<string>('es');
    const [popover, setPopover] = useState<PopoverState>({
        text: null,
        translation: null,
        isLoading: false,
        position: null,
    });
    const [currentUser, setCurrentUser] = useState<string | null>(null);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

    const mainRef = useRef<HTMLElement>(null);
    const viewerRef = useRef<HTMLDivElement>(null);
    const scrollSaveTimeout = useRef<number | null>(null);

    useEffect(() => {
        const user = authService.getCurrentUser();
        if (user) {
            handleLoginSuccess(user);
        }
    }, []);

    useEffect(() => {
        const processFile = async () => {
            if (!file) return;

            setIsParsing(true);
            setError(null);
            setContent('');
            setPopover({ text: null, translation: null, isLoading: false, position: null });

            try {
                const textContent = await parseFile(file);
                setContent(textContent);
                if (currentUser) {
                    dataService.saveProgress(currentUser, { 
                        fileName: file.name, 
                        fileContent: textContent, 
                        scrollPosition: 0 
                    });
                }
            } catch (err) {
                setError(err instanceof Error ? `Failed to parse file: ${err.message}` : 'An unknown error occurred during parsing.');
                console.error(err);
            } finally {
                setIsParsing(false);
            }
        };

        processFile();
    }, [file, currentUser]);
    
    useEffect(() => {
        const fetchTranslation = async () => {
            if (popover.text && popover.isLoading) {
                try {
                    const translationText = await getTranslation(popover.text, sourceLanguage, targetLanguage);
                    setPopover(p => p.text ? { ...p, translation: translationText, isLoading: false } : p);
                } catch (err) {
                     const errorMessage = err instanceof Error ? `Failed to fetch translation: ${err.message}` : 'An unknown error occurred.';
                    setPopover(p => p.text ? { ...p, translation: errorMessage, isLoading: false } : p);
                    console.error(err);
                }
            }
        };

        fetchTranslation();
    }, [popover.text, popover.isLoading, sourceLanguage, targetLanguage]);

    const handleFileChange = (selectedFile: File | null) => {
        if (selectedFile) {
            setFileName(selectedFile.name);
            setFile(selectedFile);
        }
    };
    
    const handleReset = () => {
        if (currentUser) {
            dataService.clearProgress(currentUser);
        }
        setFile(null);
        setFileName('');
        setContent('');
        setError(null);
        setPopover({ text: null, translation: null, isLoading: false, position: null });
    };

    const handleTextSelect = useCallback(() => {
        const selection = window.getSelection();
        if (!selection || !mainRef.current?.contains(selection.anchorNode)) {
            return;
        }

        const selectedText = selection.toString().trim();

        if (selectedText && selectedText.length > 1) {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            
            setPopover({
                text: selectedText,
                translation: null,
                isLoading: true,
                position: { top: rect.bottom, left: rect.left },
            });
        }
    }, []);

    const handleClosePopover = useCallback(() => {
        setPopover({ text: null, translation: null, isLoading: false, position: null });
    }, []);

    const handleLanguageChange = (setter: React.Dispatch<React.SetStateAction<string>>, langCode: string) => {
        setter(langCode);
        if (popover.text) {
            setPopover(p => ({ ...p, isLoading: true, translation: null }));
        }
    };

    const handleLoginSuccess = (userEmail: string) => {
        setCurrentUser(userEmail);
        setIsAuthModalOpen(false);
        const progress = dataService.loadProgress(userEmail);
        if (progress && window.confirm("You have saved progress. Would you like to restore it?")) {
            setContent(progress.fileContent);
            setFileName(progress.fileName);
            // Restore scroll position after content renders
            setTimeout(() => {
                if (viewerRef.current) {
                    viewerRef.current.scrollTop = progress.scrollPosition;
                }
            }, 100);
        }
    };
    
    const handleLogout = () => {
        authService.logOut();
        setCurrentUser(null);
        handleReset();
    };

    const handleScroll = () => {
        if (scrollSaveTimeout.current) {
            clearTimeout(scrollSaveTimeout.current);
        }
        scrollSaveTimeout.current = window.setTimeout(() => {
            if (currentUser && viewerRef.current) {
                const progress = dataService.loadProgress(currentUser);
                if (progress) {
                    dataService.saveProgress(currentUser, {
                        ...progress,
                        scrollPosition: viewerRef.current.scrollTop,
                    });
                }
            }
        }, 1500);
    };

    return (
        <div className="min-h-screen font-sans text-slate-800 flex flex-col">
            <header className="bg-white shadow-sm sticky top-0 z-20">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-3">
                        <h1 className="text-xl md:text-2xl font-bold text-slate-700">Interactive Reader</h1>
                        <div className="flex items-center space-x-2 md:space-x-4">
                            {currentUser ? (
                                <>
                                    <span className="text-sm text-slate-600 hidden md:block">Welcome, {currentUser}</span>
                                    <button onClick={handleLogout} className="px-4 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-700 text-sm">Logout</button>
                                </>
                            ) : (
                                <button onClick={() => setIsAuthModalOpen(true)} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">Login / Sign Up</button>
                            )}
                            {(file || (currentUser && fileName)) && (
                                <button
                                    onClick={handleReset}
                                    className="px-4 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 text-sm whitespace-nowrap"
                                >
                                    New Doc
                                </button>
                            )}
                        </div>
                    </div>
                     {content && (
                         <div className="flex justify-start items-center py-2 border-t border-slate-200">
                             <LanguageSelector label="From:" selectedLanguage={sourceLanguage} onLanguageChange={(code) => handleLanguageChange(setSourceLanguage, code)} />
                             <LanguageSelector label="To:" selectedLanguage={targetLanguage} onLanguageChange={(code) => handleLanguageChange(setTargetLanguage, code)} />
                         </div>
                     )}
                </div>
            </header>

            <main ref={mainRef} className="container mx-auto p-4 sm:p-6 lg:p-8 flex-grow" onPointerUp={handleTextSelect}>
                {!content && !isParsing && <FileUpload onFileSelect={handleFileChange} />}
                
                {isParsing && (
                    <div className="text-center py-10">
                        <p className="text-lg text-slate-600">Parsing document, please wait...</p>
                    </div>
                )}

                {error && (
                    <div className="text-center bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                        <strong className="font-bold">Error:</strong>
                        <span className="block sm:inline ml-2">{error}</span>
                    </div>
                )}
                
                {content && <DocumentViewer content={content} scrollRef={viewerRef} onScroll={handleScroll} />}

                {popover.position && popover.text && (
                    <TranslationPopover
                        text={popover.text}
                        translation={popover.translation}
                        isLoading={popover.isLoading}
                        position={popover.position}
                        onClose={handleClosePopover}
                    />
                )}
            </main>
            {isAuthModalOpen && <AuthModal onClose={() => setIsAuthModalOpen(false)} onAuthSuccess={handleLoginSuccess} />}
        </div>
    );
};

export default App;
