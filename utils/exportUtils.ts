
import { SavedWord } from '../types.ts';

const escapeCsvCell = (cell: string) => {
    // If the cell contains a comma, double quote, or newline, wrap it in double quotes.
    if (/[",\n]/.test(cell)) {
        // Also, double up any existing double quotes.
        return `"${cell.replace(/"/g, '""')}"`;
    }
    return cell;
};

export const exportWordsToCsv = (words: SavedWord[]) => {
    const headers = ['"Original Text"', '"Translation"', '"Learning Language"', '"Translation Language"', '"Saved On"'];
    const rows = words.map(word => [
        escapeCsvCell(word.text),
        escapeCsvCell(word.translation),
        escapeCsvCell(word.targetLang), // Learning Language is targetLang
        escapeCsvCell(word.sourceLang), // Translation Language is sourceLang
        escapeCsvCell(new Date(word.timestamp).toLocaleString())
    ].join(','));

    const csvContent = [headers.join(','), ...rows].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `word_bank_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
