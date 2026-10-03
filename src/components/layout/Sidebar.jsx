import React from 'react';
import {
  Layers,
  Clock,
  Calendar,
  FolderKanban,
  Plus,
  Flame,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { useTodos } from '../../context/TodoContext';

export const Sidebar = ({ activeTab, setActiveTab, onOpenNewTodo }) => {
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

  const handleSelect = (itemId) => {
    if (itemId !== 'calendar') {
      setSelectedCalendarDate(null);
    }
    setActiveTab(itemId);
  };

  return (
    <aside className="sidebar-container">
      {/* Top Header in Sidebar */}
      <div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px 16px 12px',
          borderBottom: '1px solid var(--border-subtle)',
          marginBottom: '16px'
        }}>
          <span style={{
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            fontWeight: 700,
            color: 'var(--text-dim)'
          }}>
            Workspace Views
          </span>
          <span style={{
            fontSize: '0.7rem',
            color: '#10b981',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
            Active
          </span>
        </div>

        {/* Navigation List - Top to Bottom One by One with Hover Popup Animation */}
        <nav>
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
                      <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
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

        {/* Quick Add Task Button inside Sidebar */}
        <div style={{ marginTop: '20px', padding: '0 4px' }}>
          <button
            onClick={onOpenNewTodo}
            className="btn btn-primary"
            style={{
              width: '100%',
              justifyContent: 'center',
              padding: '10px 16px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.9rem',
              gap: '8px'
            }}
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Bottom Mini Momentum Card */}
      <div style={{
        padding: '14px',
        borderRadius: 'var(--radius-md)',
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid var(--border-subtle)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', fontWeight: 600 }}>Daily Momentum</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#f59e0b', fontWeight: 700 }}>
            <Flame size={13} /> Streak
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
          <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{stats.completed}/{stats.total} Tasks</span>
          <span style={{ color: '#10b981', fontWeight: 600 }}>{stats.completionPercentage}%</span>
        </div>

        <div style={{ width: '100%', height: '5px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: 'var(--radius-full)', marginTop: '8px', overflow: 'hidden' }}>
          <div style={{
            width: `${stats.completionPercentage}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #10b981, #06b6d4)',
            borderRadius: 'var(--radius-full)',
            transition: 'width 0.4s ease'
          }} />
        </div>
      </div>
    </aside>
  );
};
