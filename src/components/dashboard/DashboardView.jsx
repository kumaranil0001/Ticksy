import React, { useState } from 'react';
import {
  Layers,
  Clock,
  Calendar,
  FolderKanban,
  Plus,
  PanelLeftOpen,
  TrendingUp,
  UserCog
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTodos } from '../../context/TodoContext';
import { Sidebar } from '../layout/Sidebar';
import { StatsOverview } from './StatsOverview';
import { TodoForm } from './TodoForm';
import { TodoList } from './TodoList';
import { CalendarView } from './CalendarView';
import { ScheduleView } from './ScheduleView';
import { ProjectsView } from './ProjectsView';
import { ProfileView } from './ProfileView';
import { ProgressAnalyticsView } from './ProgressAnalyticsView';

export const DashboardView = ({
  activeTab = 'tasks',
  setActiveTab,
  showTodoForm: propShowTodoForm = undefined,
  setShowTodoForm: propSetShowTodoForm = null
}) => {
  const { user } = useAuth();
  const { stats, setActiveProject, setSelectedCalendarDate } = useTodos();
  const [localShowTodoForm, setLocalShowTodoForm] = useState(false);
  const showTodoForm = propShowTodoForm !== undefined ? propShowTodoForm : localShowTodoForm;
  const setShowTodoForm = propSetShowTodoForm || setLocalShowTodoForm;

  // Sidebar collapse/slide state with persistence
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    try {
      const saved = localStorage.getItem('ticksy_sidebar_open');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => {
      const next = !prev;
      try {
        localStorage.setItem('ticksy_sidebar_open', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  const tabs = [
    { id: 'tasks', label: 'All Tasks', icon: Layers, badge: stats.total },
    { id: 'schedule', label: 'Schedule', icon: Clock, badge: stats.todayCount },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'projects', label: 'Projects', icon: FolderKanban },
    { id: 'progress', label: 'Progress', icon: TrendingUp },
    { id: 'profile', label: 'Profile', icon: UserCog }
  ];

  const handleSelectProjectFromView = (projectId) => {
    setActiveProject(projectId);
    setSelectedCalendarDate(null);
    setActiveTab('tasks');
  };

  const handleOpenCreateModal = () => {
    setShowTodoForm(true);
  };

  const isDedicatedPage = activeTab === 'profile' || activeTab === 'progress';

  return (
    <div style={{ paddingTop: '24px', paddingBottom: '60px' }}>
      <div className="container" style={{ display: 'flex', gap: '28px', alignItems: 'flex-start' }}>
        {/* Left Sidebar Navigation with Slide In / Out Transition */}
        <div className={`sidebar-slide-wrapper ${isSidebarOpen ? 'open' : 'closed'}`}>
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onOpenNewTodo={handleOpenCreateModal}
            onCloseSidebar={toggleSidebar}
            isSidebarOpen={isSidebarOpen}
          />
        </div>

        {/* Right Main Content Panel */}
        <div style={{ flex: 1, minWidth: 0, width: '100%', transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}>
          {/* Collapsed Sidebar Restore Button (Appears when sidebar is closed) */}
          {!isSidebarOpen && (
            <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center' }}>
              <button
                onClick={toggleSidebar}
                className="btn btn-secondary btn-sm sidebar-reopen-pill"
                title="Open Workspace Views (Slide in)"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '7px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-card)',
                  boxShadow: 'var(--shadow-sm)',
                  border: '1px solid var(--border-card)',
                  fontWeight: 600,
                  fontSize: '0.825rem'
                }}
              >
                <PanelLeftOpen size={16} strokeWidth={2.2} />
                <span>Open Workspace Views</span>
              </button>
            </div>
          )}

          {/* Conditional Content: If Dedicated Profile/Progress Page vs Workspace Dashboard */}
          {activeTab === 'profile' ? (
            <ProfileView
              onBackToTasks={() => setActiveTab('tasks')}
              onSwitchToProgress={() => setActiveTab('progress')}
            />
          ) : activeTab === 'progress' ? (
            <ProgressAnalyticsView
              onBackToTasks={() => setActiveTab('tasks')}
              onSwitchToProfile={() => setActiveTab('profile')}
              onSelectDateFilter={() => setActiveTab('tasks')}
            />
          ) : (
            /* Workspace Dashboard Main Views (Tasks, Schedule, Calendar, Projects) */
            <>
              {/* Welcome & Motivation Banner */}
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
                marginBottom: '28px',
                paddingBottom: '20px',
                borderBottom: '1px solid var(--border-subtle)'
              }}>
                <div>
                  <div style={{ marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.825rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
                      Ticksy Workspace
                    </span>
                  </div>

                  <h1 style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2rem)', fontWeight: 800 }}>
                    Welcome back, <span className="gradient-text">{user?.user_metadata?.full_name || 'Creator'}</span>
                  </h1>

                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {stats.todayCount > 0
                      ? `You have ${stats.todayCount} action item${stats.todayCount > 1 ? 's' : ''} due today. Let's make momentum!`
                      : "You're all caught up for today! Review your roadmap or plan your next move."}
                  </p>
                </div>

                {/* Quick Create Task Action Button */}
                <button
                  onClick={handleOpenCreateModal}
                  className="btn btn-primary"
                  title="Create a new task"
                  style={{
                    height: '42px',
                    gap: '8px',
                    padding: '0 20px',
                    boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
                    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 52%, #06b6d4 100%)',
                    borderColor: 'transparent'
                  }}
                >
                  <Plus size={17} strokeWidth={2.5} />
                  <span>Create Task</span>
                </button>
              </div>

              {/* Top Stats Overview */}
              <StatsOverview />

              {/* Mobile View Switcher (Visible on mobile screens where sidebar is collapsed) */}
              <div className="mobile-view-tabs" style={{
                display: 'none',
                alignItems: 'center',
                gap: '6px',
                background: 'var(--bg-card)',
                padding: '6px',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-card)',
                marginBottom: '20px',
                overflowX: 'auto'
              }}>
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className="btn btn-ghost btn-sm"
                      style={{
                        flex: '1',
                        borderRadius: 'var(--radius-md)',
                        background: isActive ? 'var(--accent-primary)' : 'transparent',
                        color: isActive ? '#ffffff' : 'var(--text-muted)',
                        gap: '6px',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      <Icon size={15} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Active Tab View Content */}
              {activeTab === 'tasks' && (
                <TodoList onOpenCreateTodo={handleOpenCreateModal} />
              )}

              {activeTab === 'schedule' && (
                <ScheduleView />
              )}

              {activeTab === 'calendar' && (
                <CalendarView />
              )}

              {activeTab === 'projects' && (
                <ProjectsView onSelectProject={handleSelectProjectFromView} />
              )}
            </>
          )}
        </div>
      </div>

      {/* Pop-up Create Task Modal Window */}
      <TodoForm
        isOpen={showTodoForm}
        onClose={() => setShowTodoForm(false)}
        onSaved={() => setShowTodoForm(false)}
      />

      <style>{`
        @media (max-width: 960px) {
          .mobile-view-tabs {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  );
};
