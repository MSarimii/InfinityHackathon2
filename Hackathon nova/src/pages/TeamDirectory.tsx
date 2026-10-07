/**
 * PAGE - Team Directory View
 * File: src/pages/TeamDirectory.tsx
 *
 * Implements Section 14 (Team Directory):
 * Read-only directory showing names, roles, specializations, and skills
 * for NovaWorks Technologies staff.
 */

import React, { useEffect, useState } from 'react';
import { TeamMemberDto } from '../../shared/api-contracts.ts';
import { api } from '../services/api.ts';
import { Users, Shield, Briefcase, Code2, Search, Mail, Sparkles } from 'lucide-react';

export const TeamDirectory: React.FC = () => {
  const [team, setTeam] = useState<TeamMemberDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    setLoading(true);
    const res = await api.getTeam();
    if (res.success && res.data) {
      setTeam(res.data);
    }
    setLoading(false);
  };

  const filteredTeam = team.filter(member => {
    const matchesRole = filterRole === 'ALL' || member.role === filterRole;
    const matchesSearch =
      search === '' ||
      member.name.toLowerCase().includes(search.toLowerCase()) ||
      member.specialization.toLowerCase().includes(search.toLowerCase()) ||
      member.skills.some(s => s.toLowerCase().includes(search.toLowerCase()));
    return matchesRole && matchesSearch;
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-950/70 text-purple-300 border-purple-700/60';
      case 'MANAGER':
        return 'bg-sky-950/70 text-sky-300 border-sky-700/60';
      case 'AGENT':
      default:
        return 'bg-emerald-950/70 text-emerald-300 border-emerald-700/60';
    }
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" />
            <span>Company Directory</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            NovaWorks Staff & Resource Roster
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Read-only directory supplied to the AI parser for managerial matching and developer assignments.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search name or skill..."
            className="w-full pl-10 pr-4 py-2 bg-[#0B1317] border border-[#1A2C30] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
        </div>
      </div>

      {/* Role Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-[#1A2C30] pb-3 text-xs">
        {['ALL', 'ADMIN', 'MANAGER', 'AGENT'].map(role => (
          <button
            key={role}
            onClick={() => setFilterRole(role)}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              filterRole === role
                ? 'bg-emerald-400 text-slate-950'
                : 'text-slate-400 hover:text-white hover:bg-[#121E23]'
            }`}
          >
            {role === 'ALL' ? 'All Staff (10)' : `${role}s`}
          </button>
        ))}
      </div>

      {/* Team Cards Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400 mb-3"></div>
          <p className="text-sm">Loading company directory...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTeam.map(member => (
            <div
              key={member.id}
              className="bg-[#0B1317] border border-[#1A2C30] rounded-2xl p-5 shadow-lg space-y-4 hover:border-[#223B40] transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-[#121E23] border border-[#223B40] flex items-center justify-center font-bold text-sm text-emerald-400">
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">{member.name}</h3>
                    <p className="text-xs text-slate-400">{member.specialization}</p>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${getRoleBadge(
                    member.role
                  )}`}
                >
                  {member.role}
                </span>
              </div>

              <div className="text-xs text-slate-400 flex items-center space-x-1.5 truncate">
                <Mail className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                <span className="truncate font-mono text-[11px]">{member.email}</span>
              </div>

              <div className="pt-2 border-t border-[#16252A]">
                <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider block mb-1.5">
                  Skills & Domain Capabilities
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {member.skills.map((skill, i) => (
                    <span
                      key={i}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-[#121E23] text-slate-300 border border-[#223B40]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
