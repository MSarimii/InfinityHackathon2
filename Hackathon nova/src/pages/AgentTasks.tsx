/**
 * PAGE - Agent "My Tasks" View
 * File: src/pages/AgentTasks.tsx
 *
 * Implements Section 14 & 18 (Agent Role View):
 * Displays ONLY tasks assigned to the logged-in agent.
 * Confirms cross-project aggregation (e.g. Hamza sees both UrbanCart and QuickServe tasks)
 * while blocking access to any other agents' tasks.
 */

import React, { useEffect, useState } from 'react';
import { TaskDto } from '../../shared/api-contracts.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';
import {
  CheckCircle2,
  Clock,
  Calendar,
  FolderKanban,
  Code2,
  Shield,
  Layers,
  AlertCircle
} from 'lucide-react';

interface AgentTasksProps {
  onSelectProject?: (projectId: string) => void;
}

export const AgentTasks: React.FC<AgentTasksProps> = ({ onSelectProject }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<TaskDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks();
  }, [user]);

  const fetchTasks = async () => {
    setLoading(true);
    const res = await api.getMyTasks();
    if (res.success && res.data) {
      setTasks(res.data);
    } else {
      setError(res.error || 'Failed to retrieve assigned tasks');
    }
    setLoading(false);
  };

  const totalHours = tasks.reduce((acc, t) => acc + t.estimatedHours, 0);

  // Group by distinct projects
  const uniqueProjects = Array.from(new Set(tasks.map(t => t.projectName || 'Project')));

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
          <Code2 className="w-4 h-4" />
          <span>Developer Workstation</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          My Assigned Tasks
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Work items assigned to <strong className="text-white">{user?.name}</strong> ({user?.specialization}). You cannot access work items assigned to other engineers.
        </p>
      </div>

      {/* Role Notice Banner */}
      <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-200 text-xs flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <Shield className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>
            <strong>Access Control Active:</strong> Showing your {tasks.length} assigned task(s) spanning {uniqueProjects.length} client project(s). Backend strictly filters unauthorized task records.
          </span>
        </div>
        <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-emerald-900/60 text-[10px] font-mono text-emerald-300">
          AGENT SCOPE
        </span>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-[#0B1317] border border-[#1A2C30] rounded-xl p-4">
          <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
            Assigned Work Units
          </span>
          <p className="text-2xl font-black text-white mt-1">{tasks.length}</p>
        </div>
        <div className="bg-[#0B1317] border border-[#1A2C30] rounded-xl p-4">
          <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
            Total Effort Required
          </span>
          <p className="text-2xl font-black text-emerald-400 mt-1">{totalHours} hrs</p>
        </div>
        <div className="bg-[#0B1317] border border-[#1A2C30] rounded-xl p-4 col-span-2 sm:col-span-1">
          <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
            Active Projects Involved
          </span>
          <p className="text-2xl font-black text-white mt-1">{uniqueProjects.length}</p>
        </div>
      </div>

      {/* Tasks Table / Card List */}
      <div className="bg-[#0B1317] border border-[#1A2C30] rounded-2xl p-6 sm:p-8 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>Task Breakdown List</span>
          </h3>
          <span className="text-xs text-slate-400">{tasks.length} task(s) found</span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-400">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400 mb-3"></div>
            <p className="text-sm">Fetching your task queue...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="py-16 text-center bg-[#070D10] border border-[#1A2C30] rounded-xl">
            <CheckCircle2 className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h4 className="text-base font-bold text-white">No Tasks Assigned</h4>
            <p className="text-xs text-slate-400 mt-1">
              You currently have no tasks assigned in the system.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#16252A] border border-[#1A2C30] rounded-xl overflow-hidden">
            {tasks.map((task, idx) => (
              <div
                key={task.id}
                className="p-4 sm:p-5 bg-[#0A1215] hover:bg-[#0E1A1E] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono text-slate-500 font-bold">#{idx + 1}</span>
                    <h4 className="text-base font-bold text-white">{task.title}</h4>
                    {task.projectName && (
                      <span
                        onClick={() => onSelectProject && onSelectProject(task.projectId)}
                        className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-[#131E22] text-slate-300 border border-[#223B40] ${
                          onSelectProject ? 'hover:border-emerald-500 cursor-pointer' : ''
                        }`}
                      >
                        <FolderKanban className="w-3 h-3 text-emerald-400" />
                        <span>{task.projectName}</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed pl-5">{task.description}</p>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6 pl-5 md:pl-0 border-t md:border-t-0 pt-3 md:pt-0 border-[#16252A]">
                  <div className="text-left md:text-right">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Effort</span>
                    <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <Clock className="w-3 h-3" />
                      <span>{task.estimatedHours} Hours</span>
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Delivery Due</span>
                    <span className="text-xs font-mono font-bold text-white flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{task.deadline}</span>
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
