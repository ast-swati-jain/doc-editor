'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useUser } from '@/context/UserContext';
import { 
  FileText, 
  Upload, 
  Plus, 
  Users, 
  ChevronDown, 
  Check, 
  Sparkles,
  Search,
  UserCheck
} from 'lucide-react';

interface NavbarProps {
  onNewDoc?: () => void;
  onImportClick?: () => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  isEditorPage?: boolean;
}

export default function Navbar({
  onNewDoc,
  onImportClick,
  searchQuery = '',
  onSearchChange,
  isEditorPage = false
}: NavbarProps) {
  const { currentUser, setCurrentUser, switchUserByEmail, allUsers } = useUser();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [customEmail, setCustomEmail] = useState('');

  const handleCustomSwitch = (e: React.FormEvent) => {
    e.preventDefault();
    if (customEmail.trim()) {
      switchUserByEmail(customEmail.trim());
      setCustomEmail('');
      setDropdownOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-sm shadow-indigo-200 transition-transform group-hover:scale-105">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-slate-900">Ajaia Docs</span>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                  AI-Native
                </span>
              </div>
              <p className="text-[11px] text-slate-500 -mt-0.5 hidden sm:block">
                Product Engineer Assessment · Swati Jain
              </p>
            </div>
          </Link>
        </div>

        {/* Search Bar (if on dashboard) */}
        {!isEditorPage && onSearchChange && (
          <div className="flex-1 max-w-md mx-4 hidden md:block">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search documents by title..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-slate-800 placeholder-slate-400"
              />
            </div>
          </div>
        )}

        {/* Action Controls & User Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {!isEditorPage && (
            <>
              {onImportClick && (
                <button
                  onClick={onImportClick}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-sm cursor-pointer"
                  title="Import .txt, .md, .html or .json file"
                >
                  <Upload className="w-4 h-4 text-slate-500" />
                  <span className="hidden sm:inline">Import File</span>
                </button>
              )}

              {onNewDoc && (
                <button
                  onClick={onNewDoc}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-100 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Doc</span>
                </button>
              )}
            </>
          )}

          {/* User Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all cursor-pointer text-left"
              title="Switch user to test role-based sharing & ownership"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-7 h-7 rounded-full bg-slate-200 border border-white shadow-xs"
              />
              <div className="hidden lg:block">
                <p className="text-xs font-semibold text-slate-800 leading-tight">
                  {currentUser.name}
                </p>
                <p className="text-[10px] text-slate-500 leading-tight truncate max-w-[120px]">
                  {currentUser.email}
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
            </button>

            {dropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setDropdownOpen(false)} 
                />
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3.5 py-2 border-b border-slate-100">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-indigo-500" />
                      Switch Acting User
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Select an account to test permissions &amp; &quot;Shared with me&quot;:
                    </p>
                  </div>

                  {/* Users list */}
                  <div className="p-1.5 space-y-1 max-h-56 overflow-y-auto">
                    {allUsers.map((u) => {
                      const isActive = u.email.toLowerCase() === currentUser.email.toLowerCase();
                      return (
                        <button
                          key={u.id}
                          onClick={() => {
                            setCurrentUser(u);
                            setDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-colors cursor-pointer ${
                            isActive
                              ? 'bg-indigo-50/80 text-indigo-950 font-medium'
                              : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 overflow-hidden">
                            <img
                              src={u.avatar}
                              alt={u.name}
                              className="w-8 h-8 rounded-full border border-slate-200 bg-white shrink-0"
                            />
                            <div className="overflow-hidden">
                              <p className="text-xs font-semibold flex items-center gap-1.5 truncate">
                                {u.name}
                                {u.id === 'usr_swati' && (
                                  <span className="text-[9px] bg-indigo-100 text-indigo-700 font-bold px-1.5 py-0.2 rounded shrink-0">
                                    Candidate
                                  </span>
                                )}
                              </p>
                              <p className="text-[10px] text-slate-500 truncate">{u.email}</p>
                            </div>
                          </div>
                          {isActive && <Check className="w-4 h-4 text-indigo-600 shrink-0 ml-2" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom email switch form */}
                  <div className="px-3 py-2 border-t border-slate-100 bg-slate-50/60">
                    <p className="text-[10px] font-semibold text-slate-500 mb-1.5">
                      Or switch to any custom email:
                    </p>
                    <form onSubmit={handleCustomSwitch} className="flex gap-1.5">
                      <input
                        type="email"
                        placeholder="e.g. sswati2003jain@gmail.com"
                        value={customEmail}
                        onChange={(e) => setCustomEmail(e.target.value)}
                        className="flex-1 px-2.5 py-1 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                      <button
                        type="submit"
                        className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shrink-0"
                      >
                        Act As
                      </button>
                    </form>
                  </div>

                  <div className="px-3.5 py-2 mt-1 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>Real-time switching updates all permissions instantly.</span>
                  </div>
                </div>
              </>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
