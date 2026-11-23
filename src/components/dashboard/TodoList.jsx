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
  Plus,
  GripVertical,
  Archive,
  RotateCcw,
  Trash2,
  Calendar
} from 'lucide-react';
import { useTodos } from '../../context/TodoContext';
import { getLocalDateString } from '../../lib/dateUtils';
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
    setSelectedCalendarDate,
    reorderTodos,
    autoArchiveMode,
    setAutoArchiveMode,
    archivedTodos,
    clearFinishedTasksNow,
    restoreArchivedTodo,
    deleteArchivedTodo
  } = useTodos();

  const [sortBy, setSortBy] = useState('manual'); // 'manual', 'priority', 'date', 'newest', 'title'
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  // Apply sorting
  const sortedTodos = [...filteredTodos].sort((a, b) => {
    if (sortBy === 'manual') {
      // Manual/custom arrangement preserves the array's current order
      return 0;
    }
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

  // Drag and drop prioritization handlers
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    try {
      e.dataTransfer.setData('text/plain', index.toString());
    } catch (err) {}
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    // Identify the moved item from the displayed list
    const sourceTodo = sortedTodos[draggedIndex];
    if (!sourceTodo) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    // Reconstruct global todos array to preserve items outside current filter
    const newGlobalTodos = [...todos];
    const sourceGlobalIdx = newGlobalTodos.findIndex(t => t.id === sourceTodo.id);
    const targetTodo = sortedTodos[targetIndex];
    const targetGlobalIdx = newGlobalTodos.findIndex(t => t.id === targetTodo.id);

    if (sourceGlobalIdx !== -1 && targetGlobalIdx !== -1) {
      const [movedItem] = newGlobalTodos.splice(sourceGlobalIdx, 1);
      newGlobalTodos.splice(targetGlobalIdx, 0, movedItem);
      reorderTodos(newGlobalTodos);
    }

    // Ensure we are in manual order mode so user sees their new arrangement
    if (sortBy !== 'manual') {
      setSortBy('manual');
    }

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Keyboard / Touch Up and Down movement
  const handleMoveUp = (index) => {
    if (index <= 0) return;
    const targetIndex = index - 1;
    handleDrop({ preventDefault: () => {} }, targetIndex);
  };

  const handleMoveDown = (index) => {
    if (index >= sortedTodos.length - 1) return;
    const targetIndex = index + 1;
    handleDrop({ preventDefault: () => {} }, targetIndex);
  };

  const todayStr = getLocalDateString();

  const filterTabs = [
    { id: 'all', label: 'All Tasks', count: todos.length },
    { id: 'active', label: 'Active', count: todos.filter(t => !t.completed).length },
    { id: 'today', label: 'Today', count: todos.filter(t => t.due_date === todayStr && !t.completed).length },
    { id: 'upcoming', label: 'Upcoming', count: todos.filter(t => t.due_date > todayStr && !t.completed).length },
    { id: 'urgent', label: 'Urgent', count: todos.filter(t => (t.priority === 'urgent' || t.priority === 'high') && !t.completed).length },
    { id: 'completed', label: 'Completed', count: todos.filter(t => t.completed).length },
    { id: 'archived', label: 'Archived', count: archivedTodos.length }
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
        <div style={{ position: 'relative', flex: '1', minWidth: '240px', maxWidth: '380px' }}>
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

        {/* Project, Auto-Archive & Sorting Controls */}
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

          {/* Sort By Dropdown including Drag to Arrange */}
          {activeFilter !== 'archived' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ArrowUpDown size={15} color="var(--text-muted)" />
              <select
                className="form-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{ width: 'auto', padding: '8px 12px', fontSize: '0.85rem' }}
              >
                <option value="manual">🎯 Drag to Arrange (Custom Priority)</option>
                <option value="priority">Sort by Priority (High to Low)</option>
                <option value="date">Sort by Due Date</option>
                <option value="newest">Sort by Recently Created</option>
                <option value="title">Sort by Title (A-Z)</option>
              </select>
            </div>
          )}

          {/* Auto-Archive Mode Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={15} color="#818cf8" />
            <select
              className="form-select"
              value={autoArchiveMode}
              onChange={(e) => setAutoArchiveMode(e.target.value)}
              title="Task Auto-Removal Setting: choose when finished tasks automatically clear"
              style={{
                width: 'auto',
                padding: '8px 12px',
                fontSize: '0.825rem',
                borderColor: 'var(--border-subtle)',
                background: 'var(--bg-secondary)',
                cursor: 'pointer'
              }}
            >
              <option value="midnight">⏱️ Auto-Clear: At 12:00 AM (Midnight)</option>
              <option value="time_passed">⚡ Auto-Clear: When Timeline Finishes</option>
              <option value="manual">🛑 Auto-Clear: Off (Manual Only)</option>
            </select>
          </div>

          {/* Quick Clear Finished Action */}
          {activeFilter !== 'archived' && todos.some(t => t.completed) && (
            <button
              onClick={() => clearFinishedTasksNow()}
              className="btn btn-ghost btn-sm"
              title="Archive finished timeline tasks now & lock progress report"
              style={{
                fontSize: '0.775rem',
                gap: '5px',
                padding: '7px 11px',
                color: 'var(--text-main)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                background: 'rgba(99, 102, 241, 0.08)'
              }}
            >
              <Sparkles size={13} color="var(--accent-primary)" />
              <span>Clear Finished</span>
            </button>
          )}
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

      {/* Archived View Notification Banner */}
      {activeFilter === 'archived' && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          padding: '12px 18px',
          background: 'rgba(99, 102, 241, 0.08)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          borderRadius: 'var(--radius-md)',
          marginBottom: '16px',
          fontSize: '0.85rem',
          color: 'var(--text-main)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Archive size={16} color="#818cf8" />
            <span>
              <strong>Archived Tasks Vault:</strong> Past and finished timeline items are safely preserved here. Daily completion metrics are locked in your <strong>Progress Graph</strong> while keeping your active workspace lean.
            </span>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
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

      {/* Todos Count Indicator & Drag hint */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '8px',
        fontSize: '0.8rem',
        color: 'var(--text-dim)',
        marginBottom: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>Showing {sortedTodos.length} of {todos.length} total tasks</span>
          {sortBy === 'manual' && sortedTodos.length > 1 && (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              color: 'var(--accent-primary)',
              background: 'var(--accent-subtle)',
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.725rem',
              fontWeight: 600
            }}>
              <GripVertical size={12} /> Drag cards to rearrange priority
            </span>
          )}
        </div>

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
            {activeFilter === 'archived'
              ? 'No archived tasks'
              : todos.length === 0
              ? 'Your workspace is ready'
              : 'No tasks found'}
          </h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '380px', margin: 0, lineHeight: 1.5 }}>
            {searchQuery
              ? `No tasks match "${searchQuery}".`
              : selectedCalendarDate
              ? `No tasks scheduled for ${selectedCalendarDate}.`
              : activeFilter === 'archived'
              ? 'No tasks in the archive yet. Tasks will be stored here automatically when their timeline completes or when midnight reset triggers.'
              : activeFilter === 'completed'
              ? 'No completed tasks yet. Finish a task to experience the celebration!'
              : todos.length === 0
              ? 'No tasks yet. Create your first task to begin organizing your workspace!'
              : 'Your workspace is clear! All tasks completed or deleted. Add a new task to keep building.'}
          </p>

          {activeFilter !== 'archived' && (
            <button
              onClick={onOpenCreateTodo}
              className="btn btn-primary btn-sm"
              style={{ marginTop: '6px' }}
            >
              <Plus size={15} /> {todos.length === 0 ? 'Create First Task' : 'Create Task'}
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {sortedTodos.map((todo, index) => {
            if (activeFilter === 'archived') {
              const project = projects.find(p => p.id === todo.project_id);
              return (
                <div
                  key={todo.id}
                  className="glass-panel"
                  style={{
                    padding: '14px 18px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '14px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                    <div style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      background: todo.completed ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-tertiary)',
                      color: todo.completed ? '#10b981' : 'var(--text-dim)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <CheckCircle2 size={15} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <h4 style={{
                        fontSize: '0.95rem',
                        fontWeight: 600,
                        margin: 0,
                        textDecoration: todo.completed ? 'line-through' : 'none',
                        color: todo.completed ? 'var(--text-muted)' : 'var(--text-main)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {todo.title}
                      </h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', fontSize: '0.75rem', color: 'var(--text-dim)', flexWrap: 'wrap' }}>
                        {todo.due_date && <span>📅 Due {todo.due_date}</span>}
                        {todo.due_time && <span>• ⏰ {todo.due_time}</span>}
                        {project && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            • <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: project.color || '#6366f1' }} /> {project.name}
                          </span>
                        )}
                        <span style={{ color: '#818cf8', fontWeight: 600 }}>• Archived</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    <button
                      onClick={() => restoreArchivedTodo(todo.id)}
                      className="btn btn-secondary btn-sm"
                      title="Restore task to active workspace"
                      style={{ fontSize: '0.75rem', gap: '5px', padding: '6px 12px' }}
                    >
                      <RotateCcw size={13} />
                      <span>Restore</span>
                    </button>
                    <button
                      onClick={() => deleteArchivedTodo(todo.id)}
                      className="btn-ghost"
                      title="Delete permanently from archives"
                      style={{ padding: '6px', borderRadius: '5px', color: 'var(--text-dim)' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-dim)'}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <TodoCard
                key={todo.id}
                todo={todo}
                index={index}
                isDragging={draggedIndex === index}
                isDragOver={dragOverIndex === index}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
                onDrop={handleDrop}
                canMoveUp={index > 0}
                canMoveDown={index < sortedTodos.length - 1}
                onMoveUp={() => handleMoveUp(index)}
                onMoveDown={() => handleMoveDown(index)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
