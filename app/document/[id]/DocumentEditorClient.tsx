'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import { DocumentItem } from '@/lib/types';
import QuillEditor from '@/components/QuillEditor';
import ShareModal from '@/components/ShareModal';
import AttachmentsDrawer from '@/components/AttachmentsDrawer';
import VersionsModal from '@/components/VersionsModal';
import { 
  ArrowLeft, 
  Share2, 
  Paperclip, 
  History, 
  Download, 
  Save, 
  Check, 
  Clock, 
  Eye, 
  Lock, 
  ChevronDown, 
  Sparkles, 
  FileText,
  FileCode,
  Printer,
  AlertCircle,
  X
} from 'lucide-react';

interface DocumentEditorClientProps {
  id: string;
}

export default function DocumentEditorClient({ id }: DocumentEditorClientProps) {
  const router = useRouter();
  const { currentUser, allUsers, setCurrentUser, switchUserByEmail } = useUser();
  const [customEmail, setCustomEmail] = useState('');

  const [doc, setDoc] = useState<DocumentItem | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [userRole, setUserRole] = useState<'owner' | 'editor' | 'viewer' | 'none'>('none');
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Modals
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isAttachmentsOpen, setIsAttachmentsOpen] = useState(false);
  const [isVersionsOpen, setIsVersionsOpen] = useState(false);

  // Debounce save ref
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialLoad = useRef(true);

  // Load document
  const loadDocument = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/documents/${id}?userEmail=${encodeURIComponent(currentUser.email)}`);
      if (!res.ok) {
        if (res.status === 404) {
          router.push('/');
          return;
        }
        throw new Error("Failed to load document");
      }

      const data = await res.json();
      setDoc(data.doc);
      setTitle(data.doc.title);
      setContent(data.doc.content || '');
      setUserRole(data.userRole);
      setLastSavedAt(new Date(data.doc.updatedAt));
      isInitialLoad.current = true;
    } catch (err) {
      console.error("Error loading document:", err);
    } finally {
      setLoading(false);
    }
  }, [id, currentUser.email, router]);

  useEffect(() => {
    loadDocument();
  }, [loadDocument]);

  // Save changes to API
  const persistChanges = async (
    newContent?: string, 
    newTitle?: string, 
    recordVersion: boolean = false
  ) => {
    if (userRole === 'viewer') return;

    setSaveStatus('saving');
    try {
      const res = await fetch(`/api/documents/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle !== undefined ? newTitle : title,
          content: newContent !== undefined ? newContent : content,
          userEmail: currentUser.email,
          recordVersion,
          versionSummary: recordVersion ? `Snapshot by ${currentUser.name}` : undefined
        })
      });

      if (res.ok) {
        const data = await res.json();
        setDoc(data.doc);
        setSaveStatus('saved');
        setLastSavedAt(new Date());
      } else {
        const data = await res.json();
        console.warn("Save warning:", data.error);
        setSaveStatus('unsaved');
      }
    } catch (err) {
      console.error("Autosave error:", err);
      setSaveStatus('unsaved');
    }
  };

  // Debounced auto-save on content change
  const handleContentChange = (newHtml: string) => {
    setContent(newHtml);

    if (userRole === 'viewer') return;

    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }

    setSaveStatus('unsaved');
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      persistChanges(newHtml, title);
    }, 1200);
  };

  // Title change
  const handleTitleBlur = () => {
    if (title.trim() === '') {
      setTitle(doc?.title || "Untitled Document");
      return;
    }
    if (title !== doc?.title) {
      persistChanges(content, title, true);
    }
  };

  // Delete attachment directly
  const handleDeleteAttachment = async (e: React.MouseEvent, attachmentId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Are you sure you want to remove this attachment?")) return;
    try {
      const res = await fetch(`/api/documents/${id}/attachments`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attachmentId,
          userEmail: currentUser.email
        })
      });
      const data = await res.json();
      if (res.ok && data.doc) {
        setDoc(data.doc);
      }
    } catch (err) {
      console.error("Failed to delete attachment:", err);
    }
  };

  // Keyboard shortcut Ctrl+S / Cmd+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        persistChanges(content, title, true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [content, title, userRole]);

  // Statistics calculation
  const getDocStats = () => {
    const cleanText = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    const words = cleanText ? cleanText.split(' ').length : 0;
    const chars = cleanText.length;
    const readingTimeMinutes = Math.ceil(words / 200);
    return { words, chars, readingTimeMinutes };
  };

  const { words, chars, readingTimeMinutes } = getDocStats();

  // Export handlers
  const handleExportMarkdown = () => {
    const header = `# ${title}\n\n`;
    let md = content
      .replace(/<h1>(.*?)<\/h1>/gi, '# $1\n\n')
      .replace(/<h2>(.*?)<\/h2>/gi, '## $1\n\n')
      .replace(/<h3>(.*?)<\/h3>/gi, '### $1\n\n')
      .replace(/<strong>(.*?)<\/strong>/gi, '**$1**')
      .replace(/<em>(.*?)<\/em>/gi, '*$1*')
      .replace(/<code>(.*?)<\/code>/gi, '`$1`')
      .replace(/<li>(.*?)<\/li>/gi, '- $1\n')
      .replace(/<p>(.*?)<\/p>/gi, '$1\n\n')
      .replace(/<[^>]*>/g, '');

    const blob = new Blob([header + md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.toLowerCase().replace(/[^a-z0-9]/gi, '_')}.md`;
    link.click();
    URL.revokeObjectURL(url);
    setExportOpen(false);
  };

  const handleExportHTML = () => {
    const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; line-height: 1.6; color: #1e293b; }
    h1 { border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  ${content}
</body>
</html>`;
    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.toLowerCase().replace(/[^a-z0-9]/gi, '_')}.html`;
    link.click();
    URL.revokeObjectURL(url);
    setExportOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-600">Loading document...</p>
        </div>
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-4 max-w-md">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-900">Document Not Found</h2>
          <p className="text-xs text-slate-500">This document may have been deleted or moved.</p>
          <Link
            href="/"
            className="inline-flex px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-xl"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const isReadOnly = userRole === 'viewer';

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      
      {/* Editor Top App Bar */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs">
        
        {/* Row 1: Back, Title, Autosave Status, and Action Buttons */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-3">
          
          {/* Left: Back & Title */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Link
              href="/"
              className="w-9 h-9 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 flex items-center justify-center text-slate-500 transition-colors shrink-0"
              title="Return to documents"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={handleTitleBlur}
                  onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                  disabled={isReadOnly}
                  placeholder="Untitled Document"
                  className="font-bold text-base sm:text-lg text-slate-900 bg-transparent hover:bg-slate-50 focus:bg-white px-2 py-0.5 rounded-lg border border-transparent hover:border-slate-200 focus:border-indigo-400 focus:outline-none transition-all truncate max-w-sm sm:max-w-md"
                />

                {/* Status pill badge */}
                {isReadOnly ? (
                  <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
                    <Lock className="w-3 h-3" />
                    Read Only
                  </span>
                ) : saveStatus === 'saving' ? (
                  <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-indigo-600 font-medium px-2 py-0.5 bg-indigo-50 rounded-md shrink-0">
                    <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                    Saving...
                  </span>
                ) : saveStatus === 'saved' ? (
                  <span className="hidden sm:inline-flex items-center gap-1 text-xs text-emerald-600 font-medium px-2 py-0.5 bg-emerald-50 rounded-md shrink-0" title={`Last saved: ${lastSavedAt?.toLocaleTimeString()}`}>
                    <Check className="w-3 h-3" />
                    Saved
                  </span>
                ) : (
                  <span className="hidden sm:inline-flex items-center gap-1 text-xs text-amber-600 font-medium px-2 py-0.5 bg-amber-50 rounded-md shrink-0">
                    Unsaved
                  </span>
                )}
              </div>

              {/* Breadcrumb info */}
              <div className="flex items-center gap-2 text-[11px] text-slate-400 pl-2">
                <span>By {doc.ownerName}</span>
                <span>•</span>
                <span>{words} words</span>
                <span>•</span>
                <span>{readingTimeMinutes} min read</span>
              </div>
            </div>
          </div>

          {/* Right: Actions, Share, Attachments, Versions, Export, User Switcher */}
          <div className="flex items-center gap-2 shrink-0">
            
            {/* Manual Save button (if editor) */}
            {!isReadOnly && (
              <button
                onClick={() => persistChanges(content, title, true)}
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                title="Create a version snapshot (Ctrl+S)"
              >
                <Save className="w-3.5 h-3.5 text-slate-500" />
                <span>Save Snapshot</span>
              </button>
            )}

            {/* Version History */}
            <button
              onClick={() => setIsVersionsOpen(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors cursor-pointer"
              title="Version History"
            >
              <History className="w-4 h-4 text-slate-500" />
              <span className="hidden lg:inline">History</span>
            </button>

            {/* Attachments */}
            <button
              onClick={() => setIsAttachmentsOpen(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors cursor-pointer relative"
              title="Document Attachments"
            >
              <Paperclip className="w-4 h-4 text-slate-500" />
              <span className="hidden lg:inline">Files</span>
              {doc.attachments?.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[9px] font-bold flex items-center justify-center -ml-0.5">
                  {doc.attachments.length}
                </span>
              )}
            </button>

            {/* Export Dropdown */}
            <div className="relative">
              <button
                onClick={() => setExportOpen(!exportOpen)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                title="Export Document"
              >
                <Download className="w-4 h-4 text-slate-500" />
                <span className="hidden lg:inline">Export</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {exportOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setExportOpen(false)} />
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-1">
                    <button
                      onClick={handleExportMarkdown}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors cursor-pointer text-left"
                    >
                      <FileCode className="w-4 h-4 text-slate-400" />
                      <span>Markdown (.md)</span>
                    </button>
                    <button
                      onClick={handleExportHTML}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors cursor-pointer text-left"
                    >
                      <FileText className="w-4 h-4 text-slate-400" />
                      <span>HTML (.html)</span>
                    </button>
                    <button
                      onClick={() => { window.print(); setExportOpen(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors cursor-pointer text-left border-t border-slate-100"
                    >
                      <Printer className="w-4 h-4 text-slate-400" />
                      <span>Print / PDF</span>
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Share Button */}
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>

            {/* User Switcher Dropdown */}
            <div className="relative border-l border-slate-200 pl-2">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-1.5 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                title={`Testing as: ${currentUser.name}`}
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-full border border-slate-200 bg-white"
                />
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {userDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setUserDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
                      Switch Role Context
                    </p>
                    <div className="space-y-1 max-h-52 overflow-y-auto">
                      {allUsers.map((u) => (
                        <button
                          key={u.id}
                          onClick={() => {
                            setCurrentUser(u);
                            setUserDropdownOpen(false);
                          }}
                          className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-left transition-colors cursor-pointer ${
                            u.email.toLowerCase() === currentUser.email.toLowerCase()
                              ? 'bg-indigo-50 text-indigo-950 font-medium'
                              : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <img src={u.avatar} alt="" className="w-6 h-6 rounded-full shrink-0" />
                          <div className="overflow-hidden">
                            <p className="text-xs font-semibold truncate">{u.name}</p>
                            <p className="text-[10px] text-slate-400 truncate">{u.email}</p>
                          </div>
                        </button>
                      ))}
                    </div>

                    <div className="pt-2 mt-1 border-t border-slate-100">
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (customEmail.trim()) {
                            switchUserByEmail(customEmail.trim());
                            setCustomEmail('');
                            setUserDropdownOpen(false);
                          }
                        }}
                        className="flex gap-1"
                      >
                        <input
                          type="email"
                          placeholder="Switch to email..."
                          value={customEmail}
                          onChange={(e) => setCustomEmail(e.target.value)}
                          className="flex-1 px-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        <button
                          type="submit"
                          className="px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shrink-0"
                        >
                          Act As
                        </button>
                      </form>
                    </div>
                  </div>
                </>
              )}
            </div>

          </div>
        </div>
      </header>

      {/* Read-Only Notice Banner */}
      {isReadOnly && (
        <div className="bg-amber-500/10 border-b border-amber-200 py-2.5 px-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between text-xs text-amber-900">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-amber-700 shrink-0" />
              <span>
                <strong>View-Only Mode:</strong> You are viewing this document with read-only access. You cannot make edits.
              </span>
            </div>
            <span className="text-amber-700 text-[11px] font-medium hidden sm:inline">
              Document owned by {doc.ownerName}
            </span>
          </div>
        </div>
      )}

      {/* Document Sheet Editor Canvas */}
      <main className="flex-1 py-6 px-4 flex flex-col items-center overflow-y-auto space-y-3">
        
        {/* On-screen Attached Files Bar */}
        {doc.attachments && doc.attachments.length > 0 && (
          <div className="w-full max-w-4xl bg-white border border-slate-200 rounded-xl px-4 py-2.5 shadow-xs flex items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-2 overflow-x-auto py-0.5 min-w-0">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 shrink-0">
                <Paperclip className="w-3.5 h-3.5 text-indigo-600" />
                Attachments ({doc.attachments.length}):
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                {doc.attachments.map((att) => (
                  <div key={att.id} className="inline-flex items-center bg-slate-50 hover:bg-indigo-50/50 border border-slate-200 rounded-lg pr-1.5 transition-colors group shadow-2xs">
                    <a
                      href={att.dataUrl}
                      download={att.name}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-700 hover:text-indigo-600 transition-colors cursor-pointer"
                      title={`Click to download ${att.name}`}
                    >
                      <FileText className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 shrink-0" />
                      <span className="font-semibold text-slate-800 group-hover:text-indigo-600 max-w-[160px] truncate">{att.name}</span>
                      <span className="text-[10px] text-slate-400">({(att.size / 1024).toFixed(0)} KB)</span>
                      <Download className="w-3 h-3 text-slate-400 group-hover:text-indigo-600 shrink-0 ml-0.5" />
                    </a>
                    {!isReadOnly && (
                      <button
                        onClick={(e) => handleDeleteAttachment(e, att.id)}
                        className="w-5 h-5 rounded hover:bg-rose-100 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-colors cursor-pointer ml-0.5"
                        title="Delete attachment"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setIsAttachmentsOpen(true)}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline shrink-0 cursor-pointer ml-2"
            >
              + Add / Manage
            </button>
          </div>
        )}

        <div className="w-full max-w-4xl doc-sheet rounded-xl overflow-hidden bg-white min-h-[900px] flex flex-col">
          <QuillEditor
            value={content}
            onChange={handleContentChange}
            readOnly={isReadOnly}
            placeholder="Type your document content here..."
          />
        </div>
      </main>

      {/* Share Modal */}
      {isShareModalOpen && (
        <ShareModal
          document={doc}
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          onDocumentUpdated={(updated) => {
            setDoc(updated);
            const emailLower = currentUser.email.toLowerCase();
            if (updated.ownerEmail.toLowerCase() === emailLower) {
              setUserRole('owner');
            } else {
              const collab = updated.collaborators.find(c => c.email.toLowerCase() === emailLower);
              setUserRole(collab ? collab.role : 'none');
            }
          }}
        />
      )}

      {/* Attachments Drawer */}
      <AttachmentsDrawer
        document={doc}
        isOpen={isAttachmentsOpen}
        onClose={() => setIsAttachmentsOpen(false)}
        onDocumentUpdated={(updated) => setDoc(updated)}
        isReadOnly={isReadOnly}
      />

      {/* Versions Modal */}
      <VersionsModal
        document={doc}
        isOpen={isVersionsOpen}
        onClose={() => setIsVersionsOpen(false)}
        onDocumentUpdated={(updated) => {
          setDoc(updated);
          setContent(updated.content);
          setTitle(updated.title);
        }}
        isReadOnly={isReadOnly}
      />

    </div>
  );
}
