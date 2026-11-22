import React, { useState } from 'react';
import {
  Check,
  Calendar,
  Clock,
  Trash2,
  Edit2,
  FolderKanban,
  Save,
  X,
  GripVertical,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { useTodos } from '../../context/TodoContext';
import { PRIORITY_CONFIG } from '../../constants/mockData';

export const TodoCard = ({
  todo,
  index,
  isDragging = false,
  isDragOver = false,
  onDragStart,
  onDragOver,
  onDragEnd,
  onDrop,
  onMoveUp,
  onMoveDown,
  canMoveUp = false,
  canMoveDown = false
}) => {
  const { toggleTodo, deleteTodo, updateTodo, projects } = useTodos();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [editDesc, setEditDesc] = useState(todo.description || '');
  const [editPriority, setEditPriority] = useState(todo.priority || 'medium');
  const [editDueDate, setEditDueDate] = useState(todo.due_date || '');
  const [editProjectId, setEditProjectId] = useState(todo.project_id || '');

  const project = projects.find(p => p.id === todo.project_id);
  const priorityConfig = PRIORITY_CONFIG[todo.priority] || PRIORITY_CONFIG.medium;

  // Due date status calculation
  const todayStr = new Date().toISOString().split('T')[0];
  const isOverdue = todo.due_date && todo.due_date < todayStr && !todo.completed;
  const isToday = todo.due_date === todayStr;

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editTitle.trim()) return;
    updateTodo(todo.id, {
      title: editTitle.trim(),
      description: editDesc.trim(),
      priority: editPriority,
      due_date: editDueDate,
      project_id: editProjectId || null
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    setIsDeleting(true);
    setTimeout(() => {
      deleteTodo(todo.id);
    }, 200);
  };

  // Quick priority cycle
  const handleCyclePriority = () => {
    const sequence = ['urgent', 'high', 'medium', 'low'];
    const currentIdx = sequence.indexOf(todo.priority || 'medium');
    const nextPriority = sequence[(currentIdx + 1) % sequence.length];
    updateTodo(todo.id, { priority: nextPriority });
  };

  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return 'No Date';
    if (dateStr === todayStr) return 'Today';
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (dateStr === tomorrow.toISOString().split('T')[0]) return 'Tomorrow';

    try {
      const [year, month, day] = dateStr.split('-');
      const d = new Date(year, month - 1, day);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div
      className={`glass-panel todo-draggable-card ${isDragging ? 'todo-card-dragging' : ''} ${isDragOver ? 'todo-card-drag-over' : ''}`}
      draggable={!isEditing}
      onDragStart={onDragStart ? (e) => onDragStart(e, index) : undefined}
      onDragOver={onDragOver ? (e) => onDragOver(e, index) : undefined}
      onDragEnd={onDragEnd}
      onDrop={onDrop ? (e) => onDrop(e, index) : undefined}
      style={{
        padding: '16px 20px',
        borderRadius: 'var(--radius-md)',
        background: todo.completed
          ? 'var(--bg-secondary)'
          : isOverdue
          ? 'rgba(239, 68, 68, 0.03)'
          : 'var(--bg-card)',
        border: `1px solid ${
          isDragOver
            ? '#6366f1'
            : isDragging
            ? 'var(--accent-primary)'
            : todo.completed
            ? 'var(--border-subtle)'
            : isOverdue
            ? 'rgba(239, 68, 68, 0.25)'
            : 'var(--border-card)'
        }`,
        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        opacity: isDeleting ? 0 : isDragging ? 0.35 : todo.completed ? 0.65 : 1,
        transform: isDeleting
          ? 'translateX(20px) scale(0.98)'
          : isDragging
          ? 'scale(0.98)'
          : isDragOver
          ? 'translateY(-2px)'
          : 'none',
        boxShadow: isDragOver
          ? '0 0 0 2px rgba(99, 102, 241, 0.3), 0 8px 16px rgba(0, 0, 0, 0.12)'
          : undefined,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Priority accent side indicator */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        width: '3px',
        background: todo.completed ? 'var(--border-card)' : priorityConfig.color
      }} />

      {isEditing ? (
        /* Inline Edit Form */
        <form onSubmit={handleSaveEdit}>
          <div className="form-group" style={{ marginBottom: '10px' }}>
            <input
              type="text"
              className="form-input"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group" style={{ marginBottom: '10px' }}>
            <textarea
              className="form-textarea"
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              placeholder="Task description..."
              rows={2}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px', marginBottom: '12px' }}>
            <div>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Priority</label>
              <select
                className="form-select"
                value={editPriority}
                onChange={(e) => setEditPriority(e.target.value)}
                style={{ padding: '6px 10px', fontSize: '0.825rem' }}
              >
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Due Date</label>
              <input
                type="date"
                className="form-input"
                value={editDueDate}
                onChange={(e) => setEditDueDate(e.target.value)}
                style={{ padding: '6px 10px', fontSize: '0.825rem' }}
              />
            </div>

            <div>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Project</label>
              <select
                className="form-select"
                value={editProjectId}
                onChange={(e) => setEditProjectId(e.target.value)}
                style={{ padding: '6px 10px', fontSize: '0.825rem' }}
              >
                <option value="">No Project</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setIsEditing(false)}>
              <X size={14} /> Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm">
              <Save size={14} /> Save
            </button>
          </div>
        </form>
      ) : (
        /* Regular View Mode */
        <div>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
            {/* Left section: Drag handle + Checkbox + Title */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', flex: 1 }}>
              {/* Drag Grip Handle */}
              <div
                className="todo-drag-handle"
                title="Drag to rearrange priority"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-dim)',
                  cursor: 'grab',
                  padding: '2px',
                  borderRadius: '4px',
                  marginTop: '2px',
                  flexShrink: 0
                }}
              >
                <GripVertical size={16} />
              </div>

              {/* Checkbox button */}
              <button
                type="button"
                onClick={() => toggleTodo(todo.id)}
                title={todo.completed ? "Mark pending" : "Mark completed"}
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '5px',
                  border: todo.completed ? 'none' : '1.5px solid var(--border-card)',
                  background: todo.completed ? 'var(--text-main)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--bg-primary)',
                  cursor: 'pointer',
                  flexShrink: 0,
                  marginTop: '2px',
                  transition: 'all 0.15s ease'
                }}
              >
                {todo.completed && <Check size={14} strokeWidth={3} />}
              </button>

              <div style={{ flex: 1, minWidth: 0 }}>
                <h4 style={{
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  color: todo.completed ? 'var(--text-dim)' : 'var(--text-main)',
                  textDecoration: todo.completed ? 'line-through' : 'none',
                  lineHeight: 1.4,
                  wordBreak: 'break-word',
                  transition: 'color 0.15s ease'
                }}>
                  {todo.title}
                </h4>

                {todo.description && (
                  <p style={{
                    fontSize: '0.825rem',
                    color: 'var(--text-muted)',
                    marginTop: '3px',
                    lineHeight: 1.5,
                    textDecoration: todo.completed ? 'line-through' : 'none',
                    opacity: todo.completed ? 0.6 : 0.85,
                    wordBreak: 'break-word'
                  }}>
                    {todo.description}
                  </p>
                )}
              </div>
            </div>

            {/* Right section: Move Up/Down buttons + Edit + Delete */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
              {/* Move Up */}
              {onMoveUp && canMoveUp && (
                <button
                  onClick={onMoveUp}
                  className="btn-ghost todo-reorder-btn"
                  title="Move priority up"
                  style={{ padding: '4px', borderRadius: '4px', color: 'var(--text-dim)' }}
                >
                  <ChevronUp size={14} />
                </button>
              )}

              {/* Move Down */}
              {onMoveDown && canMoveDown && (
                <button
                  onClick={onMoveDown}
                  className="btn-ghost todo-reorder-btn"
                  title="Move priority down"
                  style={{ padding: '4px', borderRadius: '4px', color: 'var(--text-dim)' }}
                >
                  <ChevronDown size={14} />
                </button>
              )}

              {/* Edit */}
              <button
                onClick={() => setIsEditing(true)}
                className="btn-ghost"
                title="Edit task"
                style={{ padding: '5px', borderRadius: '5px', color: 'var(--text-dim)' }}
              >
                <Edit2 size={14} />
              </button>

              {/* Delete */}
              <button
                onClick={handleDelete}
                className="btn-ghost"
                title="Delete task"
                style={{ padding: '5px', borderRadius: '5px', color: 'var(--text-dim)' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-dim)'}
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          {/* Footer Metadata: Due Date, Project, Priority, Tags */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '8px',
            marginTop: '10px',
            paddingLeft: '48px',
            fontSize: '0.75rem'
          }}>
            {/* Due Date Badge */}
            {todo.due_date && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                background: isOverdue
                  ? 'rgba(239, 68, 68, 0.08)'
                  : isToday
                  ? 'var(--bg-tertiary)'
                  : 'var(--bg-tertiary)',
                color: isOverdue
                  ? '#ef4444'
                  : 'var(--text-muted)',
                border: `1px solid ${isOverdue ? 'rgba(239, 68, 68, 0.25)' : 'var(--border-card)'}`,
                fontWeight: 500
              }}>
                <Calendar size={11} />
                <span>{formatDisplayDate(todo.due_date)}</span>
                {todo.due_time && <span>• {todo.due_time}</span>}
                {isOverdue && <span style={{ color: '#ef4444' }}>(Overdue)</span>}
              </div>
            )}

            {/* Project Tag */}
            {project && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--bg-tertiary)',
                color: 'var(--text-muted)',
                border: '1px solid var(--border-card)',
                fontWeight: 500
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: project.color }} />
                <span>{project.name}</span>
              </div>
            )}

            {/* Priority Badge with Quick Cycle Click */}
            <div
              onClick={handleCyclePriority}
              title="Click to cycle priority level (Urgent → High → Medium → Low)"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                background: priorityConfig.bg,
                color: priorityConfig.color,
                border: `1px solid ${priorityConfig.border}`,
                fontWeight: 600,
                cursor: 'pointer',
                userSelect: 'none'
              }}
            >
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: priorityConfig.color }} />
              <span>{priorityConfig.label}</span>
            </div>

            {/* Tags */}
            {todo.tags && todo.tags.length > 0 && todo.tags.map((tag, i) => (
              <span
                key={i}
                style={{
                  color: 'var(--text-dim)',
                  background: 'var(--bg-tertiary)',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontSize: '0.7rem'
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
