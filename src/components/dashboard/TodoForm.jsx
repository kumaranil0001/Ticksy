import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  X,
  Calendar,
  Clock,
  FolderKanban,
  Tag,
  Check,
  AlertCircle,
  Flame,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { useTodos } from '../../context/TodoContext';
import { getLocalDateString } from '../../lib/dateUtils';

export const TodoForm = ({
  isOpen = false,
  onClose,
  defaultDate = null,
  defaultProjectId = null,
  onSaved = null,
  // backwards compatibility
  onToggleOpen = null
}) => {
  const handleClose = React.useCallback(() => {
    if (onClose) onClose();
    else if (onToggleOpen) onToggleOpen(false);
  }, [onClose, onToggleOpen]);

  const { addTodo, projects, selectedCalendarDate } = useTodos();
  const titleInputRef = useRef(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState(() => defaultDate || selectedCalendarDate || getLocalDateString());
  const [dueTime, setDueTime] = useState('12:00');
  const [projectId, setProjectId] = useState(() => defaultProjectId || (projects[0]?.id ?? ''));
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successNotice, setSuccessNotice] = useState(false);

  // Sync date if defaultDate or selectedCalendarDate changes
  useEffect(() => {
    if (defaultDate) {
      setDueDate(defaultDate);
    } else if (selectedCalendarDate) {
      setDueDate(selectedCalendarDate);
    }
  }, [defaultDate, selectedCalendarDate]);

  // Sync defaultProjectId if changed
  useEffect(() => {
    if (defaultProjectId) {
      setProjectId(defaultProjectId);
    } else if (!projectId && projects.length > 0) {
      setProjectId(projects[0].id);
    }
  }, [defaultProjectId, projects, projectId]);

  // Lock background scroll when modal is open so the main window behind never scrolls
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  const handleSubmit = React.useCallback(async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!title.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const tags = tagInput
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);

      await addTodo({
        title: title.trim(),
        description: description.trim(),
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

      setTimeout(() => {
        setSuccessNotice(false);
        if (onSaved) onSaved();
        handleClose();
      }, 300);
    } catch (err) {
      console.error('Failed to create todo:', err);
    } finally {
      setIsSubmitting(false);
    }
  }, [title, description, isSubmitting, tagInput, addTodo, priority, dueDate, dueTime, projectId, onSaved, handleClose]);

  const handleSubmitRef = useRef(handleSubmit);
  handleSubmitRef.current = handleSubmit;

  const handleCloseRef = useRef(handleClose);
  handleCloseRef.current = handleClose;

  // Auto-focus title input strictly ONCE when modal opens
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      titleInputRef.current?.focus();
    }, 60);

    return () => clearTimeout(timer);
  }, [isOpen]);

  // Handle Escape and Ctrl+Enter keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleCloseRef.current();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSubmitRef.current(e);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleAddQuickTag = (tag) => {
    const clean = tag.replace(/^[^\w]+/, '').trim();
    const currentTags = tagInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    if (currentTags.includes(clean)) {
      setTagInput(currentTags.filter(t => t !== clean).join(', '));
    } else {
      setTagInput([...currentTags, clean].join(', '));
    }
  };

  // If not open, render nothing (completely removes the Photo 2 collapsed banner)
  if (!isOpen) return null;

  const priorityOptions = [
    { id: 'urgent', label: 'Urgent', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.12)', border: '#ef4444', icon: Flame },
    { id: 'high', label: 'High', color: '#f97316', bg: 'rgba(249, 115, 22, 0.12)', border: '#f97316', icon: AlertCircle },
    { id: 'medium', label: 'Medium', color: '#6366f1', bg: 'rgba(99, 102, 241, 0.12)', border: '#6366f1', icon: Clock },
    { id: 'low', label: 'Low', color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)', border: '#10b981', icon: CheckCircle2 }
  ];

  const quickTags = ['Launch', 'Dev', 'Design', 'Urgent', 'Review'];

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '640px',
          width: '92%',
          borderRadius: '20px',
          padding: 0,
          overflow: 'hidden',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.5), 0 0 0 1px var(--border-card)',
          maxHeight: 'min(90vh, 760px)',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Modal Top Header (Fixed/Sticky at top of modal) */}
        <div style={{
          padding: '20px 28px 18px 28px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-secondary)',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 52%, #06b6d4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
              color: '#ffffff',
              flexShrink: 0
            }}>
              <Plus size={22} strokeWidth={2.8} />
            </div>

            <div>
              <h3 style={{
                fontSize: '1.2rem',
                fontWeight: 800,
                color: 'var(--text-main)',
                letterSpacing: '-0.02em',
                lineHeight: 1.2
              }}>
                Create New Task
              </h3>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Fill in details, set priority, schedule deadline, and assign workspace.
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="modal-close-btn"
            title="Close (Esc)"
            type="button"
          >
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>

        {/* Modal Form: Flex container containing scrollable field area and fixed footer */}
        <form
          onSubmit={handleSubmit}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
            overflow: 'hidden'
          }}
        >
          {/* Scrollable Form Body */}
          <div
            className="modal-scroll-body"
            style={{
              flex: 1,
              overflowY: 'auto',
              overscrollBehavior: 'contain',
              padding: '22px 28px 16px 28px'
            }}
          >
            {/* Task Title */}
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label className="form-label" style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-main)' }}>
                  Task Title <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Required</span>
              </div>
              <input
                ref={titleInputRef}
                type="text"
                className="form-input"
                placeholder="e.g., Finalize Q4 Product Roadmap & Deploy to Vercel"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                style={{
                  fontSize: '1rem',
                  fontWeight: 600,
                  padding: '11px 16px',
                  borderRadius: 'var(--radius-md)'
                }}
              />
            </div>

            {/* Description */}
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                  Description
                </label>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Optional</span>
              </div>
              <textarea
                className="form-textarea"
                placeholder="Add key notes, checklist criteria, context, or links..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                style={{
                  borderRadius: 'var(--radius-md)',
                  minHeight: '70px',
                  resize: 'vertical',
                  fontSize: '0.9rem'
                }}
              />
            </div>

            {/* Priority Level (Modernized 4-pill selector) */}
            <div className="form-group" style={{ marginBottom: '18px' }}>
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '8px' }}>
                Priority Level
              </label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '10px'
              }}>
                {priorityOptions.map((opt) => {
                  const isSelected = priority === opt.id;
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setPriority(opt.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '7px',
                        padding: '9px 8px',
                        borderRadius: 'var(--radius-md)',
                        background: isSelected ? opt.bg : 'var(--bg-tertiary)',
                        border: `1.5px solid ${isSelected ? opt.border : 'var(--border-card)'}`,
                        color: isSelected ? opt.color : 'var(--text-muted)',
                        fontWeight: isSelected ? 700 : 500,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                        boxShadow: isSelected ? `0 2px 8px ${opt.color}25` : 'none'
                      }}
                    >
                      <Icon size={14} strokeWidth={2.5} />
                      <span>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Schedule & Project Assignment (3-column responsive grid) */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '14px',
              marginBottom: '16px'
            }}>
              {/* Due Date */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, fontSize: '0.825rem' }}>
                  <Calendar size={13} style={{ color: 'var(--accent-glow)' }} /> Due Date
                </label>
                <input
                  type="date"
                  className="form-input"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                  style={{ padding: '9px 12px', fontSize: '0.875rem' }}
                />
              </div>

              {/* Due Time */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, fontSize: '0.825rem' }}>
                  <Clock size={13} style={{ color: 'var(--accent-glow)' }} /> Due Time
                </label>
                <input
                  type="time"
                  className="form-input"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  style={{ padding: '9px 12px', fontSize: '0.875rem' }}
                />
              </div>

              {/* Project Workspace */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, fontSize: '0.825rem' }}>
                  <FolderKanban size={13} style={{ color: '#a855f7' }} /> Project
                </label>
                <select
                  className="form-select"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  style={{ padding: '9px 12px', fontSize: '0.875rem' }}
                >
                  <option value="">📁 General</option>
                  {projects.map((proj) => (
                    <option key={proj.id} value={proj.id}>
                      📁 {proj.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tags with Quick Suggestions */}
            <div className="form-group" style={{ marginBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, fontSize: '0.825rem', margin: 0 }}>
                  <Tag size={13} style={{ color: '#06b6d4' }} /> Tags
                </label>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Comma separated</span>
              </div>

              <input
                type="text"
                className="form-input"
                placeholder="e.g., Supabase, Vercel, Sprint"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                style={{ padding: '9px 14px', fontSize: '0.875rem' }}
              />

              {/* Quick Tag Suggestion Chips */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.725rem', color: 'var(--text-dim)' }}>Quick add:</span>
                {quickTags.map((tag) => {
                  const isPresent = tagInput.toLowerCase().includes(tag.toLowerCase());
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleAddQuickTag(tag)}
                      style={{
                        fontSize: '0.75rem',
                        padding: '3px 9px',
                        borderRadius: 'var(--radius-full)',
                        background: isPresent ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-tertiary)',
                        border: `1px solid ${isPresent ? 'var(--accent-glow)' : 'var(--border-subtle)'}`,
                        color: isPresent ? 'var(--accent-glow)' : 'var(--text-muted)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      +{tag}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Modal Footer Actions (Fixed/Sticky at bottom of modal - ALWAYS visible, never cut off!) */}
          <div style={{
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid var(--border-subtle)',
            padding: '16px 28px',
            background: 'var(--bg-secondary)',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            {/* Keyboard shortcut hint */}
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>Press <kbd style={{ padding: '2px 5px', borderRadius: '4px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-card)', fontSize: '0.7rem' }}>Esc</kbd> to exit</span>
              <span>&bull;</span>
              <span><kbd style={{ padding: '2px 5px', borderRadius: '4px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-card)', fontSize: '0.7rem' }}>Ctrl+Enter</kbd> to save</span>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleClose}
                style={{
                  height: '40px',
                  padding: '0 16px',
                  fontSize: '0.875rem',
                  color: 'var(--text-muted)'
                }}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
                style={{
                  height: '40px',
                  padding: '0 20px',
                  fontSize: '0.875rem',
                  gap: '8px',
                  background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 52%, #06b6d4 100%)',
                  borderColor: 'transparent',
                  boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
                  color: '#ffffff'
                }}
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw size={15} className="spin" />
                    <span>Creating...</span>
                  </>
                ) : successNotice ? (
                  <>
                    <Check size={16} strokeWidth={2.5} />
                    <span>Saved!</span>
                  </>
                ) : (
                  <>
                    <Plus size={16} strokeWidth={2.8} />
                    <span>Create Task</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
