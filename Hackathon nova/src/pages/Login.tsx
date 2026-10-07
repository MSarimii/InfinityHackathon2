/**
 * PAGE - Login Screen with 1-Click Demo Switcher
 * File: src/pages/Login.tsx
 *
 * Implements Section 14 & 15:
 * Simple login/logout using supplied demo accounts and instant 1-click presets for judges.
 */

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { Shield, Briefcase, Code2, ArrowRight, Lock, Mail, Sparkles, AlertCircle } from 'lucide-react';

const PRESET_USERS = [
  {
    name: 'Admin',
    email: 'admin@novaworks.example',
    role: 'ADMIN',
    desc: 'System Admin • Transcript Automation'
  },
  {
    name: 'Ayesha Khan',
    email: 'ayesha@novaworks.example',
    role: 'MANAGER',
    desc: 'Manager / Web PM • UrbanCart Project'
  },
  {
    name: 'Bilal Ahmed',
    email: 'bilal@novaworks.example',
    role: 'MANAGER',
    desc: 'Manager / Mobile PM • QuickServe App'
  },
  {
    name: 'Hina Malik',
    email: 'hina@novaworks.example',
    role: 'MANAGER',
    desc: 'Manager / AI PM • HelpDeskPro Assistant'
  },
  {
    name: 'Ali Raza',
    email: 'ali@novaworks.example',
    role: 'AGENT',
    desc: 'Developer • React & Frontend Integration'
  },
  {
    name: 'Hamza Shah',
    email: 'hamza@novaworks.example',
    role: 'AGENT',
    desc: 'Developer • Node.js, APIs (UrbanCart & QuickServe)'
  },
  {
    name: 'Sara Noor',
    email: 'sara@novaworks.example',
    role: 'AGENT',
    desc: 'Developer • Flutter & Mobile UI'
  }
];

export const Login: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@novaworks.example');
  const [password, setPassword] = useState('Demo123!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await login(email, password);
    if (!res.success) {
      setError(res.error || 'Invalid credentials');
    }
    setLoading(false);
  };

  const handleQuickLogin = async (userEmail: string) => {
    setEmail(userEmail);
    setPassword('Demo123!');
    setError(null);
    setLoading(true);
    const res = await login(userEmail, 'Demo123!');
    if (!res.success) {
      setError(res.error || 'Failed to authenticate');
    }
    setLoading(false);
  };

  const getRoleStyle = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'text-purple-300 bg-purple-950/60 border-purple-800/60';
      case 'MANAGER':
        return 'text-sky-300 bg-sky-950/60 border-sky-800/60';
      case 'AGENT':
      default:
        return 'text-emerald-400 bg-emerald-950/60 border-emerald-700/60';
    }
  };

  return (
    <div className="min-h-screen bg-[#070D10] flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-emerald-500 selection:text-black">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Brand Icon */}
        <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 items-center justify-center text-slate-950 font-black text-2xl shadow-xl shadow-emerald-500/20 mb-4">
          NW
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">NovaWorks Technologies</h2>
        <p className="mt-1 text-sm text-emerald-400 font-medium">
          Infinity Hack ’26 • AI Project Manager: Meeting to Execution
        </p>
        <p className="mt-0.5 text-xs text-slate-400">Lahore, Pakistan</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-[#0B1317] py-8 px-6 sm:px-10 shadow-2xl rounded-2xl border border-[#1A2C30]">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Work Email Address
              </label>
              <div className="mt-1.5 relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="name@novaworks.example"
                  className="block w-full pl-10 pr-4 py-2.5 bg-[#121E23] border border-[#223B40] rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Password
                </label>
                <span className="text-[11px] text-emerald-400 font-mono">Demo: Demo123!</span>
              </div>
              <div className="mt-1.5 relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="block w-full pl-10 pr-4 py-2.5 bg-[#121E23] border border-[#223B40] rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-2.5 px-4 rounded-xl shadow-lg shadow-emerald-500/20 text-sm font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <span className="inline-flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-slate-950" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Authenticating...
                </span>
              ) : (
                <span className="inline-flex items-center space-x-1.5">
                  <span>Sign In to CRM</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </span>
              )}
            </button>
          </form>

          {/* Hackathon Quick-Access Bar for Judges */}
          <div className="mt-8 pt-6 border-t border-[#1A2C30]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>1-Click Judge Demo Accounts</span>
              </span>
              <span className="text-[10px] text-slate-500">No manual typing needed</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PRESET_USERS.map(preset => (
                <button
                  key={preset.email}
                  type="button"
                  onClick={() => handleQuickLogin(preset.email)}
                  disabled={loading}
                  className="p-2.5 rounded-xl bg-[#121E23] hover:bg-[#18282E] border border-[#223B40] text-left transition-all group flex items-start justify-between cursor-pointer"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-xs font-semibold text-white group-hover:text-emerald-300 transition-colors truncate">
                        {preset.name}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">{preset.desc}</p>
                  </div>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ml-2 flex-shrink-0 ${getRoleStyle(
                      preset.role
                    )}`}
                  >
                    {preset.role}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
