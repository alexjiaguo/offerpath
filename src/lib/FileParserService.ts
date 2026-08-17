import { PDFJS_WORKER_SRC } from "@/lib/pdfWorker";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_PDF_PAGES = 100;

const ALLOWED_EXTENSIONS = new Set(['pdf', 'docx', 'doc', 'txt', 'md']);
const GENERIC_MIMES = new Set(['', 'application/octet-stream', 'binary/octet-stream']);

const MIME_MAP: Record<string, string[]> = {
  pdf: ['application/pdf'],
  docx: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  doc: ['application/msword'],
  txt: ['text/plain'],
  md: ['text/plain', 'text/markdown'],
};

// Simplified interface for pdfjs-dist
interface PDFTextItem {
  str?: string;
  hasEOL?: boolean;
  transform?: number[];
}

interface PDFJS {
  GlobalWorkerOptions: {
    workerSrc: string;
  };
  version: string;
  getDocument: (options: { data: ArrayBuffer | Uint8Array }) => {
    promise: Promise<{
      numPages: number;
      getPage: (index: number) => Promise<{
        getTextContent: () => Promise<{
          items: PDFTextItem[];
        }>;
      }>;
    }>;
  };
}

let pdfjsModule: PDFJS | null = null;

async function getPdfjs() {
  if (!pdfjsModule) {
    pdfjsModule = await import('pdfjs-dist') as unknown as PDFJS;
    pdfjsModule.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_SRC;
  }
  return pdfjsModule;
}

export class FileParserService {
  static async parseFile(file: File): Promise<string> {
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB.`);
    }

    const extension = file.name.split('.').pop()?.toLowerCase() || '';

    if (!ALLOWED_EXTENSIONS.has(extension)) {
      throw new Error(`Unsupported file type: .${extension}. Supported: PDF, DOCX, DOC, TXT, MD.`);
    }

    if (file.type && MIME_MAP[extension] && !GENERIC_MIMES.has(file.type) && !file.type.startsWith('text/')) {
      const validMimes = MIME_MAP[extension];
      if (!validMimes.includes(file.type)) {
        throw new Error(`File MIME type (${file.type}) doesn't match expected type for .${extension} files.`);
      }
    }

    if (extension === 'pdf') {
      return this.parsePdf(file);
    } else if (extension === 'docx') {
      return this.parseDocx(file);
    } else if (extension === 'doc') {
      return this.parseDoc(file);
    } else {
      return file.text();
    }
  }

  private static async parsePdf(file: File): Promise<string> {
    try {
      const pdfjs = await getPdfjs();
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjs.getDocument({ data: new Uint8Array(arrayBuffer) });
      const pdf = await loadingTask.promise;

      if (pdf.numPages > MAX_PDF_PAGES) {
        throw new Error(`PDF has ${pdf.numPages} pages. Maximum is ${MAX_PDF_PAGES}.`);
      }

      let fullText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = this.extractPdfPageText(textContent.items);
        fullText += pageText + '\n\n';
      }

      const result = fullText.trim();
      if (!result) {
        throw new Error(
          'No text found in PDF. The file may be a scanned image. Please use a text-based PDF or copy your resume content manually.'
        );
      }
      return result;
    } catch (err) {
      if (err instanceof Error && (err.message.includes('Maximum') || err.message.includes('No text found') || err.message.includes('scanned'))) {
        throw err;
      }
      throw new Error('PDF parsing failed. Please ensure the file is a valid PDF.');
    }
  }

  /**
   * Reconstructs readable text from pdfjs text items.
   * Uses hasEOL flags and y-coordinate changes to detect line breaks,
   * avoiding the old approach of join(' ') which inserted spaces
   * after every newline and broke word boundaries.
   */
  private static extractPdfPageText(items: PDFTextItem[]): string {
    const lines: string[] = [];
    let currentLine: string[] = [];
    let lastY: number | null = null;

    for (const item of items) {
      const str = (item.str || '').trim();
      const y = item.transform ? item.transform[5] : null;

      // Detect line break: either hasEOL flag or significant y-coordinate change
      const yChanged = lastY !== null && y !== null && Math.abs(y - lastY) > 2;
      const lineBreak = item.hasEOL || yChanged;

      if (str) currentLine.push(str);

      if (lineBreak) {
        if (currentLine.length > 0) {
          lines.push(currentLine.join(' '));
          currentLine = [];
        } else if (item.hasEOL) {
          lines.push('');
        }
      }

      lastY = y;
    }

    if (currentLine.length > 0) {
      lines.push(currentLine.join(' '));
    }

    return lines.join('\n').replace(/ +/g, ' ').trim();
  }

  private static async parseDocx(file: File): Promise<string> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const mammoth = await import("mammoth");
      const convertToHtml = mammoth.convertToHtml ?? mammoth.default?.convertToHtml;
      const result = await convertToHtml({ arrayBuffer });
      return this.htmlToText(result.value);
    } catch {
      throw new Error('DOCX parsing failed. Please ensure the file is a valid Word document.');
    }
  }

  /**
   * Parses legacy .doc files (Word 97-2004 binary format, RTF, or HTML-based .doc).
   */
  private static async parseDoc(file: File): Promise<string> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);

      // 1. Check if the file is an RTF document (starts with {\rtf)
      const headerSnippet = new TextDecoder('ascii', { fatal: false }).decode(bytes.slice(0, Math.min(256, bytes.length)));
      if (headerSnippet.trim().startsWith('{\\rtf')) {
        return this.parseRtf(new TextDecoder('utf-8', { fatal: false }).decode(bytes));
      }

      // 2. Check if the file is HTML disguised as .doc
      if (headerSnippet.toLowerCase().includes('<html') || headerSnippet.toLowerCase().includes('<!doctype html')) {
        const html = new TextDecoder('utf-8', { fatal: false }).decode(bytes);
        return this.htmlToText(html);
      }

      // 3. Binary .doc (OLE2 Compound Document): Extract plain text stream runs
      const extractedText = this.extractBinaryDocText(bytes);
      if (extractedText.trim().length > 30) {
        return extractedText;
      }

      // Fallback to UTF-8 decoding
      const raw = new TextDecoder('utf-8', { fatal: false }).decode(bytes);
      const clean = raw.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, ' ').replace(/\s+/g, ' ').trim();
      if (clean.length > 30) {
        return clean;
      }

      throw new Error('Could not extract readable text from this .doc file. Please convert your file to .docx format and try again.');
    } catch (err) {
      if (err instanceof Error && (err.message.includes('Could not extract') || err.message.includes('convert your file to .docx'))) {
        throw err;
      }
      throw new Error('DOC parsing failed. Please convert your file to .docx format and try again.');
    }
  }

  /**
   * Lightweight RTF text extractor.
   */
  private static parseRtf(rtf: string): string {
    return rtf
      // Remove font table, color table, stylesheet blocks
      .replace(/{\\fonttbl[\s\S]*?}/gi, '')
      .replace(/{\\colortbl[\s\S]*?}/gi, '')
      .replace(/{\\stylesheet[\s\S]*?}/gi, '')
      .replace(/{\\info[\s\S]*?}/gi, '')
      // Replace paragraphs and line breaks
      .replace(/\\par[d]?\s*/gi, '\n')
      .replace(/\\line\s*/gi, '\n')
      .replace(/\\tab\s*/gi, '\t')
      // Replace hex encoded characters \'hh
      .replace(/\\'([0-9a-fA-F]{2})/g, (_m, hex) => String.fromCharCode(parseInt(hex, 16)))
      // Remove other control words
      .replace(/\\[a-zA-Z]+(-?\d+)?\s?/g, '')
      // Remove group brackets
      .replace(/[{}]/g, '')
      // Clean up whitespace
      .replace(/\n{3,}/g, '\n\n')
      .replace(/[ \t]+/g, ' ')
      .trim();
  }

  /**
   * Extracts text from binary Word .doc (OLE2/BIFF) files by searching for
   * UTF-16LE and ASCII text streams and stripping binary metadata.
   */
  private static extractBinaryDocText(bytes: Uint8Array): string {
    const textRuns: string[] = [];

    // Attempt UTF-16LE extraction (Word stores Unicode strings as UTF-16LE)
    let utf16Buffer: number[] = [];
    for (let i = 0; i < bytes.length - 1; i += 2) {
      const charCode = bytes[i] | (bytes[i + 1] << 8);
      // Printable Unicode range or common newline/tab
      if ((charCode >= 32 && charCode < 65534) || charCode === 10 || charCode === 13 || charCode === 9) {
        utf16Buffer.push(charCode);
      } else {
        if (utf16Buffer.length >= 4) {
          const run = String.fromCharCode(...utf16Buffer);
          if (/[a-zA-Z0-9\u4e00-\u9fa5]{2,}/.test(run) && !this.isWordMetadata(run)) {
            textRuns.push(run);
          }
        }
        utf16Buffer = [];
      }
    }
    if (utf16Buffer.length >= 4) {
      const run = String.fromCharCode(...utf16Buffer);
      if (!this.isWordMetadata(run)) textRuns.push(run);
    }

    // Attempt ASCII extraction
    let asciiBuffer: number[] = [];
    for (let i = 0; i < bytes.length; i++) {
      const b = bytes[i];
      if ((b >= 32 && b <= 126) || b === 10 || b === 13 || b === 9) {
        asciiBuffer.push(b);
      } else {
        if (asciiBuffer.length >= 4) {
          const run = String.fromCharCode(...asciiBuffer);
          if (/[a-zA-Z0-9]{2,}/.test(run) && !this.isWordMetadata(run)) {
            textRuns.push(run);
          }
        }
        asciiBuffer = [];
      }
    }
    if (asciiBuffer.length >= 4) {
      const run = String.fromCharCode(...asciiBuffer);
      if (!this.isWordMetadata(run)) textRuns.push(run);
    }

    // Deduplicate and assemble
    const combined = textRuns.join('\n');
    return combined
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/[ \t]+/g, ' ')
      .trim();
  }

  private static isWordMetadata(text: string): boolean {
    const metaPatterns = [
      /^Normal\.dot/i,
      /^Microsoft Word/i,
      /^WordDocument/i,
      /^CompObj/i,
      /^SummaryInformation/i,
      /^DocumentSummaryInformation/i,
      /Times New Roman|Calibri|Arial|Courier New|Segoe UI/i,
      /^[A-Z]:\\[A-Za-z0-9_.\\]+/,
      /^StandardJet/i,
    ];
    return metaPatterns.some((pattern) => pattern.test(text.trim()));
  }

  /**
   * Converts mammoth HTML output to structured plain text.
   * Headings are uppercased to help the section detector recognize them.
   * List items become bullet points (- prefix).
   */
  private static htmlToText(html: string): string {
    return html
      // Headings -> uppercase with surrounding newlines
      .replace(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/gi, (_match, content: string) =>
        '\n\n' + this.stripTags(content).toUpperCase().trim() + '\n'
      )
      // Bold standalone paragraphs -> uppercase section titles if short
      .replace(/<p[^>]*><strong>([\s\S]*?)<\/strong><\/p>/gi, (_match, content: string) => {
        const text = this.stripTags(content).trim();
        if (text.length > 2 && text.length < 50 && !text.includes('.') && !text.match(/^[-•*▪▫➢✓]/)) {
          return '\n\n' + text.toUpperCase() + '\n';
        }
        return '\n' + text + '\n';
      })
      // List items -> bullet points
      .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_match, content: string) =>
        '\n- ' + this.stripTags(content).trim()
      )
      // Paragraphs -> newlines around content
      .replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, (_match, content: string) =>
        '\n' + this.stripTags(content).trim() + '\n'
      )
      // Line breaks
      .replace(/<br\s*\/?>/gi, '\n')
      // Table elements -> newlines
      .replace(/<\/tr>/gi, '\n')
      .replace(/<\/?(td|th)[^>]*>/gi, ' | ')
      // Special bullet glyphs normalization
      .replace(/^[ \t]*[▪▫➢✓◆◇●○•*][ \t]*/gm, '- ')
      // Strip remaining tags
      .replace(/<[^>]+>/g, '')
      // Decode HTML entities
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&apos;/g, "'")
      // Clean up whitespace
      .replace(/\n{3,}/g, '\n\n')
      .replace(/[ \t]+/g, ' ')
      .replace(/\n /g, '\n')
      .trim();
  }

  private static stripTags(html: string): string {
    return html
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
  }
}
