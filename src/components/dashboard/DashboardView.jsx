import React, { useState } from 'react';
import {
  Layers,
  Clock,
  Calendar,
  FolderKanban,
  Plus,
  X
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

  const tabs = [
    { id: 'tasks', label: 'All Tasks', icon: Layers, badge: stats.total },
    { id: 'schedule', label: 'Schedule', icon: Clock, badge: stats.todayCount },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'projects', label: 'Projects', icon: FolderKanban }
  ];

  const handleSelectProjectFromView = (projectId) => {
    setActiveProject(projectId);
    setSelectedCalendarDate(null);
    setActiveTab('tasks');
  };

  const handleOpenFormAndFocus = () => {
    setActiveTab('tasks');
    setShowTodoForm(true);
    setTimeout(() => {
      const el = document.getElementById('todo-creation-form');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const input = el.querySelector('input[type="text"]');
        if (input) input.focus();
      }
    }, 100);
  };

  return (
    <div style={{ paddingTop: '24px', paddingBottom: '60px' }}>
      <div className="container" style={{ display: 'flex', gap: '28px', alignItems: 'flex-start' }}>
        {/* Left Sidebar Navigation (Top-to-bottom with hover popup animation) */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenNewTodo={handleOpenFormAndFocus}
        />

        {/* Right Main Content Panel */}
        <div style={{ flex: 1, minWidth: 0, width: '100%' }}>
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

            {/* Quick Create Task / Close Form Action Button with distinctly different UIs */}
            {showTodoForm ? (
              <button
                onClick={() => setShowTodoForm(false)}
                className="btn btn-secondary"
                title="Close task creation form"
                style={{
                  height: '42px',
                  gap: '8px',
                  padding: '0 18px',
                  color: 'var(--text-muted)',
                  border: '1px solid var(--border-card)',
                  background: 'var(--bg-card)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#ef4444';
                  e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.4)';
                  e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--text-muted)';
                  e.currentTarget.style.borderColor = 'var(--border-card)';
                  e.currentTarget.style.background = 'var(--bg-card)';
                }}
              >
                <X size={16} strokeWidth={2.5} />
                <span>Close Form</span>
              </button>
            ) : (
              <button
                onClick={handleOpenFormAndFocus}
                className="btn btn-primary"
                title="Create a new task"
                style={{
                  height: '42px',
                  gap: '8px',
                  padding: '0 20px',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <Plus size={17} strokeWidth={2.5} />
                <span>Create Task</span>
              </button>
            )}
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

          {/* Quick Create Todo Form */}
          {(showTodoForm || activeTab === 'tasks') && (
            <div id="todo-creation-form">
              <TodoForm
                isOpen={showTodoForm}
                onToggleOpen={(open) => setShowTodoForm(open)}
                onSaved={() => setShowTodoForm(false)}
              />
            </div>
          )}

          {/* Active Tab View Content */}
          {activeTab === 'tasks' && (
            <TodoList onOpenCreateTodo={handleOpenFormAndFocus} />
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
        </div>
      </div>

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
