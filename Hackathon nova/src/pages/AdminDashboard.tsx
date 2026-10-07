/**
 * PAGE - Admin Dashboard & Project Overview
 * File: src/pages/AdminDashboard.tsx
 *
 * Implements Section 14 (Admin Home):
 * Metric cards, project cards grid, and CTA to Create from Transcript.
 */

import React, { useEffect, useState } from 'react';
import { ProjectDto } from '../../shared/api-contracts.ts';
import { api } from '../services/api.ts';
import {
  FolderKanban,
  Sparkles,
  Calendar,
  Clock,
  CheckCircle2,
  Users,
  ArrowRight,
  UserCheck,
  Building2
} from 'lucide-react';

interface AdminDashboardProps {
  onNavigateToTranscript: () => void;
  onSelectProject: (projectId: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onNavigateToTranscript,
  onSelectProject
}) => {
  const [projects, setProjects] = useState<ProjectDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    const res = await api.getProjects();
    if (res.success && res.data) {
      setProjects(res.data);
    } else {
      setError(res.error || 'Failed to load projects');
    }
    setLoading(false);
  };

  const totalTasks = projects.reduce((acc, p) => acc + p.taskCount, 0);
  const totalHours = projects.reduce((acc, p) => acc + p.totalEstimatedHours, 0);

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Top Banner & Heading */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            NovaWorks Project Management
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Lahore Client Engagements & AI Sprint Delivery Overview
          </p>
        </div>

        <button
          onClick={onNavigateToTranscript}
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all cursor-pointer transform hover:-translate-y-0.5"
        >
          <Sparkles className="w-4 h-4" />
          <span>Create from Transcript</span>
        </button>
      </div>

      {/* Metrics Summary Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0B1317] border border-[#1A2C30] rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Active Projects
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <FolderKanban className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-black text-white">{projects.length}</p>
          <p className="mt-1 text-xs text-slate-400">Client-commissioned scopes</p>
        </div>

        <div className="bg-[#0B1317] border border-[#1A2C30] rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Identified Tasks
            </span>
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-black text-white">{totalTasks}</p>
          <p className="mt-1 text-xs text-slate-400">Assigned developer units</p>
        </div>

        <div className="bg-[#0B1317] border border-[#1A2C30] rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Planned Effort
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-black text-white">{totalHours} <span className="text-sm font-normal text-slate-400">hrs</span></p>
          <p className="mt-1 text-xs text-slate-400">Total estimated engineering</p>
        </div>

        <div className="bg-[#0B1317] border border-[#1A2C30] rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Team Directory
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-black text-white">10</p>
          <p className="mt-1 text-xs text-slate-400">1 Admin, 3 PMs, 6 Developers</p>
        </div>
      </div>

      {/* Action Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0F1C20] via-[#0E2422] to-[#0A1A18] border border-emerald-500/30 p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Meeting-to-Execution Pipeline</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Transform Raw Dialogue into Verified Projects & Tasks
          </h2>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            Paste client planning transcripts directly into the NovaWorks domain engine. The AI parser extracts deliverables, assigns permitted team members, validates all business deadlines, and atomically saves records to the database.
          </p>
          <div className="mt-5 flex items-center space-x-4">
            <button
              onClick={onNavigateToTranscript}
              className="px-5 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center space-x-2 shadow-md transition-colors cursor-pointer"
            >
              <span>Launch Transcript Workbench</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Projects Grid Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-emerald-400" />
            <span>Active Client Projects</span>
          </h3>
          <span className="text-xs text-slate-400">{projects.length} project(s) recorded</span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-400">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400 mb-3"></div>
            <p className="text-sm">Loading project scopes from database...</p>
          </div>
        ) : projects.length === 0 ? (
          /* Empty State */
          <div className="py-16 px-6 text-center bg-[#0B1317] border border-[#1A2C30] rounded-2xl">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#121E23] border border-[#223B40] flex items-center justify-center text-slate-500 mb-4">
              <FolderKanban className="w-7 h-7" />
            </div>
            <h4 className="text-base font-bold text-white">No Projects Saved Yet</h4>
            <p className="mt-1 text-sm text-slate-400 max-w-md mx-auto">
              The CRM is currently empty. Click &quot;Create from Transcript&quot; to paste the official planning meeting transcript and automatically extract your first projects.
            </p>
            <button
              onClick={onNavigateToTranscript}
              className="mt-5 inline-flex items-center space-x-2 px-5 py-2 rounded-xl bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider hover:bg-emerald-300 transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Create from Transcript</span>
            </button>
          </div>
        ) : (
          /* Projects Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map(project => (
              <div
                key={project.id}
                onClick={() => onSelectProject(project.id)}
                className="group bg-[#0B1317] hover:bg-[#0E181D] border border-[#1A2C30] hover:border-emerald-500/50 rounded-2xl p-6 transition-all duration-200 cursor-pointer shadow-lg hover:shadow-emerald-500/10 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <Building2 className="w-3 h-3" />
                      {project.clientName}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-400">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      {project.deadline}
                    </span>
                  </div>

                  <h4 className="mt-3 text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                    {project.name}
                  </h4>
                  <p className="mt-2 text-xs text-slate-400 line-clamp-3 leading-relaxed">
                    {project.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#16252A] space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-sky-400" />
                      <span>Manager:</span>
                    </span>
                    <span className="font-semibold text-slate-200">{project.managerName}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded-md bg-[#131E22] text-slate-300 border border-[#223B40] text-[11px] font-medium">
                        {project.taskCount} Tasks
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-medium">
                        {project.totalEstimatedHours} hrs
                      </span>
                    </div>

                    <span className="text-xs font-semibold text-emerald-400 group-hover:translate-x-1 transition-transform inline-flex items-center">
                      Details &rarr;
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
