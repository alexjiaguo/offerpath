import mammoth from 'mammoth';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_PDF_PAGES = 100;

const ALLOWED_EXTENSIONS = new Set(['pdf', 'docx', 'doc', 'txt', 'md']);

const MIME_MAP: Record<string, string[]> = {
  pdf: ['application/pdf'],
  docx: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  doc: ['application/msword'],
  txt: ['text/plain'],
  md: ['text/plain', 'text/markdown'],
};

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
    pdfjsModule.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/build/pdf.worker.min.mjs",
      import.meta.url,
    ).toString();
  }
  return pdfjsModule;
}

export class FileParserService {
  static async parseFile(file: File): Promise<string> {
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB.`);
    }

    const extension = file.name.split('.').pop()?.toLowerCase() || '';

    // Validate extension
    if (!ALLOWED_EXTENSIONS.has(extension)) {
      throw new Error(`Unsupported file type: .${extension}. Supported: PDF, DOCX, DOC, TXT, MD.`);
    }

    // Validate MIME type if available
    if (file.type && MIME_MAP[extension]) {
      const validMimes = MIME_MAP[extension];
      if (!validMimes.includes(file.type) && !file.type.startsWith('text/')) {
        throw new Error(`File MIME type (${file.type}) doesn't match expected type for .${extension} files.`);
      }
    }

    if (extension === 'pdf') {
      return this.parsePdf(file);
    } else if (extension === 'docx' || extension === 'doc') {
      return this.parseDocx(file);
    } else {
      return file.text();
    }
  }

  private static async parsePdf(file: File): Promise<string> {
    try {
      const pdfjs = await getPdfjs();
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;

      if (pdf.numPages > MAX_PDF_PAGES) {
        throw new Error(`PDF has ${pdf.numPages} pages. Maximum is ${MAX_PDF_PAGES}.`);
      }

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
      if (err instanceof Error && err.message.includes('Maximum')) throw err;
      throw new Error(`PDF parsing failed. Please ensure the file is a valid PDF.`);
    }
  }

  private static async parseDocx(file: File): Promise<string> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    } catch {
      throw new Error(`DOCX parsing failed. Please ensure the file is a valid Word document.`);
    }
  }
}
