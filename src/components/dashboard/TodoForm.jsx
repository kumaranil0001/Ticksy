import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  X,
  Calendar,
  Clock,
  FolderKanban,
  Tag,
  Check,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useTodos } from '../../context/TodoContext';
import { PRIORITY_CONFIG } from '../../constants/mockData';

export const TodoForm = ({
  defaultDate = null,
  defaultProjectId = null,
  onSaved = null,
  isOpen: controlledIsOpen = undefined,
  onToggleOpen = null
}) => {
  const { addTodo, projects, selectedCalendarDate } = useTodos();
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;

  const setIsOpen = (val) => {
    const nextVal = typeof val === 'function' ? val(isOpen) : val;
    if (onToggleOpen) {
      onToggleOpen(nextVal);
    } else {
      setInternalIsOpen(nextVal);
    }
  };

  const titleInputRef = useRef(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState(defaultDate || selectedCalendarDate || new Date().toISOString().split('T')[0]);
  const [dueTime, setDueTime] = useState('12:00');
  const [projectId, setProjectId] = useState(defaultProjectId || (projects[0]?.id ?? ''));
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successNotice, setSuccessNotice] = useState(false);

  // Auto-focus title input when form opens
  useEffect(() => {
    if (isOpen && titleInputRef.current) {
      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Sync date if calendar date changes
  useEffect(() => {
    if (selectedCalendarDate) {
      setDueDate(selectedCalendarDate);
    }
  }, [selectedCalendarDate]);

  useEffect(() => {
    if (!projectId && projects.length > 0) {
      setProjectId(projects[0].id);
    }
  }, [projects, projectId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      const tags = tagInput
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);

      await addTodo({
        title,
        description,
        priority,
        due_date: dueDate,
        due_time: dueTime,
        project_id: projectId || null,
        tags
      });

      // Reset form
      setTitle('');
      setDescription('');
      setTagInput('');
      setSuccessNotice(true);
      setTimeout(() => setSuccessNotice(false), 2000);

      if (onSaved) onSaved();
      setIsOpen(false);
    } catch (err) {
      console.error('Failed to create todo:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass-panel" style={{
      marginBottom: '28px',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border-card)',
      overflow: 'hidden',
      transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
    }}>
      {/* Header bar / Toggle */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          background: isOpen ? 'var(--bg-secondary)' : 'transparent',
          borderBottom: isOpen ? '1px solid var(--border-subtle)' : 'none',
          transition: 'background 0.2s ease'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: isOpen ? 'var(--accent-primary)' : 'var(--text-main)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--bg-primary)',
            transition: 'all 0.2s ease'
          }}>
            {isOpen ? <ChevronUp size={18} strokeWidth={2.5} /> : <Plus size={16} strokeWidth={2.5} />}
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>
              {isOpen ? 'New Task Scope & Schedule' : 'Create New Task'}
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {isOpen ? 'Fill in details, select project & priority, and save' : 'Click to add a task to your workspace'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {successNotice && (
            <span style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Check size={16} /> Saved!
            </span>
          )}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              background: isOpen ? 'var(--bg-card)' : 'var(--bg-tertiary)',
              color: isOpen ? 'var(--text-muted)' : 'var(--text-main)',
              border: '1px solid var(--border-card)',
              fontSize: '0.825rem',
              fontWeight: 600,
              boxShadow: 'var(--shadow-sm)',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            {isOpen ? (
              <>
                <X size={13} strokeWidth={2.5} />
                <span>Close</span>
              </>
            ) : (
              <>
                <Plus size={13} strokeWidth={2.5} />
                <span>New Task</span>
              </>
            )}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform: isOpen ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.2s ease'
            }}>
              <ChevronDown size={14} strokeWidth={2.5} />
            </div>
          </div>
        </div>
      </div>

      {/* Collapsible Form Body */}
      {isOpen && (
        <form onSubmit={handleSubmit} style={{ padding: '0 24px 24px 24px' }}>
          <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '12px 0 20px 0' }} />

          {/* Title */}
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 600 }}>Task Title *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g., Finalize Q4 Product Roadmap & Deploy to Vercel"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
              style={{ fontSize: '1rem', fontWeight: 500 }}
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Description (Optional)</label>
            <textarea
              className="form-textarea"
              placeholder="Add key notes, acceptance criteria, or links..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Priority Selection */}
          <div className="form-group">
            <label className="form-label">Priority Level</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '8px' }}>
              {Object.entries(PRIORITY_CONFIG).map(([key, config]) => {
                const isSelected = priority === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setPriority(key)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-md)',
                      background: isSelected ? config.bg : 'rgba(255, 255, 255, 0.03)',
                      border: `1px solid ${isSelected ? config.color : 'var(--border-card)'}`,
                      color: isSelected ? config.color : 'var(--text-muted)',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: config.color }} />
                    <span>{config.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Due Date, Time & Project Selector */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '16px',
            marginBottom: '16px'
          }}>
            {/* Due Date */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={14} /> Due Date
              </label>
              <input
                type="date"
                className="form-input"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </div>

            {/* Due Time */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={14} /> Due Time
              </label>
              <input
                type="time"
                className="form-input"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
              />
            </div>

            {/* Project */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FolderKanban size={14} /> Project Workspace
              </label>
              <select
                className="form-select"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
              >
                <option value="">📁 General (No Project)</option>
                {projects.map((proj) => (
                  <option key={proj.id} value={proj.id}>
                    📁 {proj.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tags */}
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Tag size={14} /> Tags (Comma separated)
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Supabase, Vercel, Urgent, Sprint"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsOpen(false)}
              style={{
                padding: '0 18px',
                height: '42px',
                color: 'var(--text-muted)',
                gap: '6px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#ef4444';
                e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-muted)';
                e.currentTarget.style.borderColor = 'var(--border-card)';
              }}
            >
              <X size={15} strokeWidth={2.2} />
              <span>Cancel</span>
            </button>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
              style={{ minWidth: '140px', height: '42px', gap: '8px' }}
            >
              {isSubmitting ? (
                'Saving...'
              ) : (
                <>
                  <Plus size={16} strokeWidth={2.5} />
                  <span>Create Task</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
