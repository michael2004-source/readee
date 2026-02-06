
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { PopoverState, SavedWord, AppSection, UserDocument, FirebaseUser } from './types.ts';
import { parseFile } from './utils/fileUtils.ts';
import { getTranslation } from './services/translationService.ts';
import * as dataService from './services/dataService.ts';
import * as authService from './services/authService.ts';

import LanguageSelector from './components/LanguageSelector.tsx';
import TranslationPopover from './components/TranslationPopover.tsx';
import ReaderSection from './components/ReaderSection.tsx';
import WordBankSection from './components/WordBankSection.tsx';
import VocabTrainerSection from './components/VocabTrainerSection.tsx';
import SettingsSection from './components/SettingsSection.tsx';
import { BookOpenIcon, BookmarkIcon, BrainIcon, GlobeIcon, GoogleIcon, SettingsIcon } from './components/icons.tsx';

const App: React.FC = () => {
    // Auth & Navigation
    const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [activeSection, setActiveSection] = useState<AppSection>('reader');

    // Language Preferences
    const [studyLanguage, setStudyLanguage] = useState<string>('es');
    const [translationLanguage, setTranslationLanguage] = useState<string>('en');

    // Data State
    const [allDocuments, setAllDocuments] = useState<UserDocument[]>([]);
    const [allWords, setAllWords] = useState<SavedWord[]>([]);
    const [activeDocId, setActiveDocId] = useState<string | null>(null);

    // UI/UX State
    const [isParsing, setIsParsing] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [popover, setPopover] = useState<PopoverState>({ text: null, translation: null, isLoading: false, position: null });

    // Custom Selection State
    const [selectionRange, setSelectionRange] = useState<{ start: number; end: number } | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    const mainRef = useRef<HTMLElement>(null);
    const viewerRef = useRef<HTMLDivElement>(null);
    const scrollSaveTimeout = useRef<number | null>(null);

    // Auth Listener
    useEffect(() => {
        const unsubscribe = authService.onAuthStateChanged(async (user) => {
            if (user) {
                setCurrentUser({
                    uid: user.uid,
                    displayName: user.displayName,
                    photoURL: user.photoURL
                });
                const [docs, words] = await Promise.all([
                    dataService.getDocuments(user.uid),
                    dataService.getWordBank(user.uid)
                ]);
                setAllDocuments(docs);
                setAllWords(words);
            } else {
                setCurrentUser(null);
                setAllDocuments([]);
                setAllWords([]);
                setActiveDocId(null);
            }
            setAuthLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // Derived States (Filtered by Language)
    const filteredDocuments = useMemo(() => 
        allDocuments.filter(doc => doc.targetLanguage === studyLanguage), 
    [allDocuments, studyLanguage]);

    const filteredWordBank = useMemo(() => 
        allWords.filter(word => word.targetLang === studyLanguage), 
    [allWords, studyLanguage]);

    const activeDoc = useMemo(() => 
        allDocuments.find(d => d.id === activeDocId), 
    [allDocuments, activeDocId]);

    useEffect(() => {
        if (activeDoc && activeDoc.targetLanguage !== studyLanguage) {
            setActiveDocId(null);
            setSelectionRange(null);
            setPopover(p => ({ ...p, position: null }));
        }
    }, [studyLanguage, activeDoc]);

    const studiedLanguages = useMemo(() => {
        const langs = new Set<string>([studyLanguage]);
        allDocuments.forEach(d => langs.add(d.targetLanguage));
        allWords.forEach(w => langs.add(w.targetLang));
        return Array.from(langs);
    }, [allDocuments, allWords, studyLanguage]);

    // Document Handlers
    const handleUpload = async (file: File) => {
        if (!currentUser) { alert("Please sign in to upload documents."); return; }
        setIsParsing(true);
        setError(null);
        try {
            const content = await parseFile(file);
            const newDoc = await dataService.saveDocument(currentUser.uid, {
                fileName: file.name,
                fileContent: content,
                scrollPosition: 0,
                targetLanguage: studyLanguage
            });
            setAllDocuments(await dataService.getDocuments(currentUser.uid));
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
            setTimeout(() => { if (viewerRef.current) viewerRef.current.scrollTop = doc.scrollPosition; }, 50);
        }
    };

    const handleDeleteDoc = async (id: string) => {
        if (!currentUser) return;
        if (window.confirm("Delete this document? This cannot be undone.")) {
            await dataService.deleteDocument(currentUser.uid, id);
            setAllDocuments(await dataService.getDocuments(currentUser.uid));
            if (activeDocId === id) setActiveDocId(null);
        }
    };

    const handleScroll = () => {
        if (!currentUser || !activeDocId || !viewerRef.current) return;
        if (scrollSaveTimeout.current) clearTimeout(scrollSaveTimeout.current);
        scrollSaveTimeout.current = window.setTimeout(() => {
            if (viewerRef.current) {
                dataService.updateDocumentProgress(currentUser.uid, activeDocId, viewerRef.current.scrollTop);
            }
        }, 1000);
    };

    // Word Handlers
    const handleSaveWord = async (text: string, translation: string) => {
        if (!currentUser) { alert("Please sign in to save words."); return; }
        const updated = await dataService.saveWordToBank(currentUser.uid, {
            text, translation, sourceLang: translationLanguage, targetLang: studyLanguage
        });
        setAllWords(updated);
    };

    const handleRemoveWord = async (text: string) => {
        if (!currentUser) return;
        const updated = await dataService.removeWordFromBank(currentUser.uid, text, studyLanguage);
        setAllWords(updated);
    };

    // Translation Handler
    useEffect(() => {
        const fetchTranslation = async () => {
            if (popover.text) {
                setPopover(p => ({ ...p, isLoading: true, translation: null }));
                try {
                    const trans = await getTranslation(popover.text, studyLanguage, translationLanguage);
                    setPopover(p => p.text ? { ...p, translation: trans, isLoading: false } : p);
                } catch (err) {
                    setPopover(p => ({ ...p, translation: 'Error fetching translation', isLoading: false }));
                }
            }
        };
        if (popover.text) fetchTranslation();
    }, [popover.text, translationLanguage, studyLanguage]);

    // Custom Selection Logic
    const tokens = useMemo(() => activeDoc?.fileContent.split(/(\s+)/) || [], [activeDoc]);
    const handleWordPointerDown = useCallback((index: number) => { setSelectionRange({ start: index, end: index }); setIsDragging(true); setPopover(p => ({ ...p, position: null })); }, []);
    const handleWordPointerEnter = useCallback((index: number) => { if (isDragging) { setSelectionRange(prev => prev ? { ...prev, end: index } : null); } }, [isDragging]);
    const handleSelectionEnd = useCallback((e?: React.PointerEvent) => {
        if (!isDragging || !selectionRange) return;
        setIsDragging(false);
        const min = Math.min(selectionRange.start, selectionRange.end);
        const max = Math.max(selectionRange.start, selectionRange.end);
        const selectedText = tokens.slice(min, max + 1).join('').trim();
        if (selectedText) {
            setPopover({ text: selectedText, translation: null, isLoading: true, position: { top: (e?.clientY ?? 0) + 10, left: e?.clientX ?? 0 } });
        } else {
            setSelectionRange(null);
        }
    }, [isDragging, selectionRange, tokens]);

    useEffect(() => {
        const handleGlobalPointerUp = (e: PointerEvent) => { if (isDragging) handleSelectionEnd(e); };
        window.addEventListener('pointerup', handleGlobalPointerUp);
        return () => window.removeEventListener('pointerup', handleGlobalPointerUp);
    }, [isDragging, handleSelectionEnd]);

    return (
        <div className="min-h-screen bg-stone-50 flex flex-col font-sans text-stone-900">
            {/* Header */}
            <header className="bg-white border-b border-stone-200 sticky top-0 z-30 shadow-sm">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveSection('reader')}>
                        <div className="w-9 h-9 bg-emerald-700 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-100"><BookOpenIcon className="w-5 h-5 text-white" /></div>
                        <div className="flex flex-col ml-1">
                            <h1 className="text-lg font-extrabold text-stone-800 leading-tight hidden sm:block tracking-tight">Linguist Reader</h1>
                            <div className="flex items-center gap-1.5">
                                <span className="flex w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse"></span>
                                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{studyLanguage.toUpperCase()} MODE</span>
                            </div>
                        </div>
                    </div>

                    {currentUser && (
                        <nav className="hidden md:flex items-center bg-stone-100 p-1 rounded-2xl">
                            <button onClick={() => setActiveSection('reader')} className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${activeSection === 'reader' ? 'bg-white text-emerald-700 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}>Library</button>
                            <button onClick={() => setActiveSection('wordbank')} className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${activeSection === 'wordbank' ? 'bg-white text-emerald-700 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}>Word Bank</button>
                            <button onClick={() => setActiveSection('trainer')} className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${activeSection === 'trainer' ? 'bg-white text-emerald-700 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}>Practice</button>
                            <button onClick={() => setActiveSection('settings')} className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${activeSection === 'settings' ? 'bg-white text-emerald-700 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}>Settings</button>
                        </nav>
                    )}

                    <div className="flex items-center gap-4">
                        {authLoading ? (
                            <div className="w-24 h-8 bg-stone-200 rounded-lg animate-pulse"></div>
                        ) : currentUser ? (
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-semibold hidden sm:block">{currentUser.displayName}</span>
                                <img src={currentUser.photoURL ?? ''} alt="User" className="w-8 h-8 rounded-full" />
                                <button onClick={authService.signOutUser} className="text-sm font-bold text-stone-500 hover:text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-all">Logout</button>
                            </div>
                        ) : (
                            <button onClick={authService.signInWithGoogle} className="flex items-center gap-2 px-4 py-2 bg-white text-stone-700 border border-stone-300 rounded-xl text-sm font-bold hover:bg-stone-50 shadow-sm transition-all active:scale-95">
                                <GoogleIcon className="w-5 h-5" />
                                <span>Sign in with Google</span>
                            </button>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main ref={mainRef} className="flex-grow container mx-auto px-4 py-8 mb-20 md:mb-8">
                {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2"><span className="font-bold">Error:</span> {error}</div>}
                
                {!currentUser && !authLoading && (
                     <div className="text-center mt-16">
                        <h2 className="text-3xl font-bold text-stone-800">Welcome to Linguist Reader</h2>
                        <p className="text-stone-600 mt-4 max-w-lg mx-auto">Please sign in with your Google account to upload documents, save words, and sync your progress across devices.</p>
                     </div>
                )}
                
                {currentUser && activeSection === 'reader' && (
                    <div className="flex flex-col gap-6">
                        {!activeDocId && studiedLanguages.length > 1 && (
                            <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
                                {studiedLanguages.map(lang => (
                                    <button key={lang} onClick={() => setStudyLanguage(lang)} className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${studyLanguage === lang ? 'bg-emerald-700 text-white border-emerald-700 shadow-md shadow-emerald-50' : 'bg-white text-stone-600 border-stone-200 hover:border-emerald-400'}`}>{lang.toUpperCase()} Books</button>
                                ))}
                            </div>
                        )}
                        <ReaderSection documents={filteredDocuments} activeDocId={activeDocId} isParsing={isParsing} onUpload={handleUpload} onSelectDoc={handleSelectDoc} onDeleteDoc={handleDeleteDoc} onCloseDoc={() => setActiveDocId(null)} onScroll={handleScroll} viewerRef={viewerRef} selectionRange={selectionRange} onWordPointerDown={handleWordPointerDown} onWordPointerEnter={handleWordPointerEnter} onSelectionEnd={handleSelectionEnd} />
                    </div>
                )}

                {currentUser && activeSection === 'wordbank' && <WordBankSection words={filteredWordBank} onRemove={handleRemoveWord} />}
                {currentUser && activeSection === 'trainer' && <VocabTrainerSection words={filteredWordBank} />}
                {currentUser && activeSection === 'settings' && <SettingsSection studyLanguage={studyLanguage} translationLanguage={translationLanguage} onStudyLanguageChange={setStudyLanguage} onTranslationLanguageChange={setTranslationLanguage} />}

            </main>

            {/* Mobile Bottom Navigation */}
            {currentUser && (
                <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 z-40 px-6 h-16 flex items-center justify-between shadow-[0_-4px_10px_rgba(0,0,0,0.03)]">
                    <button onClick={() => setActiveSection('reader')} className={`flex flex-col items-center gap-1 transition-colors ${activeSection === 'reader' ? 'text-emerald-700' : 'text-stone-400'}`}><BookOpenIcon className="w-6 h-6" /><span className="text-[10px] font-bold uppercase tracking-tighter">Library</span></button>
                    <button onClick={() => setActiveSection('wordbank')} className={`flex flex-col items-center gap-1 transition-colors ${activeSection === 'wordbank' ? 'text-emerald-700' : 'text-stone-400'}`}><BookmarkIcon className="w-6 h-6" /><span className="text-[10px] font-bold uppercase tracking-tighter">Bank</span></button>
                    <button onClick={() => setActiveSection('trainer')} className={`flex flex-col items-center gap-1 transition-colors ${activeSection === 'trainer' ? 'text-emerald-700' : 'text-stone-400'}`}><BrainIcon className="w-6 h-6" /><span className="text-[10px] font-bold uppercase tracking-tighter">Practice</span></button>
                    <button onClick={() => setActiveSection('settings')} className={`flex flex-col items-center gap-1 transition-colors ${activeSection === 'settings' ? 'text-emerald-700' : 'text-stone-400'}`}><SettingsIcon className="w-6 h-6" /><span className="text-[10px] font-bold uppercase tracking-tighter">Settings</span></button>
                </div>
            )}

            {/* Translation Popover */}
            {popover.position && popover.text && (
                <TranslationPopover text={popover.text} translation={popover.translation || ''} isLoading={popover.isLoading} position={popover.position} onClose={() => { setPopover(p => ({ ...p, position: null })); setSelectionRange(null); }} onSave={handleSaveWord} isSaved={filteredWordBank.some(w => w.text.toLowerCase() === popover.text?.toLowerCase())} translationLanguage={translationLanguage} onTranslationLanguageChange={setTranslationLanguage} />
            )}
            
            <style>{`.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
        </div>
    );
};

export default App;
