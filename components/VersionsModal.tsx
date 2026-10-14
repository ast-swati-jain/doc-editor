'use client';

import React, { useState } from 'react';
import { DocumentItem, DocumentVersion } from '@/lib/types';
import { useUser } from '@/context/UserContext';
import { 
  X, 
  History, 
  RotateCcw, 
  Clock, 
  User as UserIcon, 
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface VersionsModalProps {
  document: DocumentItem;
  isOpen: boolean;
  onClose: () => void;
  onDocumentUpdated: (doc: DocumentItem) => void;
  isReadOnly?: boolean;
}

export default function VersionsModal({
  document,
  isOpen,
  onClose,
  onDocumentUpdated,
  isReadOnly = false
}: VersionsModalProps) {
  const { currentUser } = useUser();
  const [selectedVersion, setSelectedVersion] = useState<DocumentVersion | null>(
    document.versions?.[0] || null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRestore = async (versionId: string) => {
    if (!confirm("Are you sure you want to restore this version? Your current document will be replaced with this version.")) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/documents/${document.id}/versions/restore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          versionId,
          userEmail: currentUser.email
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to restore version");
      }

      onDocumentUpdated(data.doc);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-10 flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Version History</h3>
              <p className="text-xs text-slate-500">View and restore previous document snapshots</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="m-6 mb-0 p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Body with two columns: Version list & Version preview */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200">
          
          {/* Version List */}
          <div className="p-4 overflow-y-auto space-y-2 max-h-[400px] md:max-h-[500px]">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1 mb-2">
              Snapshots ({document.versions?.length || 0})
            </p>

            {(!document.versions || document.versions.length === 0) ? (
              <p className="text-xs text-slate-400 italic p-3 text-center">No snapshots recorded yet.</p>
            ) : (
              document.versions.map((v, index) => {
                const isSelected = selectedVersion?.id === v.id;
                const formattedDate = new Date(v.createdAt).toLocaleString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                });

                return (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVersion(v)}
                    className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50/80 border-indigo-200 text-indigo-950 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold">{v.summary || `Version ${document.versions.length - index}`}</span>
                      {index === 0 && (
                        <span className="text-[9px] bg-indigo-100 text-indigo-700 font-bold px-1.5 py-0.2 rounded">
                          Current
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{formattedDate}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                      <UserIcon className="w-3 h-3" />
                      <span>{v.createdBy}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Version Preview */}
          <div className="p-6 md:col-span-2 overflow-y-auto max-h-[400px] md:max-h-[500px] flex flex-col justify-between bg-slate-50/40">
            {selectedVersion ? (
              <div>
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200">
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">{selectedVersion.title}</h4>
                    <p className="text-xs text-slate-500">
                      Saved by {selectedVersion.createdBy} on {new Date(selectedVersion.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {!isReadOnly && (
                    <button
                      onClick={() => handleRestore(selectedVersion.id)}
                      disabled={loading}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{loading ? 'Restoring...' : 'Restore'}</span>
                    </button>
                  )}
                </div>

                <div 
                  className="prose prose-sm max-w-none p-4 bg-white rounded-xl border border-slate-200 text-slate-800 leading-relaxed min-h-[250px]"
                  dangerouslySetInnerHTML={{ __html: selectedVersion.content || '<p class="italic text-slate-400">Empty content</p>' }}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 text-xs">
                Select a version from the left panel to preview
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-3 bg-slate-50 border-t border-slate-100">
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
