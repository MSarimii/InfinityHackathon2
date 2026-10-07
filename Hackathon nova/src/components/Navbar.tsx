/**
 * COMPONENT - Navigation Shell
 * File: src/components/Navbar.tsx
 *
 * Implements role-aware navigation, user badge, and quick demo switcher.
 * Uses custom high-contrast dark palette with vibrant emerald accents.
 */

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import {
  FolderKanban,
  Sparkles,
  Users,
  CheckCircle2,
  LogOut,
  ChevronDown,
  RotateCcw,
  Shield,
  Briefcase,
  Code2
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onResetDemo?: () => void;
}

const DEMO_ACCOUNTS = [
  { label: 'Admin (Overview & AI Creation)', email: 'admin@novaworks.example', role: 'ADMIN' },
  { label: 'Ayesha Khan (Web PM)', email: 'ayesha@novaworks.example', role: 'MANAGER' },
  { label: 'Bilal Ahmed (Mobile PM)', email: 'bilal@novaworks.example', role: 'MANAGER' },
  { label: 'Hina Malik (AI PM)', email: 'hina@novaworks.example', role: 'MANAGER' },
  { label: 'Ali Raza (React Full-Stack)', email: 'ali@novaworks.example', role: 'AGENT' },
  { label: 'Hamza Shah (Node & APIs)', email: 'hamza@novaworks.example', role: 'AGENT' },
  { label: 'Sara Noor (Flutter Mobile)', email: 'sara@novaworks.example', role: 'AGENT' },
  { label: 'Usman Tariq (Mobile Integration)', email: 'usman@novaworks.example', role: 'AGENT' },
  { label: 'Zain Abbas (LLM Prompts)', email: 'zain@novaworks.example', role: 'AGENT' },
  { label: 'Maryam Asif (Doc Processing)', email: 'maryam@novaworks.example', role: 'AGENT' }
];

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onSelectTab, onResetDemo }) => {
  const { user, logout, switchUser } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  if (!user) return null;

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-900/60 text-purple-300 border-purple-700/60';
      case 'MANAGER':
        return 'bg-sky-900/60 text-sky-300 border-sky-700/60';
      case 'AGENT':
      default:
        return 'bg-emerald-950/80 text-emerald-400 border-emerald-600/60';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <Shield className="w-3.5 h-3.5" />;
      case 'MANAGER':
        return <Briefcase className="w-3.5 h-3.5" />;
      case 'AGENT':
      default:
        return <Code2 className="w-3.5 h-3.5" />;
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0B1317]/95 backdrop-blur-md border-b border-[#1A2C30] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onSelectTab('projects')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20">
              NW
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight text-white">NovaWorks</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Infinity Hack ’26
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                AI Project Manager: Meeting to Execution • Lahore, PK
              </p>
            </div>
          </div>

          {/* Role-Specific Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1">
            {user.role === 'ADMIN' && (
              <>
                <button
                  onClick={() => onSelectTab('projects')}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 ${
                    currentTab === 'projects'
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-[#131E22]'
                  }`}
                >
                  <FolderKanban className="w-4 h-4" />
                  <span>Overview / Projects</span>
                </button>
                <button
                  onClick={() => onSelectTab('transcript')}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 ${
                    currentTab === 'transcript'
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-[#131E22]'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>Create from Transcript</span>
                </button>
                <button
                  onClick={() => onSelectTab('team')}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 ${
                    currentTab === 'team'
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-[#131E22]'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Team Directory</span>
                </button>
              </>
            )}

            {user.role === 'MANAGER' && (
              <>
                <button
                  onClick={() => onSelectTab('projects')}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 ${
                    currentTab === 'projects'
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-[#131E22]'
                  }`}
                >
                  <FolderKanban className="w-4 h-4" />
                  <span>My Managed Projects</span>
                </button>
                <button
                  onClick={() => onSelectTab('team')}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 ${
                    currentTab === 'team'
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-[#131E22]'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Team Directory</span>
                </button>
              </>
            )}

            {user.role === 'AGENT' && (
              <>
                <button
                  onClick={() => onSelectTab('tasks')}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 ${
                    currentTab === 'tasks'
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-[#131E22]'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>My Assigned Tasks</span>
                </button>
                <button
                  onClick={() => onSelectTab('projects')}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 ${
                    currentTab === 'projects'
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-[#131E22]'
                  }`}
                >
                  <FolderKanban className="w-4 h-4" />
                  <span>Project Overview</span>
                </button>
                <button
                  onClick={() => onSelectTab('team')}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 ${
                    currentTab === 'team'
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-[#131E22]'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Team</span>
                </button>
              </>
            )}
          </nav>

          {/* Right Header: Active Account, Switcher & Logout */}
          <div className="flex items-center space-x-3">
            {/* Quick Demo Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-[#131E22] hover:bg-[#1A2C30] border border-[#223B40] text-xs font-medium text-slate-200 transition-colors shadow-sm"
                title="Switch role account for demo testing"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="hidden sm:inline">Switch Demo Role</span>
                <span className="sm:hidden">Switch</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {dropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-72 rounded-xl bg-[#0F171C] border border-[#223B40] shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                  onMouseLeave={() => setDropdownOpen(false)}
                >
                  <div className="px-3 py-1.5 border-b border-[#1A2C30] text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Judge Evaluation Accounts
                  </div>
                  <div className="max-h-72 overflow-y-auto py-1">
                    {DEMO_ACCOUNTS.map(account => (
                      <button
                        key={account.email}
                        onClick={async () => {
                          setDropdownOpen(false);
                          await switchUser(account.email);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-[#16252A] transition-colors ${
                          user.email === account.email ? 'bg-emerald-500/15 text-emerald-300 font-semibold' : 'text-slate-300'
                        }`}
                      >
                        <div className="truncate">
                          <p className="truncate font-medium">{account.label}</p>
                          <p className="text-[10px] text-slate-500 truncate">{account.email}</p>
                        </div>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded border ml-2 ${getRoleBadge(account.role)}`}>
                          {account.role}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Current User Pill */}
            <div className="flex items-center space-x-2 pl-2 border-l border-[#1A2C30]">
              <div className="w-8 h-8 rounded-lg bg-[#16252A] border border-[#223B40] flex items-center justify-center font-bold text-xs text-emerald-400">
                {user.name.charAt(0)}
              </div>
              <div className="hidden lg:block text-left">
                <div className="flex items-center space-x-1.5">
                  <span className="text-xs font-semibold text-white leading-none">{user.name}</span>
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.2 rounded border ${getRoleBadge(
                      user.role
                    )}`}
                  >
                    {getRoleIcon(user.role)}
                    {user.role}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 leading-none">{user.specialization}</span>
              </div>
            </div>

            {/* Admin Reset Button */}
            {user.role === 'ADMIN' && onResetDemo && (
              <button
                onClick={onResetDemo}
                className="p-2 text-slate-400 hover:text-amber-400 hover:bg-[#131E22] rounded-lg transition-colors"
                title="Reset Database to Initial Clean State"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}

            {/* Logout Button */}
            <button
              onClick={logout}
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-[#131E22] rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
