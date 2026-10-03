import React from 'react';
import {
  Clock,
  AlertTriangle,
  Calendar,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  Inbox
} from 'lucide-react';
import { useTodos } from '../../context/TodoContext';
import { TodoCard } from './TodoCard';

export const ScheduleView = () => {
  const { todos } = useTodos();

  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  const nextWeekStr = nextWeek.toISOString().split('T')[0];

  const overdue = todos.filter(t => t.due_date && t.due_date < todayStr && !t.completed);
  const todayTasks = todos.filter(t => t.due_date === todayStr);
  const tomorrowTasks = todos.filter(t => t.due_date === tomorrowStr);
  const thisWeekTasks = todos.filter(t => t.due_date > tomorrowStr && t.due_date <= nextWeekStr);
  const futureTasks = todos.filter(t => t.due_date > nextWeekStr);
  const unscheduled = todos.filter(t => !t.due_date);

  const sections = [
    {
      id: 'overdue',
      title: 'Attention Needed (Overdue)',
      description: 'Tasks that passed their scheduled due dates',
      icon: AlertTriangle,
      color: '#ef4444',
      bg: 'rgba(239, 68, 68, 0.08)',
      tasks: overdue,
      showIfEmpty: false
    },
    {
      id: 'today',
      title: 'Today’s Agenda',
      description: 'Top priorities locked in for today',
      icon: Clock,
      color: '#22d3ee',
      bg: 'rgba(6, 182, 212, 0.08)',
      tasks: todayTasks,
      showIfEmpty: true
    },
    {
      id: 'tomorrow',
      title: 'Tomorrow',
      description: 'Upcoming runway for tomorrow',
      icon: Calendar,
      color: '#818cf8',
      bg: 'rgba(99, 102, 241, 0.08)',
      tasks: tomorrowTasks,
      showIfEmpty: true
    },
    {
      id: 'thisWeek',
      title: 'Later This Week',
      description: 'Scheduled within the next 7 days',
      icon: Sparkles,
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.08)',
      tasks: thisWeekTasks,
      showIfEmpty: false
    },
    {
      id: 'future',
      title: 'Future Horizon',
      description: 'Scheduled further out',
      icon: ChevronRight,
      color: '#f59e0b',
      bg: 'rgba(245, 158, 11, 0.08)',
      tasks: futureTasks,
      showIfEmpty: false
    },
    {
      id: 'unscheduled',
      title: 'Backlog / Someday',
      description: 'Tasks without a specific target date',
      icon: Inbox,
      color: '#94a3b8',
      bg: 'rgba(255, 255, 255, 0.04)',
      tasks: unscheduled,
      showIfEmpty: false
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Top Header */}
      <div className="glass-panel" style={{
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: '14px'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '12px',
          background: 'rgba(6, 182, 212, 0.15)',
          color: '#22d3ee',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Clock size={22} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Schedule Timeline</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Sequential breakdown of daily workload and time-sensitive milestones
          </p>
        </div>
      </div>

      {/* Sections */}
      {sections.map((section) => {
        if (!section.showIfEmpty && section.tasks.length === 0) return null;
        const Icon = section.icon;

        return (
          <div key={section.id}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '14px',
              paddingBottom: '8px',
              borderBottom: '1px solid var(--border-subtle)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  background: section.bg,
                  color: section.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Icon size={16} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                    {section.title}
                  </h3>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                    {section.description}
                  </span>
                </div>
              </div>

              <span style={{
                fontSize: '0.8rem',
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                background: section.bg,
                color: section.color,
                border: `1px solid ${section.color}35`
              }}>
                {section.tasks.length} {section.tasks.length === 1 ? 'task' : 'tasks'}
              </span>
            </div>

            {section.tasks.length === 0 ? (
              <div style={{
                padding: '20px',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px dashed var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-dim)',
                fontSize: '0.85rem',
                textAlign: 'center'
              }}>
                No tasks scheduled for this period.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {section.tasks.map(todo => (
                  <TodoCard key={todo.id} todo={todo} />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
