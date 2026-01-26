
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
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
import { BookOpenIcon, BookmarkIcon, BrainIcon, GlobeIcon } from './components/icons';

const App: React.FC = () => {
    // Auth & Navigation
    const [currentUser, setCurrentUser] = useState<string | null>(null);
    const [activeSection, setActiveSection] = useState<AppSection>('reader');
    const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

    // Global Study Language State
    const [targetLanguage, setTargetLanguage] = useState<string>('es');
    const [sourceLanguage, setSourceLanguage] = useState<string>('en');

    // Data State
    const [allDocuments, setAllDocuments] = useState<UserDocument[]>([]);
    const [allWords, setAllWords] = useState<SavedWord[]>([]);
    const [activeDocId, setActiveDocId] = useState<string | null>(null);

    // UI/UX State
    const [isParsing, setIsParsing] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [popover, setPopover] = useState<PopoverState>({
        text: null,
        translation: null,
        isLoading: false,
        position: null,
    });

    // Custom Selection State
    const [selectionRange, setSelectionRange] = useState<{ start: number; end: number } | null>(null);
    const [isDragging, setIsDragging] = useState(false);

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
        setAllDocuments(dataService.getDocuments(userEmail));
        setAllWords(dataService.getWordBank(userEmail));
    };

    const handleLogout = () => {
        authService.logOut();
        setCurrentUser(null);
        setAllDocuments([]);
        setAllWords([]);
        setActiveDocId(null);
        setActiveSection('reader');
    };

    // Derived States (Filtered by Language)
    const filteredDocuments = useMemo(() => 
        allDocuments.filter(doc => doc.targetLanguage === targetLanguage), 
    [allDocuments, targetLanguage]);

    const filteredWordBank = useMemo(() => 
        allWords.filter(word => word.targetLang === targetLanguage), 
    [allWords, targetLanguage]);

    const activeDoc = useMemo(() => 
        allDocuments.find(d => d.id === activeDocId), 
    [allDocuments, activeDocId]);

    // Safety: If target language changes, close the doc if it doesn't match
    useEffect(() => {
        if (activeDoc && activeDoc.targetLanguage !== targetLanguage) {
            setActiveDocId(null);
            setSelectionRange(null);
            setPopover(p => ({ ...p, position: null }));
        }
    }, [targetLanguage, activeDoc]);

    // List of all languages user is currently studying
    const studiedLanguages = useMemo(() => {
        const langs = new Set<string>();
        allDocuments.forEach(d => langs.add(d.targetLanguage));
        allWords.forEach(w => langs.add(w.targetLang));
        langs.add(targetLanguage); // Always include current target
        return Array.from(langs);
    }, [allDocuments, allWords, targetLanguage]);

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
                scrollPosition: 0,
                targetLanguage: targetLanguage
            });
            setAllDocuments(dataService.getDocuments(currentUser));
            setActiveDocId(newDoc.id);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Upload failed');
        } finally {
            setIsParsing(false);
        }
    };

    const handleSelectDoc = (id: string) => {
        setActiveDocId(id);
        const doc = allDocuments.find(d => d.id === id);
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
            setAllDocuments(dataService.getDocuments(currentUser));
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
        setAllWords(updated);
    };

    const handleRemoveWord = (text: string) => {
        if (!currentUser) return;
        const updated = dataService.removeWordFromBank(currentUser, text, targetLanguage);
        setAllWords(updated);
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

    // Custom Selection Logic
    const tokens = useMemo(() => activeDoc?.fileContent.split(/(\s+)/) || [], [activeDoc]);

    const handleWordPointerDown = useCallback((index: number) => {
        setSelectionRange({ start: index, end: index });
        setIsDragging(true);
        setPopover(p => ({ ...p, position: null }));
    }, []);

    const handleWordPointerEnter = useCallback((index: number) => {
        if (isDragging) {
            setSelectionRange(prev => prev ? { ...prev, end: index } : null);
        }
    }, [isDragging]);

    const handleSelectionEnd = useCallback((e?: React.PointerEvent) => {
        if (!isDragging || !selectionRange) return;
        setIsDragging(false);

        const min = Math.min(selectionRange.start, selectionRange.end);
        const max = Math.max(selectionRange.start, selectionRange.end);
        
        const selectedText = tokens
            .slice(min, max + 1)
            .join('')
            .trim();

        if (selectedText && selectedText.length > 0) {
            const clientX = e ? e.clientX : 0;
            const clientY = e ? e.clientY : 0;

            setPopover({
                text: selectedText,
                translation: null,
                isLoading: true,
                position: { top: clientY + 10, left: clientX }
            });
        } else {
            setSelectionRange(null);
        }
    }, [isDragging, selectionRange, tokens]);

    useEffect(() => {
        const handleGlobalPointerUp = () => {
            if (isDragging) handleSelectionEnd();
        };
        window.addEventListener('pointerup', handleGlobalPointerUp);
        return () => window.removeEventListener('pointerup', handleGlobalPointerUp);
    }, [isDragging, handleSelectionEnd]);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <BookOpenIcon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex flex-col ml-1">
                            <h1 className="text-lg font-bold text-slate-800 leading-tight hidden sm:block">Interactive Reader</h1>
                            <div className="flex items-center gap-1.5">
                                <span className="flex w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Workspace: {targetLanguage.toUpperCase()}</span>
                            </div>
                        </div>
                    </div>

                    <nav className="hidden md:flex items-center bg-slate-100 p-1 rounded-xl">
                        <button onClick={() => setActiveSection('reader')} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeSection === 'reader' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Reader</button>
                        <button onClick={() => setActiveSection('wordbank')} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeSection === 'wordbank' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Word Bank</button>
                        <button onClick={() => setActiveSection('trainer')} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeSection === 'trainer' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Practice</button>
                    </nav>

                    <div className="flex items-center gap-4">
                        <div className="hidden lg:flex items-center gap-4 border-l border-slate-200 pl-4">
                             <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-400 uppercase">Studying</span>
                                <LanguageSelector label="" selectedLanguage={targetLanguage} onLanguageChange={setTargetLanguage} />
                             </div>
                        </div>
                        {currentUser ? (
                            <button onClick={handleLogout} className="text-sm font-bold text-slate-500 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-all">Logout</button>
                        ) : (
                            <button onClick={() => setIsAuthModalOpen(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 shadow-sm shadow-blue-100">Sign In</button>
                        )}
                    </div>
                </div>
                
                {/* Secondary Header for specific context */}
                <div className="bg-slate-50 border-t border-slate-200 lg:hidden">
                    <div className="container mx-auto px-4 h-12 flex items-center justify-between">
                         <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Studying</span>
                            <LanguageSelector label="" selectedLanguage={targetLanguage} onLanguageChange={setTargetLanguage} />
                         </div>
                        {activeSection === 'reader' && activeDocId && (
                           <LanguageSelector label="Translate to:" selectedLanguage={sourceLanguage} onLanguageChange={setSourceLanguage} />
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main ref={mainRef} className="flex-grow container mx-auto px-4 py-8 mb-20 md:mb-8">
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-center gap-2">
                        <span className="font-bold">Error:</span> {error}
                    </div>
                )}

                {activeSection === 'reader' && (
                    <div className="flex flex-col gap-6">
                        {/* Quick Language Summary (Only when no doc open) */}
                        {!activeDocId && (
                            <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
                                {studiedLanguages.map(lang => (
                                    <button 
                                        key={lang}
                                        onClick={() => setTargetLanguage(lang)}
                                        className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${targetLanguage === lang ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-400'}`}
                                    >
                                        {lang.toUpperCase()} Workspace
                                    </button>
                                ))}
                            </div>
                        )}

                        <ReaderSection 
                            documents={filteredDocuments}
                            activeDocId={activeDocId}
                            isParsing={isParsing}
                            onUpload={handleUpload}
                            onSelectDoc={handleSelectDoc}
                            onDeleteDoc={handleDeleteDoc}
                            onCloseDoc={() => setActiveDocId(null)}
                            onScroll={handleScroll}
                            viewerRef={viewerRef}
                            selectionRange={selectionRange}
                            onWordPointerDown={handleWordPointerDown}
                            onWordPointerEnter={handleWordPointerEnter}
                            onSelectionEnd={handleSelectionEnd}
                        />
                    </div>
                )}

                {activeSection === 'wordbank' && (
                    <div className="flex flex-col gap-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <BookmarkIcon className="w-5 h-5 text-blue-600" />
                                <h2 className="text-xl font-bold text-slate-800">{targetLanguage.toUpperCase()} Vocabulary</h2>
                            </div>
                        </div>
                        <WordBankSection words={filteredWordBank} onRemove={handleRemoveWord} />
                    </div>
                )}

                {activeSection === 'trainer' && (
                    <div className="flex flex-col gap-6">
                        <div className="text-center mb-4">
                            <h2 className="text-2xl font-bold text-slate-800">Review {targetLanguage.toUpperCase()} Words</h2>
                            <p className="text-slate-500">Practice your recently saved vocabulary from this workspace.</p>
                        </div>
                        <VocabTrainerSection words={filteredWordBank} />
                    </div>
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
                    onClose={() => {
                        setPopover(p => ({ ...p, position: null }));
                        setSelectionRange(null);
                    }}
                    onSave={handleSaveWord}
                    isSaved={filteredWordBank.some(w => w.text.toLowerCase() === popover.text?.toLowerCase())}
                />
            )}

            {isAuthModalOpen && <AuthModal onClose={() => setIsAuthModalOpen(false)} onAuthSuccess={handleLoginSuccess} />}
            
            <style>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
};

export default App;
