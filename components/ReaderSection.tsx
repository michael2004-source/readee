
import React from 'react';
import { UserDocument } from '../types';
import FileUpload from './FileUpload';
import DocumentViewer from './DocumentViewer';
import { BookOpenIcon, TrashIcon } from './icons';

interface ReaderSectionProps {
    documents: UserDocument[];
    activeDocId: string | null;
    isParsing: boolean;
    onUpload: (file: File) => void;
    onSelectDoc: (id: string) => void;
    onDeleteDoc: (id: string) => void;
    onCloseDoc: () => void;
    onScroll: () => void;
    viewerRef: React.RefObject<HTMLDivElement>;
}

const ReaderSection: React.FC<ReaderSectionProps> = ({
    documents,
    activeDocId,
    isParsing,
    onUpload,
    onSelectDoc,
    onDeleteDoc,
    onCloseDoc,
    onScroll,
    viewerRef
}) => {
    const activeDoc = documents.find(d => d.id === activeDocId);

    if (activeDoc) {
        return (
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        <BookOpenIcon className="w-5 h-5 text-blue-500" />
                        <h2 className="text-sm font-bold text-slate-700 truncate max-w-[200px] md:max-w-md">{activeDoc.fileName}</h2>
                    </div>
                    <button 
                        onClick={onCloseDoc}
                        className="text-xs font-bold text-slate-500 hover:text-slate-800 bg-slate-100 px-3 py-1.5 rounded-md transition-colors"
                    >
                        Back to Library
                    </button>
                </div>
                <DocumentViewer 
                    content={activeDoc.fileContent} 
                    scrollRef={viewerRef} 
                    onScroll={onScroll} 
                />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8">
            <div className="bg-white p-8 rounded-2xl border-2 border-dashed border-slate-200 text-center">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Build Your Library</h2>
                <p className="text-slate-500 mb-6">Upload PDFs or EPUBs to start your interactive reading experience.</p>
                <FileUpload onFileSelect={onUpload} />
                {isParsing && (
                    <div className="mt-4 flex items-center justify-center gap-2 text-blue-600">
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="font-medium">Parsing document...</span>
                    </div>
                )}
            </div>

            {documents.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="col-span-full">
                        <h3 className="text-lg font-bold text-slate-700 mb-4">Your Documents</h3>
                    </div>
                    {documents.map((doc) => (
                        <div key={doc.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group relative">
                            <div className="flex flex-col gap-3">
                                <div className="flex items-start justify-between">
                                    <div className="bg-blue-50 p-2 rounded-lg">
                                        <BookOpenIcon className="w-6 h-6 text-blue-500" />
                                    </div>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); onDeleteDoc(doc.id); }}
                                        className="p-1.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-md opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                                <h4 className="font-bold text-slate-800 truncate">{doc.fileName}</h4>
                                <div className="flex justify-between items-center">
                                    <p className="text-xs text-slate-400">Modified {new Date(doc.lastOpened).toLocaleDateString()}</p>
                                    <button 
                                        onClick={() => onSelectDoc(doc.id)}
                                        className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm shadow-blue-100"
                                    >
                                        Resume Reading
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ReaderSection;
