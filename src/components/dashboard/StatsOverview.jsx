import React from 'react';
import { CheckCircle2, Clock, Flame, AlertCircle, Layers, TrendingUp } from 'lucide-react';
import { useTodos } from '../../context/TodoContext';

export const StatsOverview = () => {
  const { stats } = useTodos();

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '16px',
      marginBottom: '28px'
    }}>
      {/* Total Tasks */}
      <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-md)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Tasks</span>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8' }}>
            <Layers size={18} />
          </div>
        </div>
        <div style={{ fontSize: '1.85rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
          {stats.total}
        </div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '4px' }}>
          Across all active projects
        </div>
      </div>

      {/* Completed & Progress */}
      <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-md)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)', fontWeight: 600 }}>Completed</span>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399' }}>
            <CheckCircle2 size={18} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <span style={{ fontSize: '1.85rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: '#34d399' }}>
            {stats.completed}
          </span>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            ({stats.completionPercentage}%)
          </span>
        </div>
        {/* Progress bar */}
        <div style={{
          width: '100%',
          height: '6px',
          background: 'rgba(255, 255, 255, 0.08)',
          borderRadius: 'var(--radius-full)',
          marginTop: '8px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${stats.completionPercentage}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #10b981, #06b6d4)',
            borderRadius: 'var(--radius-full)',
            transition: 'width 0.4s ease'
          }} />
        </div>
      </div>

      {/* Due Today */}
      <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-md)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)', fontWeight: 600 }}>Due Today</span>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(6, 182, 212, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22d3ee' }}>
            <Clock size={18} />
          </div>
        </div>
        <div style={{ fontSize: '1.85rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: '#22d3ee' }}>
          {stats.todayCount}
        </div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '4px' }}>
          Action items for today
        </div>
      </div>

      {/* Urgent & High Priority */}
      <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-md)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)', fontWeight: 600 }}>Urgent Priority</span>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f87171' }}>
            <AlertCircle size={18} />
          </div>
        </div>
        <div style={{ fontSize: '1.85rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: '#f87171' }}>
          {stats.urgentCount}
        </div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '4px' }}>
          Needs immediate attention
        </div>
      </div>
    </div>
  );
};
