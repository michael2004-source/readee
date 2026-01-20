
// These are loaded from CDN in index.html
declare const pdfjsLib: any;
declare const ePub: any;

const parsePdf = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        fullText += textContent.items.map((item: any) => item.str).join(' ') + '\n\n';
    }
    return fullText;
};

const parseEpub = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const book = ePub(arrayBuffer);
    const allContent: string[] = [];

    await book.ready;

    for (const section of book.spine.items) {
      const doc = await book.load(section.href);
      if (doc.body) {
        allContent.push(doc.body.textContent || '');
      }
    }
    
    return allContent.join('\n\n');
};

export const parseFile = async (file: File): Promise<string> => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (extension === 'pdf') {
        if (typeof pdfjsLib === 'undefined') {
            throw new Error('pdf.js library is not loaded.');
        }
        return parsePdf(file);
    } else if (extension === 'epub') {
        if (typeof ePub === 'undefined') {
            throw new Error('epub.js library is not loaded.');
        }
        return parseEpub(file);
    } else {
        throw new Error('Unsupported file type. Please upload a PDF or EPUB.');
    }
};
