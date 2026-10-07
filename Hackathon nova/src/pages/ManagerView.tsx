/**
 * PAGE - Manager Filtered View
 * File: src/pages/ManagerView.tsx
 *
 * Implements Section 14 (Manager View):
 * Displays ONLY projects managed by the current authenticated manager.
 * Verifies that a manager cannot access other managers' engagements.
 */

import React, { useEffect, useState } from 'react';
import { ProjectDto } from '../../shared/api-contracts.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';
import {
  FolderKanban,
  Building2,
  Calendar,
  Clock,
  Shield,
  Briefcase,
  AlertCircle
} from 'lucide-react';

interface ManagerViewProps {
  onSelectProject: (projectId: string) => void;
}

export const ManagerView: React.FC<ManagerViewProps> = ({ onSelectProject }) => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<ProjectDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchManagedProjects();
  }, [user]);

  const fetchManagedProjects = async () => {
    setLoading(true);
    const res = await api.getProjects();
    if (res.success && res.data) {
      setProjects(res.data);
    } else {
      setError(res.error || 'Failed to retrieve manager projects');
    }
    setLoading(false);
  };

  const totalTasks = projects.reduce((acc, p) => acc + p.taskCount, 0);
  const totalHours = projects.reduce((acc, p) => acc + p.totalEstimatedHours, 0);

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-sky-400 text-xs font-bold uppercase tracking-wider mb-1">
          <Briefcase className="w-4 h-4" />
          <span>Manager Scoped Portal</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          My Managed Projects
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Showing engagements where manager is <strong className="text-white">{user?.name}</strong>. Other managers&apos; projects are strictly isolated by backend authorization.
        </p>
      </div>

      {/* Role Notice Banner */}
      <div className="p-4 rounded-xl bg-sky-950/40 border border-sky-800/60 text-sky-200 text-xs flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <Shield className="w-4 h-4 text-sky-400 flex-shrink-0" />
          <span>
            <strong>Role-Based Access Enforced:</strong> You have managerial authority over {projects.length} project(s). Requests for non-permitted projects are blocked at the controller layer.
          </span>
        </div>
        <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-sky-900/60 text-[10px] font-mono text-sky-300">
          MANAGER SCOPE
        </span>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-[#0B1317] border border-[#1A2C30] rounded-xl p-4">
          <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
            Assigned Projects
          </span>
          <p className="text-2xl font-black text-white mt-1">{projects.length}</p>
        </div>
        <div className="bg-[#0B1317] border border-[#1A2C30] rounded-xl p-4">
          <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
            Total Sprints & Tasks
          </span>
          <p className="text-2xl font-black text-white mt-1">{totalTasks}</p>
        </div>
        <div className="bg-[#0B1317] border border-[#1A2C30] rounded-xl p-4 col-span-2 sm:col-span-1">
          <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
            Total Effort Managed
          </span>
          <p className="text-2xl font-black text-emerald-400 mt-1">{totalHours} hrs</p>
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-sky-400 mb-3"></div>
          <p className="text-sm">Loading your managed projects...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="py-16 text-center bg-[#0B1317] border border-[#1A2C30] rounded-2xl">
          <FolderKanban className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No Projects Currently Assigned</h3>
          <p className="text-xs text-slate-400 mt-1">
            There are currently no active projects under your manager ID.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map(project => (
            <div
              key={project.id}
              onClick={() => onSelectProject(project.id)}
              className="group bg-[#0B1317] hover:bg-[#0E181D] border border-[#1A2C30] hover:border-sky-500/50 rounded-2xl p-6 transition-all duration-200 cursor-pointer shadow-lg hover:shadow-sky-500/10 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-400 border border-sky-500/20">
                    <Building2 className="w-3 h-3" />
                    {project.clientName}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-400">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    {project.deadline}
                  </span>
                </div>

                <h4 className="mt-3 text-lg font-bold text-white group-hover:text-sky-300 transition-colors">
                  {project.name}
                </h4>
                <p className="mt-2 text-xs text-slate-400 line-clamp-3 leading-relaxed">
                  {project.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[#16252A] flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded-md bg-[#131E22] text-slate-300 border border-[#223B40] text-[11px] font-medium">
                    {project.taskCount} Tasks
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-medium">
                    {project.totalEstimatedHours} hrs
                  </span>
                </div>

                <span className="text-xs font-semibold text-sky-400 group-hover:translate-x-1 transition-transform inline-flex items-center">
                  Open Project &rarr;
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
