
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PopoverState, SavedWord, AppSection, UserDocument } from './types';
import { parseFile } from './utils/fileUtils';
import { getTranslation } from './services/translationService';
import * as authService from './services/authService';
import * as dataService from './services/dataService';

import LanguageSelector from './components/LanguageSelector';
import AuthModal from './components/AuthModal';
import TranslationPopover from './components/TranslationPopover';
import ReaderSection from './components/ReaderSection';
import WordBankSection from './components/WordBankSection';
import VocabTrainerSection from './components/VocabTrainerSection';
import { BookOpenIcon, BookmarkIcon, BrainIcon } from './components/icons';

const App: React.FC = () => {
    // Auth & Navigation
    const [currentUser, setCurrentUser] = useState<string | null>(null);
    const [activeSection, setActiveSection] = useState<AppSection>('reader');
    const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

    // Data State
    const [documents, setDocuments] = useState<UserDocument[]>([]);
    const [activeDocId, setActiveDocId] = useState<string | null>(null);
    const [wordBank, setWordBank] = useState<SavedWord[]>([]);

    // UI/UX State
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

    const mainRef = useRef<HTMLElement>(null);
    const viewerRef = useRef<HTMLDivElement>(null);
    const scrollSaveTimeout = useRef<number | null>(null);

    // Init Session
    useEffect(() => {
        const user = authService.getCurrentUser();
        if (user) handleLoginSuccess(user);
    }, []);

    const handleLoginSuccess = (userEmail: string) => {
        setCurrentUser(userEmail);
        setIsAuthModalOpen(false);
        setDocuments(dataService.getDocuments(userEmail));
        setWordBank(dataService.getWordBank(userEmail));
    };

    const handleLogout = () => {
        authService.logOut();
        setCurrentUser(null);
        setDocuments([]);
        setWordBank([]);
        setActiveDocId(null);
        setActiveSection('reader');
    };

    // Document Handlers
    const handleUpload = async (file: File) => {
        if (!currentUser) {
            setIsAuthModalOpen(true);
            return;
        }

        setIsParsing(true);
        setError(null);
        try {
            const content = await parseFile(file);
            const newDoc = dataService.saveDocument(currentUser, {
                fileName: file.name,
                fileContent: content,
                scrollPosition: 0
            });
            setDocuments(dataService.getDocuments(currentUser));
            setActiveDocId(newDoc.id);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Upload failed');
        } finally {
            setIsParsing(false);
        }
    };

    const handleSelectDoc = (id: string) => {
        setActiveDocId(id);
        const doc = documents.find(d => d.id === id);
        if (doc && viewerRef.current) {
            setTimeout(() => {
                if (viewerRef.current) viewerRef.current.scrollTop = doc.scrollPosition;
            }, 50);
        }
    };

    const handleDeleteDoc = (id: string) => {
        if (!currentUser) return;
        if (window.confirm("Delete this document?")) {
            dataService.deleteDocument(currentUser, id);
            setDocuments(dataService.getDocuments(currentUser));
            if (activeDocId === id) setActiveDocId(null);
        }
    };

    const handleScroll = () => {
        if (!currentUser || !activeDocId || !viewerRef.current) return;
        if (scrollSaveTimeout.current) clearTimeout(scrollSaveTimeout.current);
        scrollSaveTimeout.current = window.setTimeout(() => {
            if (viewerRef.current) {
                dataService.updateDocumentProgress(currentUser, activeDocId, viewerRef.current.scrollTop);
            }
        }, 1000);
    };

    // Word Handlers
    const handleSaveWord = (text: string, translation: string) => {
        if (!currentUser) {
            setIsAuthModalOpen(true);
            return;
        }
        const updated = dataService.saveWordToBank(currentUser, {
            text, translation, sourceLang: sourceLanguage, targetLang: targetLanguage
        });
        setWordBank(updated);
    };

    const handleRemoveWord = (text: string) => {
        if (!currentUser) return;
        const updated = dataService.removeWordFromBank(currentUser, text);
        setWordBank(updated);
    };

    // Translation Handlers
    useEffect(() => {
        const fetchTranslation = async () => {
            if (popover.text && popover.isLoading) {
                try {
                    const trans = await getTranslation(popover.text, sourceLanguage, targetLanguage);
                    setPopover(p => p.text ? { ...p, translation: trans, isLoading: false } : p);
                } catch (err) {
                    setPopover(p => ({ ...p, translation: 'Error fetching translation', isLoading: false }));
                }
            }
        };
        fetchTranslation();
    }, [popover.text, popover.isLoading, sourceLanguage, targetLanguage]);

    const handleTextSelect = useCallback(() => {
        const sel = window.getSelection();
        if (!sel || !mainRef.current?.contains(sel.anchorNode)) return;
        const text = sel.toString().trim();
        if (text && text.length > 1) {
            const rect = sel.getRangeAt(0).getBoundingClientRect();
            setPopover({
                text, translation: null, isLoading: true,
                position: { top: rect.bottom, left: rect.left }
            });
        }
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <BookOpenIcon className="w-5 h-5 text-white" />
                        </div>
                        <h1 className="text-xl font-bold text-slate-800 tracking-tight hidden sm:block">Interactive Reader</h1>
                    </div>

                    <nav className="hidden md:flex items-center bg-slate-100 p-1 rounded-xl">
                        <button 
                            onClick={() => setActiveSection('reader')}
                            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeSection === 'reader' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Reader
                        </button>
                        <button 
                            onClick={() => setActiveSection('wordbank')}
                            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeSection === 'wordbank' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Word Bank
                        </button>
                        <button 
                            onClick={() => setActiveSection('trainer')}
                            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeSection === 'trainer' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Practice
                        </button>
                    </nav>

                    <div className="flex items-center gap-4">
                        {currentUser ? (
                            <button onClick={handleLogout} className="text-sm font-bold text-slate-500 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-all">
                                Logout
                            </button>
                        ) : (
                            <button onClick={() => setIsAuthModalOpen(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 shadow-sm shadow-blue-100">
                                Sign In
                            </button>
                        )}
                    </div>
                </div>
                
                {activeSection === 'reader' && activeDocId && (
                    <div className="bg-slate-50 border-t border-slate-200">
                        <div className="container mx-auto px-4 h-12 flex items-center gap-4">
                            <LanguageSelector label="From:" selectedLanguage={sourceLanguage} onLanguageChange={setSourceLanguage} />
                            <LanguageSelector label="To:" selectedLanguage={targetLanguage} onLanguageChange={setTargetLanguage} />
                        </div>
                    </div>
                )}
            </header>

            {/* Main Content */}
            <main ref={mainRef} className="flex-grow container mx-auto px-4 py-8 mb-20 md:mb-8" onPointerUp={handleTextSelect}>
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-center gap-2">
                        <span className="font-bold">Error:</span> {error}
                    </div>
                )}

                {activeSection === 'reader' && (
                    <ReaderSection 
                        documents={documents}
                        activeDocId={activeDocId}
                        isParsing={isParsing}
                        onUpload={handleUpload}
                        onSelectDoc={handleSelectDoc}
                        onDeleteDoc={handleDeleteDoc}
                        onCloseDoc={() => setActiveDocId(null)}
                        onScroll={handleScroll}
                        viewerRef={viewerRef}
                    />
                )}

                {activeSection === 'wordbank' && (
                    <WordBankSection words={wordBank} onRemove={handleRemoveWord} />
                )}

                {activeSection === 'trainer' && (
                    <VocabTrainerSection words={wordBank} />
                )}
            </main>

            {/* Mobile Bottom Navigation */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40 px-6 h-16 flex items-center justify-between shadow-[0_-4px_10px_rgba(0,0,0,0.03)]">
                <button onClick={() => setActiveSection('reader')} className={`flex flex-col items-center gap-1 ${activeSection === 'reader' ? 'text-blue-600' : 'text-slate-400'}`}>
                    <BookOpenIcon className="w-6 h-6" />
                    <span className="text-[10px] font-bold">Reader</span>
                </button>
                <button onClick={() => setActiveSection('wordbank')} className={`flex flex-col items-center gap-1 ${activeSection === 'wordbank' ? 'text-blue-600' : 'text-slate-400'}`}>
                    <BookmarkIcon className="w-6 h-6" />
                    <span className="text-[10px] font-bold">Bank</span>
                </button>
                <button onClick={() => setActiveSection('trainer')} className={`flex flex-col items-center gap-1 ${activeSection === 'trainer' ? 'text-blue-600' : 'text-slate-400'}`}>
                    <BrainIcon className="w-6 h-6" />
                    <span className="text-[10px] font-bold">Practice</span>
                </button>
            </div>

            {/* Modals & Overlays */}
            {popover.position && popover.text && (
                <TranslationPopover
                    text={popover.text}
                    translation={popover.translation || ''}
                    isLoading={popover.isLoading}
                    position={popover.position}
                    onClose={() => setPopover(p => ({ ...p, position: null }))}
                    onSave={handleSaveWord}
                    isSaved={wordBank.some(w => w.text.toLowerCase() === popover.text?.toLowerCase())}
                />
            )}

            {isAuthModalOpen && <AuthModal onClose={() => setIsAuthModalOpen(false)} onAuthSuccess={handleLoginSuccess} />}
        </div>
    );
};

export default App;
