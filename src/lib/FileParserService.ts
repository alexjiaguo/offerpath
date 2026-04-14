import mammoth from 'mammoth';

// Simplified interface for pdfjs-dist
interface PDFJS {
  GlobalWorkerOptions: {
    workerSrc: string;
  };
  version: string;
  getDocument: (options: { data: ArrayBuffer }) => {
    promise: Promise<{
      numPages: number;
      getPage: (index: number) => Promise<{
        getTextContent: () => Promise<{
          items: { str?: string; hasEOL?: boolean }[];
        }>;
      }>;
    }>;
  };
}

let pdfjsModule: PDFJS | null = null;

async function getPdfjs() {
  if (!pdfjsModule) {
    pdfjsModule = await import('pdfjs-dist') as unknown as PDFJS;
    // Using a reliable CDN for the worker
    pdfjsModule.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsModule.version}/pdf.worker.min.mjs`;
  }
  return pdfjsModule;
}

export class FileParserService {
  static async parseFile(file: File): Promise<string> {
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    if (extension === 'pdf') {
      return this.parsePdf(file);
    } else if (extension === 'docx' || extension === 'doc') {
      return this.parseDocx(file);
    } else if (extension === 'txt' || extension === 'md') {
      return file.text();
    }
    
    throw new Error(`Unsupported file type: ${extension}`);
  }

  private static async parsePdf(file: File): Promise<string> {
    try {
      const pdfjs = await getPdfjs();
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      let fullText = '';
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item) => {
            const str = item.str || '';
            return item.hasEOL ? str + '\n' : str;
          })
          .join(' ')
          .replace(/  +/g, ' ')
          .trim();
        fullText += pageText + '\n\n';
      }
      
      return fullText.trim();
    } catch (err) {
      throw new Error(`PDF parsing failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  private static async parseDocx(file: File): Promise<string> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    } catch (err) {
      throw new Error(`DOCX parsing failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
}
