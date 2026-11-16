import React, { useState, useEffect } from 'react';
import {
  X,
  FileText,
  Copy,
  Check,
  Download
} from 'lucide-react';
import mammoth from 'mammoth';
import { BoxedButton } from './shared/BoxedButton';

export interface DocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileName: string;
  fileUrl?: string;
  fileBlob?: Blob | File;
  rawText?: string;
  docContentHtml?: string;
  onShareToChat?: (text: any) => void;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  isOpen,
  onClose,
  fileName,
  fileUrl,
  fileBlob,
  rawText,
  docContentHtml
}) => {
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);

    const parseDoc = async () => {
      try {
        if (docContentHtml) {
          setHtmlContent(docContentHtml);
        } else if (fileBlob) {
          const arrayBuffer = await fileBlob.arrayBuffer();
          const result = await mammoth.convertToHtml({ arrayBuffer });
          if (result.value) {
            setHtmlContent(result.value);
          } else {
            setHtmlContent(`<p style="color: var(--text-muted)">No formatted text found in document.</p>`);
          }
        } else if (fileUrl && (fileName.endsWith('.docx') || fileName.endsWith('.doc'))) {
          const res = await fetch(fileUrl);
          const arrayBuffer = await res.arrayBuffer();
          const result = await mammoth.convertToHtml({ arrayBuffer });
          setHtmlContent(result.value || `<p style="color: var(--text-muted)">Document loaded successfully.</p>`);
        } else if (rawText && rawText.trim()) {
          const formatted = rawText
            .split('\n\n')
            .map((p) => `<p style="margin-bottom: 0.75rem; line-height: 1.6;">${p.replace(/\n/g, '<br/>')}</p>`)
            .join('');
          setHtmlContent(formatted);
        } else {
          setHtmlContent(`
            <div style="display: flex; flex-direction: column; gap: 0.75rem;">
              <h2 style="font-size: 0.9rem; font-weight: 700; text-transform: uppercase; font-family: monospace;">Document Spec Sheet</h2>
              <p style="font-size: 0.8rem; color: var(--text-muted);">File: ${fileName}</p>
              <hr style="border: 0; border-top: 1px solid var(--border-main); margin: 0.5rem 0;"/>
              <p style="font-size: 0.8rem; line-height: 1.6; color: var(--text-muted);">
                This project brief or specification is securely retained on the NexusCraft infrastructure. You can download the complete original file using the action button in the toolbar.
              </p>
            </div>
          `);
        }
      } catch (err) {
        setHtmlContent(`<p style="color: #ef4444">Could not render in-browser preview for this file format. Please download to view.</p>`);
      } finally {
        setLoading(false);
      }
    };

    parseDoc();
  }, [isOpen, docContentHtml, fileBlob, fileUrl, rawText, fileName]);

  if (!isOpen) return null;

  const handleCopy = () => {
    const div = document.createElement('div');
    div.innerHTML = htmlContent;
    const text = div.textContent || div.innerText || '';
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-4xl rounded-2xl border shadow-2xl flex flex-col max-h-[88vh] overflow-hidden transition-all stitch-card"
        style={{
          borderColor: 'var(--border-main)',
          color: 'var(--text-main)'
        }}
      >
        {/* Header Toolbar */}
        <div
          className="px-6 py-4 border-b flex items-center justify-between gap-4"
          style={{
            backgroundColor: 'var(--bg-canvas)',
            borderColor: 'var(--border-main)'
          }}
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <div
              className="p-2 border"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--border-main)',
                color: 'var(--text-main)'
              }}
            >
              <FileText className="w-4 h-4" />
            </div>
            <div className="overflow-hidden">
              <h3 className="font-display font-bold text-sm uppercase truncate max-w-md">
                {fileName}
              </h3>
              <p className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
                NexusCraft Document Inspector
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <BoxedButton
              onClick={handleCopy}
              variant="secondary"
              size="sm"
              icon={copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            >
              {copied ? 'Copied' : 'Copy Text'}
            </BoxedButton>

            {fileUrl && (
              <a
                href={fileUrl}
                target="_blank"
                rel="noreferrer"
                download={fileName}
              >
                <BoxedButton
                  variant="primary"
                  size="sm"
                  icon={<Download className="w-3.5 h-3.5" />}
                >
                  Download
                </BoxedButton>
              </a>
            )}

            <button
              onClick={onClose}
              className="p-1.5 border hover:opacity-80 transition-opacity ml-1"
              style={{ borderColor: 'var(--border-main)', color: 'var(--text-muted)' }}
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Viewer Body */}
        <div
          className="p-6 sm:p-8 overflow-y-auto flex-1 font-mono text-xs leading-relaxed"
          style={{
            backgroundColor: 'var(--bg-surface)',
            color: 'var(--text-main)'
          }}
        >
          {loading ? (
            <div className="py-20 text-center font-mono text-xs animate-pulse" style={{ color: 'var(--text-muted)' }}>
              Parsing document structure...
            </div>
          ) : (
            <div
              className="prose max-w-none text-xs leading-relaxed [&>h1]:text-base [&>h1]:font-bold [&>h1]:mb-2 [&>h2]:text-sm [&>h2]:font-bold [&>h2]:mb-2 [&>p]:mb-3 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:mb-3"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
          )}
        </div>

        {/* Footer info bar */}
        <div
          className="px-6 py-2.5 border-t flex items-center justify-between text-[10px] font-mono"
          style={{
            backgroundColor: 'var(--bg-canvas)',
            borderColor: 'var(--border-main)',
            color: 'var(--text-muted)'
          }}
        >
          <span>SPEC: DOCX / HTML / MARKDOWN</span>
          <span>PROTOCOL: AUTHORIZED ACCESS ONLY</span>
        </div>
      </div>
    </div>
  );
};

export default DocumentViewerModal;
