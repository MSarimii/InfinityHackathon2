/**
 * PAGE - Project Detail View
 * File: src/pages/ProjectDetail.tsx
 *
 * Implements Section 14 (Project Detail):
 * Displays project metadata, client, manager, deadline,
 * and comprehensive task breakdown table with assignees, hours, and task deadlines.
 */

import React, { useEffect, useState } from 'react';
import { ProjectDetailDto } from '../../shared/api-contracts.ts';
import { api } from '../services/api.ts';
import {
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle2,
  Building2,
  UserCheck,
  Code2,
  FolderKanban,
  AlertCircle
} from 'lucide-react';

interface ProjectDetailProps {
  projectId: string;
  onBack: () => void;
}

export const ProjectDetail: React.FC<ProjectDetailProps> = ({ projectId, onBack }) => {
  const [project, setProject] = useState<ProjectDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  const fetchProject = async () => {
    setLoading(true);
    const res = await api.getProjectById(projectId);
    if (res.success && res.data) {
      setProject(res.data);
    } else {
      setError(res.error || 'Failed to retrieve project details');
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-400">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400 mb-3"></div>
        <p className="text-sm">Loading project specification...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="py-12 max-w-2xl mx-auto px-4 text-center">
        <div className="p-6 rounded-2xl bg-rose-950/40 border border-rose-800/60 text-rose-300 space-y-3">
          <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
          <h3 className="font-bold text-base">Error Loading Project</h3>
          <p className="text-xs">{error || 'Project not found or access restricted.'}</p>
          <button
            onClick={onBack}
            className="mt-4 px-4 py-2 rounded-xl bg-[#131E22] hover:bg-[#1A2C30] text-white text-xs font-semibold"
          >
            &larr; Back to Projects
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-6">
      {/* Back button */}
      <div>
        <button
          onClick={onBack}
          className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Projects List</span>
        </button>
      </div>

      {/* Project Overview Card */}
      <div className="bg-[#0B1317] border border-[#1A2C30] rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <Building2 className="w-3.5 h-3.5" />
                <span>Client: {project.clientName}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-md bg-[#131E22] text-slate-300 border border-[#223B40]">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                <span>Delivery: {project.deadline}</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {project.name}
            </h1>
          </div>

          <div className="flex items-center space-x-4 bg-[#121E23] border border-[#223B40] px-4 py-3 rounded-xl self-start">
            <div className="text-right">
              <div className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">
                Assigned Manager
              </div>
              <div className="text-sm font-bold text-white flex items-center gap-1.5 justify-end">
                <UserCheck className="w-4 h-4 text-sky-400" />
                <span>{project.managerName}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scope Description */}
        <div className="bg-[#070D10] border border-[#1A2C30] rounded-xl p-4">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Project Scope & Specifications
          </span>
          <p className="text-sm text-slate-200 leading-relaxed">{project.description}</p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3.5 rounded-xl bg-[#121E23] border border-[#223B40]">
            <span className="text-[11px] text-slate-400 font-medium">Breakdown Tasks</span>
            <p className="text-xl font-bold text-white mt-1">{project.taskCount} Units</p>
          </div>
          <div className="p-3.5 rounded-xl bg-[#121E23] border border-[#223B40]">
            <span className="text-[11px] text-slate-400 font-medium">Total Engineering Effort</span>
            <p className="text-xl font-bold text-emerald-400 mt-1">{project.totalEstimatedHours} Hours</p>
          </div>
          <div className="p-3.5 rounded-xl bg-[#121E23] border border-[#223B40] col-span-2 sm:col-span-1">
            <span className="text-[11px] text-slate-400 font-medium">Deliverable Deadline</span>
            <p className="text-xl font-bold text-white mt-1 font-mono">{project.deadline}</p>
          </div>
        </div>
      </div>

      {/* Task Rows Section */}
      <div className="bg-[#0B1317] border border-[#1A2C30] rounded-2xl p-6 sm:p-8 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>Task Deliverables & Assignments</span>
          </h3>
          <span className="text-xs text-slate-400">{project.tasks.length} task(s) visible</span>
        </div>

        {project.tasks.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-sm">
            No tasks found or you are not authorized to view tasks for this project.
          </div>
        ) : (
          <div className="divide-y divide-[#16252A] border border-[#1A2C30] rounded-xl overflow-hidden">
            {project.tasks.map((task, idx) => (
              <div
                key={task.id}
                className="p-4 sm:p-5 bg-[#0A1215] hover:bg-[#0E1A1E] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono text-slate-500 font-bold">#{idx + 1}</span>
                    <h4 className="text-sm sm:text-base font-bold text-white">{task.title}</h4>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed pl-5">{task.description}</p>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6 pl-5 md:pl-0 border-t md:border-t-0 pt-3 md:pt-0 border-[#16252A]">
                  {/* Assignee */}
                  <div className="text-left md:text-right">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Assignee</span>
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-300">
                      <Code2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{task.assigneeName}</span>
                    </span>
                  </div>

                  {/* Hours */}
                  <div className="text-center">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Effort</span>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-white px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <Clock className="w-3 h-3" />
                      <span>{task.estimatedHours}h</span>
                    </span>
                  </div>

                  {/* Deadline */}
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Due Date</span>
                    <span className="text-xs font-mono font-medium text-slate-300">{task.deadline}</span>
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
