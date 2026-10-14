'use client';

import React, { useState, useRef } from 'react';
import { DocumentItem, DocumentAttachment } from '@/lib/types';
import { useUser } from '@/context/UserContext';
import { 
  X, 
  Paperclip, 
  Download, 
  Upload, 
  File, 
  Image as ImageIcon, 
  FileText, 
  AlertCircle,
  Clock,
  User as UserIcon,
  Trash2
} from 'lucide-react';

interface AttachmentsDrawerProps {
  document: DocumentItem;
  isOpen: boolean;
  onClose: () => void;
  onDocumentUpdated: (doc: DocumentItem) => void;
  isReadOnly?: boolean;
}

export default function AttachmentsDrawer({
  document,
  isOpen,
  onClose,
  onDocumentUpdated,
  isReadOnly = false
}: AttachmentsDrawerProps) {
  const { currentUser } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];

    // Max 10MB
    if (file.size > 10 * 1024 * 1024) {
      setError("File exceeds 10MB limit.");
      return;
    }

    setLoading(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      try {
        const res = await fetch(`/api/documents/${document.id}/attachments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: file.name,
            size: file.size,
            type: file.type,
            dataUrl,
            userEmail: currentUser.email
          })
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to attach file");
        }

        onDocumentUpdated(data.doc);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };

    reader.onerror = () => {
      setError("Failed to read file.");
      setLoading(false);
    };

    reader.readAsDataURL(file);
  };

  const handleRemoveAttachment = async (attachmentId: string) => {
    if (!confirm("Are you sure you want to delete this attachment?")) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/documents/${document.id}/attachments`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attachmentId,
          userEmail: currentUser.email
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to remove attachment");
      onDocumentUpdated(data.doc);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon className="w-5 h-5 text-indigo-500" />;
    if (type.includes('pdf')) return <FileText className="w-5 h-5 text-rose-500" />;
    return <File className="w-5 h-5 text-slate-500" />;
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col z-10 animate-in slide-in-from-right duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Paperclip className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">Attachments</h3>
            <span className="text-xs bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-full">
              {document.attachments?.length || 0}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Upload button for editors */}
          {!isReadOnly ? (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileUpload}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                className="w-full py-4 border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-2xl flex flex-col items-center justify-center gap-2 bg-slate-50/50 hover:bg-indigo-50/20 transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-xl bg-white group-hover:bg-indigo-50 border border-slate-200 group-hover:border-indigo-200 flex items-center justify-center text-slate-500 group-hover:text-indigo-600 transition-colors shadow-xs">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-700 group-hover:text-indigo-600">
                    {loading ? 'Attaching file...' : 'Upload File Attachment'}
                  </p>
                  <p className="text-[11px] text-slate-400">PDF, images, documents up to 10MB</p>
                </div>
              </button>
            </div>
          ) : (
            <div className="p-3 text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-200 italic">
              Read-only mode: only editors can attach new files.
            </div>
          )}

          {/* List of attachments */}
          <div className="space-y-2 pt-2">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Attached Files:
            </h4>

            {(!document.attachments || document.attachments.length === 0) ? (
              <div className="text-center py-8 text-slate-400">
                <Paperclip className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-xs">No files attached to this document yet.</p>
              </div>
            ) : (
              document.attachments.map((att: DocumentAttachment) => (
                <div
                  key={att.id}
                  className="p-3 rounded-xl border border-slate-200 hover:border-slate-300 bg-white transition-all shadow-xs flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                      {getFileIcon(att.type)}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs font-semibold text-slate-800 truncate" title={att.name}>
                        {att.name}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                        <span>{formatSize(att.size)}</span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5">
                          <UserIcon className="w-3 h-3" />
                          {att.uploadedBy}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <a
                      href={att.dataUrl}
                      download={att.name}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 transition-colors cursor-pointer"
                      title="Download attachment"
                    >
                      <Download className="w-4 h-4" />
                    </a>

                    {!isReadOnly && (
                      <button
                        onClick={() => handleRemoveAttachment(att.id)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors cursor-pointer"
                        title="Delete attachment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
