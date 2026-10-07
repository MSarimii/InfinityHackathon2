/**
 * ROOT APPLICATION COMPONENT
 * File: src/App.tsx
 *
 * Implements role-aware routing, modal handling, and state coordination.
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { Login } from './pages/Login.tsx';
import { AdminDashboard } from './pages/AdminDashboard.tsx';
import { CreateTranscript } from './pages/CreateTranscript.tsx';
import { ProjectDetail } from './pages/ProjectDetail.tsx';
import { ManagerView } from './pages/ManagerView.tsx';
import { AgentTasks } from './pages/AgentTasks.tsx';
import { TeamDirectory } from './pages/TeamDirectory.tsx';
import { api } from './services/api.ts';

const MainApp: React.FC = () => {
  const { user, loading } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('projects');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070D10] flex items-center justify-center text-slate-400">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-medium">Initializing NovaWorks CRM...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const handleResetDemo = async () => {
    if (window.confirm('Reset database to clean initial state (10 users, 0 projects, 0 tasks)?')) {
      const res = await api.resetDemoData();
      if (res.success) {
        setResetMessage('Database reset to initial demo state!');
        setSelectedProjectId(null);
        setCurrentTab('projects');
        setTimeout(() => setResetMessage(null), 3000);
      }
    }
  };

  const handleSelectTab = (tab: string) => {
    setSelectedProjectId(null);
    setCurrentTab(tab);
  };

  const renderContent = () => {
    // If a project detail is open
    if (selectedProjectId) {
      return (
        <ProjectDetail
          projectId={selectedProjectId}
          onBack={() => setSelectedProjectId(null)}
        />
      );
    }

    // Role-Scoped Views
    if (user.role === 'ADMIN') {
      switch (currentTab) {
        case 'transcript':
          return (
            <CreateTranscript
              onBack={() => setCurrentTab('projects')}
              onSuccess={() => setCurrentTab('projects')}
            />
          );
        case 'team':
          return <TeamDirectory />;
        case 'projects':
        default:
          return (
            <AdminDashboard
              onNavigateToTranscript={() => setCurrentTab('transcript')}
              onSelectProject={id => setSelectedProjectId(id)}
            />
          );
      }
    }

    if (user.role === 'MANAGER') {
      switch (currentTab) {
        case 'team':
          return <TeamDirectory />;
        case 'projects':
        default:
          return <ManagerView onSelectProject={id => setSelectedProjectId(id)} />;
      }
    }

    if (user.role === 'AGENT') {
      switch (currentTab) {
        case 'team':
          return <TeamDirectory />;
        case 'projects':
          return (
            <AdminDashboard
              onNavigateToTranscript={() => {}}
              onSelectProject={id => setSelectedProjectId(id)}
            />
          );
        case 'tasks':
        default:
          return <AgentTasks onSelectProject={id => setSelectedProjectId(id)} />;
      }
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-[#070D10] text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-black">
      <Navbar
        currentTab={selectedProjectId ? '' : currentTab}
        onSelectTab={handleSelectTab}
        onResetDemo={handleResetDemo}
      />

      {resetMessage && (
        <div className="bg-amber-900/60 border-b border-amber-700/60 text-amber-200 text-xs py-2 px-4 text-center font-medium">
          {resetMessage}
        </div>
      )}

      <main className="flex-1 pb-16">{renderContent()}</main>

      <footer className="border-t border-[#131E22] bg-[#091114] py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>NovaWorks Technologies • Lahore, Pakistan</span>
          <span>Infinity Hack ’26 • AI Project Manager: Meeting to Execution</span>
          <span className="font-mono text-[11px] text-emerald-500">Persistence: Local Disk Sync</span>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
