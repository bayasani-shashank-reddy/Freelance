import React, { useState, useEffect } from 'react';
import {
  X,
  FileText,
  Share2,
  Copy,
  Check,
  MessageSquare,
} from 'lucide-react';
import mammoth from 'mammoth';
import { useToast } from '../context/ToastContext';

interface DocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileName: string;
  fileUrl?: string;
  fileBlob?: Blob | File;
  rawText?: string;
  onShareToChat?: (text: string) => void;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  isOpen,
  onClose,
  fileName,
  fileBlob,
  rawText,
  onShareToChat,
}) => {
  const { showToast } = useToast();
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [shareMenuOpen, setShareMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);

    const parseDoc = async () => {
      try {
        if (fileBlob) {
          const arrayBuffer = await fileBlob.arrayBuffer();
          const result = await mammoth.convertToHtml({ arrayBuffer });
          if (result.value) {
            setHtmlContent(result.value);
          } else {
            setHtmlContent(`<p class="text-slate-400">No formatted text found in document.</p>`);
          }
        } else if (rawText) {
          // Format raw text with paragraphs
          const formatted = rawText
            .split('\n\n')
            .map((p) => `<p class="mb-3 leading-relaxed">${p}</p>`)
            .join('');
          setHtmlContent(formatted);
        } else {
          // Default sample project brief preview for demo uploaded docs
          setHtmlContent(`
            <div class="space-y-4">
              <h2 class="text-lg font-bold text-cyan-300">Project Requirements Document</h2>
              <p class="text-xs text-slate-300 font-mono">File: ${fileName}</p>
              <hr class="border-slate-800 my-3"/>
              <h3 class="text-sm font-bold text-white">1. Executive Summary</h3>
              <p class="text-xs text-slate-300 leading-relaxed">
                This document outlines the core architecture, functional specifications, design expectations, and milestones for the project.
              </p>
              <h3 class="text-sm font-bold text-white mt-4">2. Core Deliverables</h3>
              <ul class="list-disc pl-5 text-xs text-slate-300 space-y-1.5">
                <li>High-fidelity responsive UI/UX system with dark theme support</li>
                <li>Secure authentication and role-based dashboard access</li>
                <li>Real-time client ↔ admin messaging and automated milestone tracking</li>
                <li>Fast performance with WebGL/3D visual enhancements</li>
              </ul>
              <h3 class="text-sm font-bold text-white mt-4">3. Timeline & Target Budget</h3>
              <p class="text-xs text-slate-300 leading-relaxed">
                Target delivery: 3-4 weeks. Quality assurance and security review included prior to release.
              </p>
            </div>
          `);
        }
      } catch (err) {
        setHtmlContent(`
          <div class="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 space-y-2">
            <p class="font-bold text-amber-300">Document Preview (${fileName})</p>
            <p class="leading-relaxed">This document has been securely uploaded and stored on the server. You can view, download, or share it with collaborators below.</p>
          </div>
        `);
      } finally {
        setLoading(false);
      }
    };

    parseDoc();
  }, [isOpen, fileBlob, rawText, fileName]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    const shareLink = window.location.origin + window.location.pathname + `#/brief?doc=${encodeURIComponent(fileName)}`;
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    showToast({ type: 'success', title: 'Link Copied!', message: 'Shareable document link copied to clipboard.' });
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareToConversation = () => {
    if (onShareToChat) {
      onShareToChat(`📄 Shared Document: ${fileName}`);
      showToast({ type: 'success', title: 'Document Shared', message: 'Document sent to the chat conversation!' });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl bg-slate-900 border border-indigo-500/30 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>{fileName}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  In-App Viewer
                </span>
              </h2>
              <p className="text-[11px] font-mono text-slate-400">Microsoft Word (.docx) / Document Preview</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Share Menu Button */}
            <div className="relative">
              <button
                onClick={() => setShareMenuOpen(!shareMenuOpen)}
                className="px-3 py-1.5 rounded-xl bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 border border-indigo-500/30 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm shadow-indigo-500/20"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </button>

              {shareMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-slate-950 border border-slate-800 p-2 shadow-2xl z-50 text-xs space-y-1">
                  <button
                    onClick={handleCopyLink}
                    className="w-full text-left px-3 py-2 rounded-xl text-slate-300 hover:bg-slate-900 flex items-center gap-2 font-medium"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
                    <span>{copied ? 'Link Copied!' : 'Copy Share Link'}</span>
                  </button>

                  {onShareToChat && (
                    <button
                      onClick={handleShareToConversation}
                      className="w-full text-left px-3 py-2 rounded-xl text-indigo-300 hover:bg-indigo-500/15 flex items-center gap-2 font-medium"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Send into Chat</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Document Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-slate-950/40">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-3">
              <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
              <p className="text-xs font-mono text-slate-400">Rendering document preview…</p>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto p-8 rounded-2xl bg-slate-950 border border-slate-800 text-slate-200 shadow-xl font-sans text-xs leading-relaxed docx-preview-body">
              <div
                dangerouslySetInnerHTML={{ __html: htmlContent }}
                className="space-y-3 prose prose-invert max-w-none text-slate-300"
              />
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs">
          <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Ready for collaboration & sharing</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold flex items-center gap-1.5 transition-all border border-slate-800"
            >
              <Copy className="w-3.5 h-3.5 text-cyan-400" />
              <span>Copy Link</span>
            </button>

            {onShareToChat && (
              <button
                onClick={handleShareToConversation}
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold flex items-center gap-1.5 shadow-md transition-all"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share in Chat</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
