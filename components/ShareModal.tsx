'use client';

import React, { useState } from 'react';
import { DocumentItem, UserRole, SEEDED_USERS } from '@/lib/types';
import { useUser } from '@/context/UserContext';
import { 
  X, 
  UserPlus, 
  Eye, 
  Edit3, 
  Trash2, 
  Copy, 
  Check, 
  Lock,
  ArrowRight,
  Sparkles,
  Info
} from 'lucide-react';

interface ShareModalProps {
  document: DocumentItem;
  isOpen: boolean;
  onClose: () => void;
  onDocumentUpdated: (doc: DocumentItem) => void;
}

export default function ShareModal({
  document,
  isOpen,
  onClose,
  onDocumentUpdated
}: ShareModalProps) {
  const { currentUser, switchUserByEmail } = useUser();
  const [emailInput, setEmailInput] = useState('');
  const [roleInput, setRoleInput] = useState<UserRole>('editor');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [lastInvited, setLastInvited] = useState<string | null>(null);

  if (!isOpen) return null;

  const isOwner = document.ownerEmail.toLowerCase() === currentUser.email.toLowerCase();

  const handleShare = async (e?: React.FormEvent, quickEmail?: string, quickRole?: UserRole) => {
    if (e) e.preventDefault();
    const emailToShare = quickEmail || emailInput.trim();
    const roleToShare = quickRole || roleInput;

    if (!emailToShare) {
      setError("Please enter a valid email");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/documents/${document.id}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetEmail: emailToShare,
          role: roleToShare,
          userEmail: currentUser.email
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to share document");
      }

      onDocumentUpdated(data.doc);
      setLastInvited(emailToShare);
      setEmailInput('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCollaborator = async (targetEmail: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/documents/${document.id}/share`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetEmail,
          userEmail: currentUser.email
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to remove collaborator");
      }

      onDocumentUpdated(data.doc);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/document/${document.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="fixed inset-0" 
        onClick={onClose} 
      />
      
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-10 animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Share &quot;{document.title}&quot;</h3>
              <p className="text-xs text-slate-500">Manage who can view or edit this document</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
              {error}
            </div>
          )}

          {/* Instant test switcher banner after invite */}
          {lastInvited && (
            <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-indigo-950 animate-in fade-in">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Access granted to <strong>{lastInvited}</strong>!
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  switchUserByEmail(lastInvited);
                  onClose();
                }}
                className="px-3 py-1.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 shadow-xs"
              >
                <span>Act as {lastInvited.split('@')[0]}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Add collaborator form (only if owner) */}
          {isOwner ? (
            <form onSubmit={(e) => handleShare(e)} className="space-y-3">
              <label className="block text-xs font-semibold text-slate-700">
                Invite by Email:
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="colleague@ajaia.internal or gmail"
                  className="flex-1 px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-800"
                />
                <select
                  value={roleInput}
                  onChange={(e) => setRoleInput(e.target.value as UserRole)}
                  className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 cursor-pointer"
                >
                  <option value="editor">Editor (Can edit)</option>
                  <option value="viewer">Viewer (Read-only)</option>
                </select>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-xs cursor-pointer shrink-0"
                >
                  {loading ? 'Adding...' : 'Invite'}
                </button>
              </div>

              {/* Quick suggestions pills */}
              <div className="pt-1">
                <p className="text-[11px] font-medium text-slate-400 mb-1.5">Quick invite teammates:</p>
                <div className="flex flex-wrap gap-1.5">
                  {SEEDED_USERS.filter(u => u.email.toLowerCase() !== document.ownerEmail.toLowerCase()).map(u => {
                    const alreadyCollab = document.collaborators.some(c => c.email.toLowerCase() === u.email.toLowerCase());
                    return (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => handleShare(undefined, u.email, 'editor')}
                        disabled={alreadyCollab || loading}
                        className={`text-[11px] px-2.5 py-1 rounded-lg border flex items-center gap-1.5 transition-colors cursor-pointer ${
                          alreadyCollab
                            ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-default'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/50'
                        }`}
                      >
                        <img src={u.avatar} alt="" className="w-3.5 h-3.5 rounded-full" />
                        <span>{u.name}</span>
                        {alreadyCollab && <Check className="w-3 h-3 text-emerald-500" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </form>
          ) : (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2.5 text-xs text-amber-800">
              <Lock className="w-4 h-4 shrink-0 text-amber-600" />
              <span>Only the document owner ({document.ownerName}) can invite new collaborators.</span>
            </div>
          )}

          {/* People with access list */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              People with access ({document.collaborators.length + 1})
            </h4>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {/* Document Owner */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                    {document.ownerName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                      {document.ownerName}
                      <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-medium">
                        Owner
                      </span>
                    </p>
                    <p className="text-[11px] text-slate-500">{document.ownerEmail}</p>
                  </div>
                </div>
                <span className="text-xs text-slate-500 font-medium px-2 py-1">Full control</span>
              </div>

              {/* Collaborators */}
              {document.collaborators.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-2 text-center">
                  No other collaborators yet. Invite teammates above!
                </p>
              ) : (
                document.collaborators.map((c) => {
                  const userMatch = SEEDED_USERS.find(u => u.email.toLowerCase() === c.email.toLowerCase());
                  return (
                    <div
                      key={c.email}
                      className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={userMatch?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${c.name}`}
                          alt=""
                          className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-semibold text-slate-800">{c.name}</p>
                            <button
                              type="button"
                              onClick={() => {
                                switchUserByEmail(c.email, c.name);
                                onClose();
                              }}
                              className="text-[10px] text-indigo-600 hover:underline font-medium cursor-pointer"
                              title="Act as this user to test access"
                            >
                              (Act as {c.name.split(' ')[0]})
                            </button>
                          </div>
                          <p className="text-[11px] text-slate-500">{c.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isOwner ? (
                          <div className="flex items-center gap-1">
                            <select
                              value={c.role}
                              onChange={(e) => handleShare(undefined, c.email, e.target.value as UserRole)}
                              className="text-xs bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 text-slate-700 font-medium cursor-pointer"
                            >
                              <option value="editor">Editor</option>
                              <option value="viewer">Viewer</option>
                            </select>
                            <button
                              onClick={() => handleRemoveCollaborator(c.email)}
                              className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Remove collaborator"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                            c.role === 'editor'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}>
                            {c.role === 'editor' ? <Edit3 className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            {c.role === 'editor' ? 'Editor' : 'Viewer'}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Info note explaining simulated environment */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-500 flex items-start gap-2">
            <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-700">Simulated Testing Environment</p>
              <p>Per assessment specifications, external email servers are not used. Permissions are saved instantly in the database. Use <strong>Copy document link</strong> or the <strong>Act As</strong> button to test access immediately.</p>
            </div>
          </div>
        </div>

        {/* Footer with Copy Link */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-100">
          <button
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-indigo-600 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-600">Link copied to clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-500" />
                <span>Copy document link</span>
              </>
            )}
          </button>
          
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
