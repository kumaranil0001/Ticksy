import React, { useState } from 'react';
import {
  FolderKanban,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Layers,
  Rocket,
  Palette,
  Heart,
  Zap,
  Flame,
  ArrowRight,
  X
} from 'lucide-react';
import { useTodos } from '../../context/TodoContext';

const AVAILABLE_COLORS = [
  '#6366f1', // Indigo
  '#06b6d4', // Cyan
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#8b5cf6', // Violet
  '#ef4444', // Red
];

const AVAILABLE_ICONS = [
  { id: 'folder', label: 'Folder', icon: FolderKanban },
  { id: 'rocket', label: 'Rocket', icon: Rocket },
  { id: 'palette', label: 'Design', icon: Palette },
  { id: 'heart', label: 'Life', icon: Heart },
  { id: 'zap', label: 'Sprint', icon: Zap },
  { id: 'flame', label: 'Urgent', icon: Flame },
  { id: 'layers', label: 'Stack', icon: Layers }
];

export const ProjectsView = ({ onSelectProject }) => {
  const { projects, todos, addProject, deleteProject } = useTodos();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(AVAILABLE_COLORS[0]);
  const [selectedIcon, setSelectedIcon] = useState('folder');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await addProject({
        name: name.trim(),
        description: description.trim(),
        color,
        icon: selectedIcon
      });
      setName('');
      setDescription('');
      setShowCreateModal(false);
    } catch (err) {
      console.error('Failed to create project:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getProjectIcon = (iconName) => {
    const found = AVAILABLE_ICONS.find(i => i.id === iconName);
    return found ? found.icon : FolderKanban;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Header */}
      <div className="glass-panel" style={{
        padding: '20px 24px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'rgba(99, 102, 241, 0.15)',
            color: '#818cf8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <FolderKanban size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>
              Project Workspaces
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Compartmentalize your tasks by client, domain, or personal milestones
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary"
          style={{ gap: '8px' }}
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>New Project</span>
        </button>
      </div>

      {/* Projects Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '20px'
      }}>
        {projects.map((proj) => {
          const projTodos = todos.filter(t => t.project_id === proj.id);
          const completedCount = projTodos.filter(t => t.completed).length;
          const totalCount = projTodos.length;
          const percentage = totalCount ? Math.round((completedCount / totalCount) * 100) : 0;
          const IconComp = getProjectIcon(proj.icon);

          return (
            <div
              key={proj.id}
              className="glass-panel"
              style={{
                padding: '24px',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-card)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.25s ease',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = `${proj.color}60`;
                e.currentTarget.style.transform = 'translateY(-3px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-card)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {/* Top Accent Strip */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: proj.color
              }} />

              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    background: `${proj.color}20`,
                    color: proj.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: `1px solid ${proj.color}40`
                  }}>
                    <IconComp size={20} />
                  </div>

                  <button
                    onClick={() => {
                      if (confirm(`Delete project "${proj.name}"? Tasks will become unassigned.`)) {
                        deleteProject(proj.id);
                      }
                    }}
                    className="btn-ghost"
                    title="Delete project"
                    style={{ padding: '6px', borderRadius: '50%', color: 'var(--text-dim)' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '6px' }}>
                  {proj.name}
                </h3>
                {proj.description && (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '18px' }}>
                    {proj.description}
                  </p>
                )}

                {/* Progress bar */}
                <div style={{ marginTop: '16px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '6px' }}>
                    <span>Progress</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{percentage}%</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                    <div style={{
                      width: `${percentage}%`,
                      height: '100%',
                      background: proj.color,
                      borderRadius: 'var(--radius-full)',
                      transition: 'width 0.4s ease'
                    }} />
                  </div>
                </div>

                {/* Task counts */}
                <div style={{ display: 'flex', gap: '16px', fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Layers size={13} /> {totalCount} total
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#34d399' }}>
                    <CheckCircle2 size={13} /> {completedCount} done
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#fbbf24' }}>
                    <Clock size={13} /> {totalCount - completedCount} open
                  </span>
                </div>
              </div>

              {/* View Project Tasks CTA */}
              <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
                <button
                  onClick={() => onSelectProject(proj.id)}
                  className="btn btn-secondary btn-sm"
                  style={{ width: '100%', justifyContent: 'center', gap: '6px' }}
                >
                  <span>View Project Tasks</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'var(--accent-gradient)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white'
                }}>
                  <FolderKanban size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>New Project Workspace</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Define goals & color aesthetics</p>
                </div>
              </div>
              <button className="btn-ghost" onClick={() => setShowCreateModal(false)} style={{ padding: '6px', borderRadius: '50%' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">Project Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Mobile App Redesign"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description (Optional)</label>
                <textarea
                  className="form-textarea"
                  placeholder="What is the objective of this project?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                />
              </div>

              {/* Color Selection */}
              <div className="form-group">
                <label className="form-label">Accent Theme Color</label>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {AVAILABLE_COLORS.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: c,
                        border: color === c ? '3px solid #ffffff' : 'none',
                        cursor: 'pointer',
                        transform: color === c ? 'scale(1.15)' : 'scale(1)',
                        transition: 'all 0.2s ease',
                        boxShadow: color === c ? `0 0 14px ${c}` : 'none'
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Icon Selection */}
              <div className="form-group">
                <label className="form-label">Project Icon</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {AVAILABLE_ICONS.map(ic => {
                    const IcComponent = ic.icon;
                    const isSelected = selectedIcon === ic.id;
                    return (
                      <button
                        key={ic.id}
                        type="button"
                        onClick={() => setSelectedIcon(ic.id)}
                        className="btn btn-ghost"
                        style={{
                          padding: '8px 12px',
                          borderRadius: 'var(--radius-md)',
                          background: isSelected ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                          border: isSelected ? '1px solid var(--accent-glow)' : '1px solid transparent',
                          color: isSelected ? '#ffffff' : 'var(--text-muted)',
                          gap: '6px'
                        }}
                      >
                        <IcComponent size={16} />
                        <span style={{ fontSize: '0.8rem' }}>{ic.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
