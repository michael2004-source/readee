
import React from 'react';
import { GlobeIcon } from './icons';

interface LanguageSelectorProps {
    label?: string;
    selectedLanguage: string;
    onLanguageChange: (languageCode: string) => void;
}

const LANGUAGES = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ru', name: 'Russian' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'ar', name: 'Arabic' },
    { code: 'hi', name: 'Hindi' },
    { code: 'tr', name: 'Turkish' },
    { code: 'zh-CN', name: 'Chinese' },
];

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ label, selectedLanguage, onLanguageChange }) => {
    return (
        <div className="flex items-center space-x-2">
            {label && <label htmlFor={`language-select-${label}`} className="text-sm font-medium text-stone-600 shrink-0">{label}</label>}
            <GlobeIcon className="w-4 h-4 text-stone-400" aria-hidden="true" />
            <select
                id={`language-select-${label}`}
                value={selectedLanguage}
                onChange={(e) => onLanguageChange(e.target.value)}
                className="bg-white border border-stone-200 text-stone-900 text-xs font-bold rounded-lg focus:ring-emerald-700 focus:border-emerald-700 block w-full p-1.5 transition-all"
            >
                {LANGUAGES.map(({ code, name }) => (
                    <option key={code} value={code}>
                        {name}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default LanguageSelector;
