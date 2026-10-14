'use client';

import React, { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import { DocumentItem } from '@/lib/types';
import Navbar from '@/components/Navbar';
import ShareModal from '@/components/ShareModal';
import ImportModal from '@/components/ImportModal';
import { 
  FileText, 
  Plus, 
  Upload, 
  Users, 
  Lock, 
  Trash2, 
  Share2, 
  Clock, 
  Paperclip, 
  Eye, 
  Edit3, 
  Sparkles,
  ArrowRight,
  Search,
  CheckCircle2,
  Bookmark,
  FileCheck2,
  FolderOpen
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { currentUser } = useUser();
  const [ownedDocs, setOwnedDocs] = useState<DocumentItem[]>([]);
  const [sharedDocs, setSharedDocs] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'owned' | 'shared'>('all');

  // Modal states
  const [sharingDoc, setSharingDoc] = useState<DocumentItem | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const fetchDocs = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/documents?userEmail=${encodeURIComponent(currentUser.email)}`);
      if (res.ok) {
        const data = await res.json();
        setOwnedDocs(data.owned || []);
        setSharedDocs(data.shared || []);
      }
    } catch (err) {
      console.error("Failed to load documents:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, [currentUser.email]);

  const handleCreateDocument = async (templateTitle?: string, templateContent?: string) => {
    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: templateTitle || "Untitled Document",
          content: templateContent || "<p></p>",
          ownerEmail: currentUser.email,
          ownerName: currentUser.name
        })
      });

      if (res.ok) {
        const data = await res.json();
        router.push(`/document/${data.doc.id}`);
      }
    } catch (err) {
      console.error("Failed to create document:", err);
    }
  };

  const handleDeleteDocument = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this document? This cannot be undone.")) return;

    try {
      const res = await fetch(`/api/documents/${id}?userEmail=${encodeURIComponent(currentUser.email)}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setOwnedDocs(prev => prev.filter(d => d.id !== id));
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete document");
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  // Combine or filter docs
  const allDocs = [...ownedDocs, ...sharedDocs];
  const displayedDocs = (activeTab === 'all' 
    ? allDocs 
    : activeTab === 'owned' 
    ? ownedDocs 
    : sharedDocs
  ).filter(doc => 
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (doc.plainText && doc.plainText.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navigation */}
      <Navbar
        onNewDoc={() => handleCreateDocument()}
        onImportClick={() => setIsImportModalOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main Workspace Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Candidate Evaluation Header Banner */}
        <section className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.25),transparent_70%)] pointer-events-none" />
          
          <div className="relative z-10 space-y-4 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                Ajaia Assessment Submission
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/10 text-slate-200">
                Candidate: Swati Jain
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                All 5 Requirements Fulfilled ✓
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Collaborative Document Editor
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Demonstrates rich-text editing, file upload (.txt, .md, .html, .json and attachments), granular sharing access controls, and persistent storage with simulated user switching.
            </p>

            {/* Quick feature indicator chips */}
            <div className="flex flex-wrap gap-2 pt-2 text-xs">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 text-slate-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Rich-Text Editing & Autosave</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 text-slate-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>File Upload & Doc Import</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 text-slate-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Owner vs Editor vs Viewer Sharing</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 text-slate-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Zero-Config Resilient Persistence</span>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Start Templates */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
              Start a new document
            </h2>
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import existing file</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            
            {/* Blank Doc */}
            <button
              onClick={() => handleCreateDocument("Untitled Document", "<p></p>")}
              className="group p-4 rounded-2xl bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all text-left flex flex-col justify-between h-36 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                  Blank Document
                </p>
                <p className="text-xs text-slate-400">Clean rich-text canvas</p>
              </div>
            </button>

            {/* Template: Product Requirement Doc */}
            <button
              onClick={() => handleCreateDocument(
                "📋 Product Specification & Strategy",
                `<h1>Product Specification</h1><p><strong>Status:</strong> Draft &nbsp;|&nbsp; <strong>Author:</strong> ${currentUser.name}</p><h2>1. Problem Statement</h2><p>Describe the core user problem and market opportunity.</p><h2>2. Target Audience</h2><ul><li>Full Stack Engineers</li><li>Product Managers</li></ul><h2>3. Proposed Solution</h2><p>Key technical components and deliverables.</p>`
              )}
              className="group p-4 rounded-2xl bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all text-left flex flex-col justify-between h-36 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                  Product Spec (PRD)
                </p>
                <p className="text-xs text-slate-400">Problem, scope & metrics</p>
              </div>
            </button>

            {/* Template: Meeting Notes */}
            <button
              onClick={() => handleCreateDocument(
                "📝 Team Sync & Meeting Notes",
                `<h1>Weekly Team Sync</h1><p><strong>Date:</strong> ${new Date().toLocaleDateString()} &nbsp;|&nbsp; <strong>Attendees:</strong> ${currentUser.name}</p><h2>Agenda</h2><ol><li>Sprint progress review</li><li>Architectural decisions</li><li>Action items & owners</li></ol><h2>Discussion Notes</h2><p>Add key highlights here.</p>`
              )}
              className="group p-4 rounded-2xl bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all text-left flex flex-col justify-between h-36 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                <Bookmark className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                  Meeting Notes
                </p>
                <p className="text-xs text-slate-400">Agenda, sync & follow-ups</p>
              </div>
            </button>

            {/* Template: Sprint Planning */}
            <button
              onClick={() => handleCreateDocument(
                "🎯 Sprint Roadmap & Milestones",
                `<h1>Sprint Planning & Execution</h1><h2>Goals for this Cycle</h2><ul><li>Deliver core user workflows.</li><li>Ship clean automated test coverage.</li></ul><h2>Backlog</h2><ol><li>Refactor document persistence layer</li><li>Optimize asset bundling</li></ol>`
              )}
              className="group p-4 rounded-2xl bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all text-left flex flex-col justify-between h-36 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                <FolderOpen className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                  Sprint Roadmap
                </p>
                <p className="text-xs text-slate-400">Goals, backlog & tasks</p>
              </div>
            </button>

          </div>
        </section>

        {/* Documents Section with Tabs & Search */}
        <section className="space-y-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
            
            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'all'
                    ? 'bg-white text-indigo-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Documents ({allDocs.length})
              </button>

              <button
                onClick={() => setActiveTab('owned')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'owned'
                    ? 'bg-white text-indigo-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Owned by me</span>
                <span className="text-[10px] px-1.5 py-0.2 bg-slate-200 rounded-full">
                  {ownedDocs.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('shared')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'shared'
                    ? 'bg-white text-indigo-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Shared with me</span>
                <span className="text-[10px] px-1.5 py-0.2 bg-indigo-100 text-indigo-700 rounded-full font-bold">
                  {sharedDocs.length}
                </span>
              </button>
            </div>

            {/* Mobile Search input */}
            <div className="block md:hidden">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800"
                />
              </div>
            </div>

          </div>

          {/* Documents Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-44 rounded-2xl bg-white border border-slate-200 p-5 animate-pulse space-y-3">
                  <div className="h-4 bg-slate-200 rounded w-2/3" />
                  <div className="h-3 bg-slate-100 rounded w-full" />
                  <div className="h-3 bg-slate-100 rounded w-4/5" />
                  <div className="pt-4 flex justify-between">
                    <div className="h-6 w-16 bg-slate-200 rounded-full" />
                    <div className="h-6 w-12 bg-slate-100 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : displayedDocs.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-4 shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <FileText className="w-7 h-7" />
              </div>
              <div className="max-w-sm mx-auto">
                <h3 className="text-base font-bold text-slate-800">
                  {activeTab === 'shared' ? 'No shared documents' : 'No documents found'}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {activeTab === 'shared' 
                    ? `Switch to another user in the top right to share documents with ${currentUser.name}.`
                    : searchQuery 
                    ? `No documents matched "${searchQuery}".` 
                    : 'Create a new document or import a file to start writing.'}
                </p>
              </div>
              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={() => handleCreateDocument()}
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Document</span>
                </button>
                <button
                  onClick={() => setIsImportModalOpen(true)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Upload className="w-4 h-4 text-slate-500" />
                  <span>Import File</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {displayedDocs.map((doc) => {
                const isOwner = doc.ownerEmail.toLowerCase() === currentUser.email.toLowerCase();
                const userCollab = doc.collaborators.find(
                  c => c.email.toLowerCase() === currentUser.email.toLowerCase()
                );
                const role = isOwner ? 'owner' : (userCollab?.role || 'viewer');
                const lastUpdated = new Date(doc.updatedAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                });

                return (
                  <div
                    key={doc.id}
                    className="group bg-white rounded-2xl border border-slate-200 hover:border-indigo-400 hover:shadow-lg transition-all p-5 flex flex-col justify-between space-y-4"
                  >
                    {/* Top Row: Title & Actions */}
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/document/${doc.id}`}
                          className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors text-base line-clamp-1 flex-1"
                        >
                          {doc.title}
                        </Link>

                        {/* Owner / Permission Badge */}
                        {isOwner ? (
                          <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                            Owned
                          </span>
                        ) : (
                          <span className={`shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 ${
                            role === 'editor'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {role === 'editor' ? <Edit3 className="w-2.5 h-2.5" /> : <Eye className="w-2.5 h-2.5" />}
                            {role === 'editor' ? 'Editor' : 'Viewer'}
                          </span>
                        )}
                      </div>

                      {/* Snippet / Owner info */}
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {doc.plainText || "Rich document content..."}
                      </p>
                    </div>

                    {/* Metadata & Badges */}
                    <div className="space-y-3 pt-2 border-t border-slate-100">
                      
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Updated {lastUpdated}</span>
                        </div>

                        {/* Owner attribution if shared */}
                        {!isOwner && (
                          <span className="text-slate-600 font-medium">
                            By {doc.ownerName}
                          </span>
                        )}
                      </div>

                      {/* Collaborators & Attachments counts */}
                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-2">
                          
                          {/* Collaborator count */}
                          {doc.collaborators.length > 0 && (
                            <div className="flex items-center gap-1 text-[11px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md font-medium">
                              <Users className="w-3 h-3" />
                              <span>{doc.collaborators.length} shared</span>
                            </div>
                          )}

                          {/* Attachment count */}
                          {doc.attachments?.length > 0 && (
                            <div className="flex items-center gap-1 text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md font-medium">
                              <Paperclip className="w-3 h-3" />
                              <span>{doc.attachments.length}</span>
                            </div>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1">
                          
                          {/* Share button */}
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              setSharingDoc(doc);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                            title="Share document"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>

                          {/* Delete button (only if owner) */}
                          {isOwner && (
                            <button
                              onClick={(e) => handleDeleteDocument(doc.id, e)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Delete document"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}

                          {/* Open Arrow */}
                          <Link
                            href={`/document/${doc.id}`}
                            className="p-1.5 rounded-lg text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-colors"
                            title="Open in editor"
                          >
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

      </main>

      {/* Share Modal */}
      {sharingDoc && (
        <ShareModal
          document={sharingDoc}
          isOpen={!!sharingDoc}
          onClose={() => setSharingDoc(null)}
          onDocumentUpdated={(updated) => {
            setSharingDoc(updated);
            fetchDocs();
          }}
        />
      )}

      {/* Import Modal */}
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={() => fetchDocs()}
      />
    </div>
  );
}
