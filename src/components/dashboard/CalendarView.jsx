import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
  CheckCircle2,
  Clock,
  Sparkles,
  Inbox
} from 'lucide-react';
import { useTodos } from '../../context/TodoContext';
import { TodoCard } from './TodoCard';
import { TodoForm } from './TodoForm';

export const CalendarView = () => {
  const { todos, selectedCalendarDate, setSelectedCalendarDate } = useTodos();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showAddForm, setShowAddForm] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Calculate calendar days
  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthTotalDays = new Date(year, month, 0).getDate();

  const prevMonthDays = [];
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    prevMonthDays.push({
      day: prevMonthTotalDays - i,
      monthOffset: -1,
      isCurrentMonth: false
    });
  }

  const currentMonthDays = [];
  for (let i = 1; i <= totalDaysInMonth; i++) {
    const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    const dayTodos = todos.filter(t => t.due_date === formattedDate);
    const hasUrgent = dayTodos.some(t => (t.priority === 'urgent' || t.priority === 'high') && !t.completed);
    const allDone = dayTodos.length > 0 && dayTodos.every(t => t.completed);

    currentMonthDays.push({
      day: i,
      dateString: formattedDate,
      isCurrentMonth: true,
      todos: dayTodos,
      hasUrgent,
      allDone
    });
  }

  // Next month padding days to fill 35 or 42 cells grid
  const totalGridCells = (prevMonthDays.length + currentMonthDays.length) <= 35 ? 35 : 42;
  const nextMonthDaysCount = totalGridCells - (prevMonthDays.length + currentMonthDays.length);
  const nextMonthDays = [];
  for (let i = 1; i <= nextMonthDaysCount; i++) {
    nextMonthDays.push({
      day: i,
      monthOffset: 1,
      isCurrentMonth: false
    });
  }

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const jumpToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedCalendarDate(today.toISOString().split('T')[0]);
  };

  // Determine active date: defaults to selectedCalendarDate or today's ISO string
  const todayStr = new Date().toISOString().split('T')[0];
  const activeDate = selectedCalendarDate || todayStr;
  const activeDateTodos = todos.filter(t => t.due_date === activeDate);

  const formatHeaderDate = (isoStr) => {
    try {
      const [y, m, d] = isoStr.split('-');
      const obj = new Date(y, m - 1, d);
      return obj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    } catch {
      return isoStr;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Calendar Header Bar */}
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
            background: 'rgba(6, 182, 212, 0.15)',
            color: '#22d3ee',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <CalendarIcon size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>
              {monthNames[month]} {year}
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Click any date to see scheduled tasks for that day
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={jumpToToday} className="btn btn-secondary btn-sm">
            Jump to Today
          </button>
          <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255, 255, 255, 0.05)', borderRadius: 'var(--radius-md)', padding: '2px' }}>
            <button onClick={prevMonth} className="btn-ghost" style={{ padding: '8px', borderRadius: 'var(--radius-sm)' }}>
              <ChevronLeft size={18} />
            </button>
            <button onClick={nextMonth} className="btn-ghost" style={{ padding: '8px', borderRadius: 'var(--radius-sm)' }}>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid & Selected Day Container */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(320px, 1.35fr) minmax(280px, 1fr)',
        gap: '24px',
        alignItems: 'start'
      }}>
        {/* Left: The Month Grid */}
        <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-lg)' }}>
          {/* Day Headers */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '8px',
            textAlign: 'center',
            fontWeight: 600,
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
            marginBottom: '12px'
          }}>
            {daysOfWeek.map(d => (
              <div key={d} style={{ padding: '6px 0' }}>{d}</div>
            ))}
          </div>

          {/* Days Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '8px'
          }}>
            {/* Prev month placeholder days */}
            {prevMonthDays.map((p, i) => (
              <div
                key={`prev-${i}`}
                style={{
                  minHeight: '68px',
                  padding: '8px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255, 255, 255, 0.01)',
                  opacity: 0.25,
                  fontSize: '0.85rem'
                }}
              >
                {p.day}
              </div>
            ))}

            {/* Current month days */}
            {currentMonthDays.map((item) => {
              const isSelected = activeDate === item.dateString;
              const isToday = todayStr === item.dateString;
              const count = item.todos.length;

              return (
                <div
                  key={item.dateString}
                  onClick={() => {
                    setSelectedCalendarDate(item.dateString);
                    setShowAddForm(false);
                  }}
                  style={{
                    minHeight: '68px',
                    padding: '8px',
                    borderRadius: 'var(--radius-md)',
                    background: isSelected
                      ? 'rgba(99, 102, 241, 0.25)'
                      : isToday
                      ? 'rgba(6, 182, 212, 0.12)'
                      : 'rgba(255, 255, 255, 0.03)',
                    border: `1px solid ${
                      isSelected
                        ? 'var(--accent-glow)'
                        : isToday
                        ? 'rgba(6, 182, 212, 0.4)'
                        : 'var(--border-subtle)'
                    }`,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: isSelected ? '0 0 16px rgba(99, 102, 241, 0.35)' : 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.borderColor = isToday ? 'rgba(6, 182, 212, 0.4)' : 'var(--border-subtle)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{
                      fontWeight: isToday || isSelected ? 700 : 500,
                      color: isToday ? '#22d3ee' : isSelected ? '#ffffff' : 'var(--text-main)',
                      fontSize: '0.9rem'
                    }}>
                      {item.day}
                    </span>
                    {isToday && (
                      <span style={{ fontSize: '0.65rem', background: '#22d3ee', color: '#090d16', padding: '1px 5px', borderRadius: '4px', fontWeight: 700 }}>
                        TODAY
                      </span>
                    )}
                  </div>

                  {/* Tasks Indicator Dots */}
                  {count > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px' }}>
                      <div style={{
                        width: '7px',
                        height: '7px',
                        borderRadius: '50%',
                        background: item.hasUrgent ? '#ef4444' : item.allDone ? '#10b981' : '#6366f1'
                      }} />
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 600 }}>
                        {count} {count === 1 ? 'task' : 'tasks'}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Next month placeholder days */}
            {nextMonthDays.map((p, i) => (
              <div
                key={`next-${i}`}
                style={{
                  minHeight: '68px',
                  padding: '8px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255, 255, 255, 0.01)',
                  opacity: 0.25,
                  fontSize: '0.85rem'
                }}
              >
                {p.day}
              </div>
            ))}
          </div>
        </div>

        {/* Right: Selected Date Todos Agenda */}
        <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: '16px',
            borderBottom: '1px solid var(--border-subtle)',
            marginBottom: '20px'
          }}>
            <div>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#22d3ee', fontWeight: 700 }}>
                Date Schedule
              </span>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginTop: '2px' }}>
                {formatHeaderDate(activeDate)}
              </h3>
            </div>

            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="btn btn-primary btn-sm"
              style={{ gap: '6px' }}
            >
              <Plus size={15} />
              <span>{showAddForm ? 'Hide Form' : 'Add Task'}</span>
            </button>
          </div>

          {/* Quick Add Form for this specific date */}
          {showAddForm && (
            <div style={{ marginBottom: '20px' }}>
              <TodoForm
                defaultDate={activeDate}
                isCollapsible={false}
                onSaved={() => setShowAddForm(false)}
              />
            </div>
          )}

          {/* List of Tasks for Selected Date */}
          {activeDateTodos.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '36px 16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.04)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-dim)'
              }}>
                <Inbox size={22} />
              </div>
              <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>No tasks for this date</h4>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', margin: 0 }}>
                Nothing scheduled yet. Click "Add Task" above to plan your day.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {activeDateTodos.map((todo) => (
                <TodoCard key={todo.id} todo={todo} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
