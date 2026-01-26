
import React from 'react';
import LanguageSelector from './LanguageSelector';
import { SettingsIcon, GlobeIcon, BookOpenIcon } from './icons';

interface SettingsSectionProps {
    studyLanguage: string;
    translationLanguage: string;
    onStudyLanguageChange: (lang: string) => void;
    onTranslationLanguageChange: (lang: string) => void;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({
    studyLanguage,
    translationLanguage,
    onStudyLanguageChange,
    onTranslationLanguageChange,
}) => {
    return (
        <div className="max-w-2xl mx-auto w-full bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
            <div className="p-8 border-b border-stone-100 bg-stone-50/50">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                        <SettingsIcon className="w-5 h-5 text-emerald-700" />
                    </div>
                    <h2 className="text-2xl font-bold text-stone-800">Preferences</h2>
                </div>
                <p className="text-stone-500">Customize your reading and learning experience.</p>
            </div>

            <div className="p-8 space-y-8">
                {/* Study Language Setting */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex-grow">
                        <div className="flex items-center gap-2 mb-1">
                            <BookOpenIcon className="w-4 h-4 text-emerald-700" />
                            <h3 className="font-bold text-stone-800">Learning Language</h3>
                        </div>
                        <p className="text-sm text-stone-500">The language of the books you want to read. Your library and progress are tracked per language.</p>
                    </div>
                    <div className="shrink-0 w-full md:w-auto">
                        <LanguageSelector 
                            selectedLanguage={studyLanguage} 
                            onLanguageChange={onStudyLanguageChange} 
                        />
                    </div>
                </div>

                <div className="h-px bg-stone-100 w-full"></div>

                {/* Translation Language Setting */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex-grow">
                        <div className="flex items-center gap-2 mb-1">
                            <GlobeIcon className="w-4 h-4 text-amber-500" />
                            <h3 className="font-bold text-stone-800">Translation Target</h3>
                        </div>
                        <p className="text-sm text-stone-500">The language you want definitions and translations to be displayed in.</p>
                    </div>
                    <div className="shrink-0 w-full md:w-auto">
                        <LanguageSelector 
                            selectedLanguage={translationLanguage} 
                            onLanguageChange={onTranslationLanguageChange} 
                        />
                    </div>
                </div>
            </div>

            <div className="p-6 bg-stone-50 border-t border-stone-100">
                <p className="text-xs text-stone-400 text-center italic">Settings are automatically saved to your local profile.</p>
            </div>
        </div>
    );
};

export default SettingsSection;
