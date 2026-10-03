import React, { useState } from 'react';
import {
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Inbox,
  ArrowUpDown,
  FolderKanban,
  Sparkles,
  Plus
} from 'lucide-react';
import { useTodos } from '../../context/TodoContext';
import { TodoCard } from './TodoCard';

export const TodoList = ({ onOpenCreateTodo }) => {
  const {
    filteredTodos,
    todos,
    projects,
    activeFilter,
    setActiveFilter,
    activeProject,
    setActiveProject,
    searchQuery,
    setSearchQuery,
    selectedCalendarDate,
    setSelectedCalendarDate
  } = useTodos();

  const [sortBy, setSortBy] = useState('date'); // 'date', 'priority', 'title', 'newest'

  // Apply sorting
  const sortedTodos = [...filteredTodos].sort((a, b) => {
    if (sortBy === 'date') {
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return a.due_date.localeCompare(b.due_date);
    }
    if (sortBy === 'priority') {
      const pWeights = { urgent: 4, high: 3, medium: 2, low: 1 };
      return (pWeights[b.priority] || 0) - (pWeights[a.priority] || 0);
    }
    if (sortBy === 'title') {
      return a.title.localeCompare(b.title);
    }
    if (sortBy === 'newest') {
      return (b.created_at || '').localeCompare(a.created_at || '');
    }
    return 0;
  });

  const filterTabs = [
    { id: 'all', label: 'All Tasks', count: todos.length },
    { id: 'active', label: 'Active', count: todos.filter(t => !t.completed).length },
    { id: 'today', label: 'Today', count: todos.filter(t => t.due_date === new Date().toISOString().split('T')[0] && !t.completed).length },
    { id: 'upcoming', label: 'Upcoming', count: todos.filter(t => t.due_date > new Date().toISOString().split('T')[0] && !t.completed).length },
    { id: 'urgent', label: 'Urgent', count: todos.filter(t => (t.priority === 'urgent' || t.priority === 'high') && !t.completed).length },
    { id: 'completed', label: 'Completed', count: todos.filter(t => t.completed).length }
  ];

  return (
    <div>
      {/* Top Filter and Search Bar */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        marginBottom: '20px'
      }}>
        {/* Search Input */}
        <div style={{ position: 'relative', flex: '1', minWidth: '240px', maxWidth: '420px' }}>
          <Search size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search tasks, descriptions, or #tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '40px', paddingRight: '14px' }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="btn-ghost"
              style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', padding: '4px', fontSize: '0.75rem' }}
            >
              Clear
            </button>
          )}
        </div>

        {/* Project & Sorting Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Project Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FolderKanban size={15} color="var(--text-muted)" />
            <select
              className="form-select"
              value={activeProject}
              onChange={(e) => setActiveProject(e.target.value)}
              style={{ width: 'auto', padding: '8px 12px', fontSize: '0.85rem' }}
            >
              <option value="all">All Projects</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ArrowUpDown size={15} color="var(--text-muted)" />
            <select
              className="form-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ width: 'auto', padding: '8px 12px', fontSize: '0.85rem' }}
            >
              <option value="date">Sort by Due Date</option>
              <option value="priority">Sort by Priority</option>
              <option value="newest">Sort by Recently Created</option>
              <option value="title">Sort by Title (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Date Filter Notification Banner (if filtered by Calendar) */}
      {selectedCalendarDate && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 16px',
          background: 'rgba(6, 182, 212, 0.12)',
          border: '1px solid rgba(6, 182, 212, 0.3)',
          borderRadius: 'var(--radius-md)',
          marginBottom: '16px',
          color: '#22d3ee',
          fontSize: '0.875rem'
        }}>
          <span>
            📅 Filtering todos scheduled on <strong>{selectedCalendarDate}</strong>
          </span>
          <button
            onClick={() => setSelectedCalendarDate(null)}
            className="btn btn-ghost btn-sm"
            style={{ color: '#22d3ee', textDecoration: 'underline', padding: '2px 8px' }}
          >
            Clear Date Filter
          </button>
        </div>
      )}

      {/* Tabs */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        overflowX: 'auto',
        paddingBottom: '8px',
        marginBottom: '20px',
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        {filterTabs.map((tab) => {
          const isActive = activeFilter === tab.id && !selectedCalendarDate;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveFilter(tab.id);
                setSelectedCalendarDate(null);
              }}
              className="btn btn-ghost btn-sm"
              style={{
                borderRadius: 'var(--radius-md)',
                padding: '6px 12px',
                fontSize: '0.825rem',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? 'var(--bg-primary)' : 'var(--text-muted)',
                background: isActive ? 'var(--text-main)' : 'transparent',
                border: '1px solid transparent',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                whiteSpace: 'nowrap'
              }}
            >
              <span>{tab.label}</span>
              <span style={{
                fontSize: '0.7rem',
                padding: '1px 5px',
                borderRadius: 'var(--radius-full)',
                background: isActive ? 'rgba(255, 255, 255, 0.2)' : 'var(--bg-tertiary)',
                color: isActive ? 'var(--bg-primary)' : 'var(--text-dim)'
              }}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Todos Count Indicator */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.8rem',
        color: 'var(--text-dim)',
        marginBottom: '12px'
      }}>
        <span>Showing {sortedTodos.length} of {todos.length} total tasks</span>
        {sortedTodos.length > 0 && (
          <span>{todos.filter(t => t.completed).length} completed</span>
        )}
      </div>

      {/* Todos Cards List or After-Delete Empty State */}
      {sortedTodos.length === 0 ? (
        <div className="glass-panel" style={{
          textAlign: 'center',
          padding: '44px 20px',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: 'var(--bg-tertiary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-dim)'
          }}>
            <Inbox size={22} />
          </div>

          <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>
            {todos.length === 0 ? 'Your workspace is ready' : 'No tasks found'}
          </h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '380px', margin: 0, lineHeight: 1.5 }}>
            {searchQuery
              ? `No tasks match "${searchQuery}".`
              : selectedCalendarDate
              ? `No tasks scheduled for ${selectedCalendarDate}.`
              : activeFilter === 'completed'
              ? 'No completed tasks yet. Finish a task to experience the celebration!'
              : todos.length === 0
              ? 'No tasks yet. Create your first task to begin organizing your workspace!'
              : 'Your workspace is clear! All tasks completed or deleted. Add a new task to keep building.'}
          </p>

          <button
            onClick={onOpenCreateTodo}
            className="btn btn-primary btn-sm"
            style={{ marginTop: '6px' }}
          >
            <Plus size={15} /> {todos.length === 0 ? 'Create First Task' : 'Create Task'}
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {sortedTodos.map((todo) => (
            <TodoCard key={todo.id} todo={todo} />
          ))}
        </div>
      )}
    </div>
  );
};
