import React from 'react';
import {
  Layers,
  Clock,
  Calendar,
  FolderKanban,
  Plus,
  Flame,
  TrendingUp,
  UserCog,
  ChevronLeft
} from 'lucide-react';
import { useTodos } from '../../context/TodoContext';

export const Sidebar = ({ activeTab, setActiveTab, onOpenNewTodo, onCloseSidebar }) => {
  const { stats, projects, setSelectedCalendarDate } = useTodos();

  const navItems = [
    {
      id: 'tasks',
      label: 'All Tasks',
      icon: Layers,
      count: stats.total,
      badgeColor: 'var(--accent-primary)',
      description: 'Overview of all your todos'
    },
    {
      id: 'schedule',
      label: 'Schedule',
      icon: Clock,
      count: stats.todayCount > 0 ? `${stats.todayCount} today` : null,
      badgeColor: '#22d3ee',
      description: 'Timeline & daily agenda'
    },
    {
      id: 'calendar',
      label: 'Calendar',
      icon: Calendar,
      count: null,
      description: 'Date-based scheduling'
    },
    {
      id: 'projects',
      label: 'Projects',
      icon: FolderKanban,
      count: projects.length,
      badgeColor: '#a855f7',
      description: 'Workspaces & tags'
    }
  ];

  const profileItems = [
    {
      id: 'progress',
      label: 'Progress & Success',
      icon: TrendingUp,
      count: `${stats.completionPercentage}%`,
      description: 'Date-wise completion rate graph'
    },
    {
      id: 'profile',
      label: 'Profile & Security',
      icon: UserCog,
      count: null,
      description: 'Manage username and password'
    }
  ];

  const handleSelect = (itemId) => {
    if (itemId !== 'calendar') {
      setSelectedCalendarDate(null);
    }
    setActiveTab(itemId);
  };

  return (
    <aside className="sidebar-container">
      {/* Top Header in Sidebar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '2px 2px 10px 2px',
        borderBottom: '1px solid var(--border-subtle)',
        marginBottom: '10px',
        flexShrink: 0
      }}>
        {/* Workspace Views Title */}
        <span style={{
          fontSize: '0.72rem',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          fontWeight: 700,
          color: 'var(--text-dim)',
          whiteSpace: 'nowrap'
        }}>
          Workspace Views
        </span>

        {/* Right side: Active Status Badge + Breathing Space + Distinct Styled Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{
            fontSize: '0.675rem',
            color: '#10b981',
            fontWeight: 600,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '2px 7px',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.25)'
          }}>
            <span style={{
              width: '5px',
              height: '5px',
              borderRadius: '50%',
              background: '#10b981',
              boxShadow: '0 0 5px rgba(16, 185, 129, 0.6)'
            }} />
            Active
          </span>

          {/* Distinct Styled Collapse Toggle Button */}
          {onCloseSidebar && (
            <button
              onClick={onCloseSidebar}
              className="sidebar-collapse-toggle-btn"
              title="Collapse Workspace Views (Slide out)"
              aria-label="Collapse Workspace Views"
            >
              <ChevronLeft size={15} strokeWidth={2.4} />
            </button>
          )}
        </div>
      </div>

      {/* Middle Navigation Area: Smoothly scrollable if viewport is tight */}
      <div className="sidebar-scrollable-body">
        {/* Workspace Views Navigation */}
        <nav style={{ marginBottom: '8px' }}>
          <ul className="sidebar-nav-list">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleSelect(item.id)}
                    className={`sidebar-item ${isActive ? 'active' : ''}`}
                    title={item.description}
                  >
                    <div className="sidebar-icon">
                      <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: isActive ? 700 : 500 }}>
                        {item.label}
                      </span>
                    </div>

                    {item.count !== null && item.count !== undefined && (
                      <span className="sidebar-badge">
                        {item.count}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Account & Analytics Section Header */}
        <div style={{
          padding: '6px 4px 6px 4px',
          borderTop: '1px solid var(--border-subtle)',
          marginTop: '6px',
          marginBottom: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span style={{
            fontSize: '0.7rem',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            fontWeight: 700,
            color: 'var(--text-dim)'
          }}>
            Account & Analytics
          </span>
        </div>

        {/* Account & Analytics Nav Items */}
        <nav>
          <ul className="sidebar-nav-list">
            {profileItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleSelect(item.id)}
                    className={`sidebar-item ${isActive ? 'active' : ''}`}
                    title={item.description}
                  >
                    <div className="sidebar-icon">
                      <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: isActive ? 700 : 500 }}>
                        {item.label}
                      </span>
                    </div>

                    {item.count !== null && item.count !== undefined && (
                      <span className="sidebar-badge" style={{ color: item.id === 'progress' ? '#10b981' : undefined }}>
                        {item.count}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Bottom Fixed Area: New Task Button & Daily Momentum Card */}
      <div style={{ marginTop: 'auto', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0 }}>
        {/* Quick Add Task Button inside Sidebar */}
        <button
          onClick={onOpenNewTodo}
          className="btn btn-primary"
          style={{
            width: '100%',
            justifyContent: 'center',
            padding: '8px 14px',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem',
            fontWeight: 600,
            gap: '6px'
          }}
        >
          <Plus size={15} strokeWidth={2.5} />
          <span>New Task</span>
        </button>

        {/* Bottom Mini Momentum Card */}
        <div style={{
          padding: '10px 12px',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--border-subtle)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>Daily Momentum</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.725rem', color: '#f59e0b', fontWeight: 700 }}>
              <Flame size={12} /> Streak
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}>
            <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{stats.completed}/{stats.total} Tasks</span>
            <span style={{ color: '#10b981', fontWeight: 600 }}>{stats.completionPercentage}%</span>
          </div>

          <div style={{ width: '100%', height: '4px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: 'var(--radius-full)', marginTop: '6px', overflow: 'hidden' }}>
            <div style={{
              width: `${stats.completionPercentage}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #10b981, #06b6d4)',
              borderRadius: 'var(--radius-full)',
              transition: 'width 0.4s ease'
            }} />
          </div>
        </div>
      </div>
    </aside>
  );
};
