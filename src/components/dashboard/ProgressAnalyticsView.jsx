import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Award,
  CheckCircle2,
  Calendar,
  ArrowLeft,
  User,
  BarChart3,
  Flame,
  ArrowUpRight,
  Info,
  Zap,
  RotateCcw
} from 'lucide-react';
import { useTodos } from '../../context/TodoContext';

export const ProgressAnalyticsView = ({ onBackToTasks, onSwitchToProfile, onSelectDateFilter }) => {
  const { todos, stats, setSelectedCalendarDate, progressHistory, seedProgressHistory } = useTodos();
  const [rangeDays, setRangeDays] = useState(7); // 7, 14, 30, or 0 (all)
  const [hoveredDay, setHoveredDay] = useState(null);

  // Today's date string
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Compute date-wise success metrics
  const dateMetrics = useMemo(() => {
    // Collect all unique dates from todos and history
    const todoDates = new Set();
    todos.forEach(t => {
      if (t.due_date) todoDates.add(t.due_date);
      else if (t.created_at) {
        const cDate = t.created_at.split('T')[0];
        todoDates.add(cDate);
      }
    });

    if (progressHistory) {
      Object.keys(progressHistory).forEach(d => todoDates.add(d));
    }

    // Generate chronological list of dates based on rangeDays
    const dates = [];
    const count = rangeDays === 0 ? 30 : rangeDays;

    for (let i = count - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split('T')[0]);
    }

    // Add any future dates that have tasks scheduled
    todoDates.forEach(dStr => {
      if (dStr > todayStr && !dates.includes(dStr)) {
        dates.push(dStr);
      }
    });

    // Sort chronologically
    dates.sort();

    // Map each date to metrics
    return dates.map(dateStr => {
      // 1. Check if lightweight historical snapshot exists for this date
      const historicalSnapshot = progressHistory && progressHistory[dateStr];

      // 2. Check if active todos exist for this date
      const forDate = todos.filter(t => {
        if (t.due_date) return t.due_date === dateStr;
        return t.created_at && t.created_at.split('T')[0] === dateStr;
      });

      let total = 0;
      let completed = 0;
      let rate = 0;

      // Prioritize active todos for today, otherwise rely on preserved historical snapshot
      if (dateStr === todayStr && (forDate.length > 0 || (stats && stats.total > 0))) {
        total = forDate.length > 0 ? forDate.length : stats.total;
        completed = forDate.length > 0 ? forDate.filter(t => t.completed).length : stats.completed;
        rate = total > 0 ? Math.round((completed / total) * 100) : 0;
      } else if (historicalSnapshot && historicalSnapshot.total > 0) {
        total = historicalSnapshot.total;
        completed = historicalSnapshot.completed;
        rate = historicalSnapshot.rate;
      } else if (forDate.length > 0) {
        total = forDate.length;
        completed = forDate.filter(t => t.completed).length;
        rate = Math.round((completed / total) * 100);
      }

      // Format human-friendly label
      const dObj = new Date(dateStr + 'T00:00:00');
      const isToday = dateStr === todayStr;
      const shortDay = dObj.toLocaleDateString('en-US', { weekday: 'short' });
      const monthDay = dObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      return {
        dateStr,
        isToday,
        shortDay,
        monthDay,
        fullFormatted: dObj.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' }),
        total,
        completed,
        pending: Math.max(0, total - completed),
        rate,
        hasActivity: total > 0
      };
    });
  }, [todos, stats, progressHistory, rangeDays, todayStr]);

  // Overall analytics calculations
  const activeDays = dateMetrics.filter(d => d.total > 0);
  const averageSuccessRate = activeDays.length > 0
    ? Math.round(activeDays.reduce((acc, curr) => acc + curr.rate, 0) / activeDays.length)
    : stats.completionPercentage || 0;

  const perfectDaysCount = activeDays.filter(d => d.rate === 100).length;

  const bestDay = activeDays.reduce((best, curr) => {
    if (!best) return curr;
    if (curr.completed > best.completed) return curr;
    return best;
  }, null);

  // SVG Chart Geometry Calculations
  const chartWidth = 760;
  const chartHeight = 220;
  const paddingX = 40;
  const paddingY = 28;
  const graphInnerWidth = chartWidth - paddingX * 2;
  const graphInnerHeight = chartHeight - paddingY * 2;

  const points = useMemo(() => {
    if (dateMetrics.length === 0) return [];
    const step = graphInnerWidth / Math.max(dateMetrics.length - 1, 1);
    return dateMetrics.map((item, index) => {
      const x = paddingX + index * step;
      // Invert Y: 100% is top (paddingY), 0% is bottom (chartHeight - paddingY)
      const y = chartHeight - paddingY - (item.rate / 100) * graphInnerHeight;
      return { ...item, x, y };
    });
  }, [dateMetrics, graphInnerWidth, graphInnerHeight, chartHeight, paddingX, paddingY]);

  // SVG Path generator for smooth curved line
  const { pathD, areaD } = useMemo(() => {
    if (points.length === 0) return { pathD: '', areaD: '' };
    if (points.length === 1) {
      const p = points[0];
      return { pathD: `M ${p.x} ${p.y}`, areaD: '' };
    }

    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cx = (p0.x + p1.x) / 2;
      d += ` C ${cx} ${p0.y}, ${cx} ${p1.y}, ${p1.x} ${p1.y}`;
    }

    const first = points[0];
    const last = points[points.length - 1];
    const baselineY = chartHeight - paddingY;
    const aD = `${d} L ${last.x} ${baselineY} L ${first.x} ${baselineY} Z`;

    return { pathD: d, areaD: aD };
  }, [points, chartHeight, paddingY]);

  // Handle clicking a date to inspect in task view
  const handleInspectDate = (dateStr) => {
    if (setSelectedCalendarDate) {
      setSelectedCalendarDate(dateStr);
    }
    if (onSelectDateFilter) {
      onSelectDateFilter(dateStr);
    } else if (onBackToTasks) {
      onBackToTasks();
    }
  };

  return (
    <div className="analytics-page-container" style={{ maxWidth: '980px', margin: '0 auto', animation: 'fadeIn 0.25s ease-out' }}>
      {/* Top Header & Breadcrumb */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '24px',
        paddingBottom: '16px',
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={onBackToTasks}
            className="btn btn-ghost btn-sm"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: 'var(--radius-md)'
            }}
          >
            <ArrowLeft size={16} />
            <span>Workspace Tasks</span>
          </button>
          <span style={{ color: 'var(--text-dim)' }}>/</span>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Progress & Success Rate</h2>
        </div>

        {/* Quick Switch to Profile & Password Tab */}
        {onSwitchToProfile && (
          <button
            onClick={onSwitchToProfile}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <User size={15} color="#6366f1" />
            <span>Profile & Password Settings</span>
          </button>
        )}
      </div>

      {/* Top 4 Performance Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        {/* Card 1: Average Success Rate */}
        <div className="glass-panel" style={{
          padding: '20px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-card)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Avg Success Rate</span>
            <div style={{
              width: '30px',
              height: '30px',
              borderRadius: '8px',
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <TrendingUp size={16} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.03em' }}>
              {averageSuccessRate}%
            </span>
            <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>
              {averageSuccessRate >= 80 ? '✦ Optimal Focus' : averageSuccessRate >= 50 ? '✦ Good Momentum' : '✦ In Progress'}
            </span>
          </div>
          <div style={{
            width: '100%',
            height: '4px',
            background: 'var(--bg-tertiary)',
            borderRadius: 'var(--radius-full)',
            marginTop: '12px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${averageSuccessRate}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #10b981, #06b6d4)',
              borderRadius: 'var(--radius-full)'
            }} />
          </div>
        </div>

        {/* Card 2: Completed vs Total Tasks */}
        <div className="glass-panel" style={{
          padding: '20px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-card)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Completed Tasks</span>
            <div style={{
              width: '30px',
              height: '30px',
              borderRadius: '8px',
              background: 'rgba(99, 102, 241, 0.15)',
              color: '#6366f1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.03em' }}>
              {stats.completed}
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              of {stats.total} total
            </span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '8px', margin: '8px 0 0 0' }}>
            {stats.pending} active tasks remaining
          </p>
        </div>

        {/* Card 3: 100% Perfect Days */}
        <div className="glass-panel" style={{
          padding: '20px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-card)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>100% Flawless Days</span>
            <div style={{
              width: '30px',
              height: '30px',
              borderRadius: '8px',
              background: 'rgba(245, 158, 11, 0.15)',
              color: '#f59e0b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Award size={16} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.03em' }}>
              {perfectDaysCount}
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              day{perfectDaysCount !== 1 ? 's' : ''}
            </span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '8px', margin: '8px 0 0 0' }}>
            All scheduled items completed
          </p>
        </div>

        {/* Card 4: Best Day Peak */}
        <div className="glass-panel" style={{
          padding: '20px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-card)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Peak Performance</span>
            <div style={{
              width: '30px',
              height: '30px',
              borderRadius: '8px',
              background: 'rgba(236, 72, 153, 0.15)',
              color: '#ec4899',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Flame size={16} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              {bestDay && bestDay.completed > 0 ? bestDay.monthDay : 'Today'}
            </span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '8px', margin: '8px 0 0 0' }}>
            {bestDay && bestDay.completed > 0
              ? `${bestDay.completed} tasks conquered (${bestDay.rate}%)`
              : 'Add and complete tasks to set a record'}
          </p>
        </div>
      </div>

      {/* Main Interactive Graph Panel */}
      <div className="glass-panel" style={{
        padding: '24px',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-card)',
        marginBottom: '28px'
      }}>
        {/* Graph Header & Controls */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px',
          marginBottom: '20px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart3 size={18} color="var(--accent-primary)" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                Date-Wise Success Rate Graph
              </h3>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '3px' }}>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', margin: 0 }}>
                Shows daily task completion percentage (%) over time. Hover over any date to inspect details.
              </p>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(99, 102, 241, 0.1)',
                border: '1px solid rgba(99, 102, 241, 0.25)',
                fontSize: '0.7rem',
                color: '#818cf8',
                fontWeight: 600
              }}>
                <Zap size={11} />
                <span>Lightweight Metric Snapshots • Low DB Load</span>
              </span>
            </div>
          </div>

          {/* Range Selector Pills & Sync Control */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: 'var(--bg-tertiary)',
              padding: '4px',
              borderRadius: 'var(--radius-md)'
            }}>
              {[
                { label: '7 Days', val: 7 },
                { label: '14 Days', val: 14 },
                { label: '30 Days', val: 30 }
              ].map(r => (
                <button
                  key={r.val}
                  onClick={() => setRangeDays(r.val)}
                  className="btn btn-ghost btn-sm"
                  style={{
                    padding: '5px 12px',
                    fontSize: '0.775rem',
                    borderRadius: 'var(--radius-sm)',
                    fontWeight: rangeDays === r.val ? 700 : 500,
                    background: rangeDays === r.val ? 'var(--bg-card)' : 'transparent',
                    color: rangeDays === r.val ? 'var(--text-main)' : 'var(--text-muted)',
                    boxShadow: rangeDays === r.val ? 'var(--shadow-sm)' : 'none'
                  }}
                >
                  {r.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => seedProgressHistory()}
              className="btn btn-ghost btn-sm"
              title="Re-sync or backfill historical baseline for past days"
              style={{
                fontSize: '0.75rem',
                gap: '5px',
                color: 'var(--text-dim)',
                padding: '6px 10px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <RotateCcw size={13} />
              <span>Sync History</span>
            </button>
          </div>
        </div>

        {/* Hovered Date Info Tooltip Banner */}
        <div style={{
          minHeight: '44px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 16px',
          borderRadius: 'var(--radius-md)',
          background: 'var(--bg-tertiary)',
          marginBottom: '16px',
          fontSize: '0.85rem'
        }}>
          {hoveredDay ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                  📅 {hoveredDay.fullFormatted}
                  {hoveredDay.isToday && <span style={{ color: '#22d3ee', marginLeft: '6px' }}>(Today)</span>}
                </span>
                <span style={{
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  background: hoveredDay.rate === 100
                    ? 'rgba(16, 185, 129, 0.2)'
                    : hoveredDay.rate >= 50
                    ? 'rgba(6, 182, 212, 0.2)'
                    : 'rgba(239, 68, 68, 0.2)',
                  color: hoveredDay.rate === 100 ? '#10b981' : hoveredDay.rate >= 50 ? '#06b6d4' : '#ef4444'
                }}>
                  {hoveredDay.rate}% Success Rate
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.8rem' }}>
                <span><strong>{hoveredDay.completed}</strong> completed</span>
                <span>•</span>
                <span><strong>{hoveredDay.total}</strong> scheduled</span>
                {hoveredDay.total > 0 && (
                  <button
                    onClick={() => handleInspectDate(hoveredDay.dateStr)}
                    className="btn btn-primary btn-sm"
                    style={{ padding: '3px 10px', fontSize: '0.75rem', height: '26px' }}
                  >
                    View Tasks <ArrowUpRight size={12} />
                  </button>
                )}
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-dim)', fontSize: '0.825rem' }}>
              <Info size={14} />
              <span>Hover over any bar or node on the graph to view date-wise success breakdown.</span>
            </div>
          )}
        </div>

        {/* SVG Responsive Chart Viewport */}
        <div style={{ width: '100%', overflowX: 'auto', position: 'relative' }}>
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            style={{ width: '100%', minWidth: '600px', height: '240px', overflow: 'visible' }}
          >
            <defs>
              {/* Line area gradient fill */}
              <linearGradient id="successAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                <stop offset="60%" stopColor="#06b6d4" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
              </linearGradient>

              {/* Glowing stroke gradient */}
              <linearGradient id="successLineGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="50%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines and percentage indicators */}
            {[100, 75, 50, 25, 0].map(pct => {
              const y = chartHeight - paddingY - (pct / 100) * graphInnerHeight;
              return (
                <g key={pct}>
                  <line
                    x1={paddingX}
                    y1={y}
                    x2={chartWidth - paddingX}
                    y2={y}
                    stroke="var(--border-subtle)"
                    strokeDasharray={pct === 0 ? 'none' : '3 3'}
                    strokeWidth={pct === 0 ? 1.5 : 1}
                  />
                  <text
                    x={paddingX - 10}
                    y={y + 4}
                    textAnchor="end"
                    fill="var(--text-dim)"
                    fontSize="10"
                    fontWeight="600"
                    fontFamily="monospace"
                  >
                    {pct}%
                  </text>
                </g>
              );
            })}

            {/* Task Volume Columns behind the line */}
            {points.map((pt) => {
              const barWidth = Math.max(12, Math.min(26, (graphInnerWidth / points.length) * 0.45));
              const maxPossibleHeight = graphInnerHeight;
              // Bar height based on completion rate
              const barHeight = pt.hasActivity ? Math.max((pt.rate / 100) * maxPossibleHeight, 6) : 0;
              const barY = chartHeight - paddingY - barHeight;
              const isHovered = hoveredDay?.dateStr === pt.dateStr;

              return (
                <g
                  key={pt.dateStr}
                  onMouseEnter={() => setHoveredDay(pt)}
                  onClick={() => handleInspectDate(pt.dateStr)}
                  style={{ cursor: pt.total > 0 ? 'pointer' : 'default' }}
                >
                  {/* Subtle column background */}
                  <rect
                    x={pt.x - barWidth / 2}
                    y={chartHeight - paddingY - (pt.total > 0 ? maxPossibleHeight * 0.9 : 0)}
                    width={barWidth}
                    height={pt.total > 0 ? maxPossibleHeight * 0.9 : 0}
                    rx="4"
                    fill={isHovered ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.02)'}
                  />

                  {/* Filled success rate bar */}
                  {pt.hasActivity && (
                    <rect
                      x={pt.x - barWidth / 2}
                      y={barY}
                      width={barWidth}
                      height={barHeight}
                      rx="4"
                      fill={
                        pt.rate === 100
                          ? '#10b981'
                          : pt.rate >= 50
                          ? 'url(#successLineGradient)'
                          : '#ef4444'
                      }
                      opacity={isHovered ? 1 : 0.8}
                      style={{ transition: 'all 0.2s ease' }}
                    />
                  )}
                </g>
              );
            })}

            {/* Gradient Area Fill under the success line */}
            {areaD && (
              <path
                d={areaD}
                fill="url(#successAreaGradient)"
                style={{ transition: 'all 0.3s ease' }}
              />
            )}

            {/* Smooth Glowing Success Rate Line */}
            {pathD && (
              <path
                d={pathD}
                fill="none"
                stroke="url(#successLineGradient)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  filter: 'drop-shadow(0 2px 6px rgba(16, 185, 129, 0.4))',
                  transition: 'all 0.3s ease'
                }}
              />
            )}

            {/* Interactive Data Point Nodes and X-axis Labels */}
            {points.map((pt) => {
              const isHovered = hoveredDay?.dateStr === pt.dateStr;

              return (
                <g
                  key={'point-' + pt.dateStr}
                  onMouseEnter={() => setHoveredDay(pt)}
                  onClick={() => handleInspectDate(pt.dateStr)}
                  style={{ cursor: pt.total > 0 ? 'pointer' : 'default' }}
                >
                  {/* Glowing Node Dot */}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isHovered ? 7 : pt.hasActivity ? 5 : 3}
                    fill={pt.hasActivity ? (pt.rate === 100 ? '#10b981' : '#06b6d4') : 'var(--border-card)'}
                    stroke="var(--bg-card)"
                    strokeWidth="2.5"
                    style={{ transition: 'all 0.15s ease' }}
                  />

                  {/* Hover ping pulse ring */}
                  {isHovered && pt.hasActivity && (
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="12"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="1.5"
                      opacity="0.6"
                    />
                  )}

                  {/* X-axis Date Label */}
                  <text
                    x={pt.x}
                    y={chartHeight - paddingY + 18}
                    textAnchor="middle"
                    fill={pt.isToday ? 'var(--text-main)' : isHovered ? 'var(--text-main)' : 'var(--text-dim)'}
                    fontSize={points.length > 14 ? '9' : '11'}
                    fontWeight={pt.isToday || isHovered ? '700' : '500'}
                  >
                    {pt.shortDay}
                  </text>

                  {/* Month/Day sublabel */}
                  <text
                    x={pt.x}
                    y={chartHeight - paddingY + 30}
                    textAnchor="middle"
                    fill={pt.isToday ? '#22d3ee' : 'var(--text-dim)'}
                    fontSize="9"
                    fontWeight={pt.isToday ? '700' : '400'}
                  >
                    {pt.monthDay}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Date-Wise Breakdown Log & Task Inspection */}
      <div className="glass-panel" style={{
        padding: '24px',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-card)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Day-by-Day Success Log</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
              Detailed completion stats and task filters for each recorded day
            </p>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            Showing {dateMetrics.length} days
          </span>
        </div>

        {/* Date Rows Table */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          maxHeight: '400px',
          overflowY: 'auto',
          paddingRight: '4px',
          scrollbarWidth: 'thin'
        }}>
          {dateMetrics
            .slice()
            .reverse() // show newest/today first
            .map((item) => {
              return (
                <div
                  key={item.dateStr}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    background: item.isToday ? 'rgba(99, 102, 241, 0.06)' : 'var(--bg-tertiary)',
                    border: item.isToday ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
                    transition: 'all 0.15s ease',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}
                >
                  {/* Left: Date info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '180px' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: item.hasActivity ? 'var(--bg-card)' : 'transparent',
                      border: '1px solid var(--border-card)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: item.isToday ? '#22d3ee' : 'var(--text-muted)',
                      fontSize: '0.75rem',
                      fontWeight: 700
                    }}>
                      <Calendar size={15} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>
                          {item.fullFormatted}
                        </span>
                        {item.isToday && (
                          <span style={{
                            fontSize: '0.675rem',
                            padding: '1px 6px',
                            borderRadius: 'var(--radius-full)',
                            background: '#22d3ee',
                            color: '#080c14',
                            fontWeight: 800
                          }}>
                            Today
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                        {item.total === 0 ? 'No tasks scheduled' : `${item.total} task${item.total > 1 ? 's' : ''} on agenda`}
                      </span>
                    </div>
                  </div>

                  {/* Middle: Progress Bar and Success Rate Pill */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: '220px', maxWidth: '380px' }}>
                    <div style={{ flex: 1, height: '6px', background: 'var(--border-subtle)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                      <div style={{
                        width: `${item.rate}%`,
                        height: '100%',
                        background: item.rate === 100
                          ? '#10b981'
                          : item.rate >= 50
                          ? 'linear-gradient(90deg, #6366f1, #06b6d4)'
                          : '#ef4444',
                        borderRadius: 'var(--radius-full)'
                      }} />
                    </div>

                    <span style={{
                      padding: '3px 9px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      minWidth: '58px',
                      textAlign: 'center',
                      background: item.total === 0
                        ? 'var(--bg-secondary)'
                        : item.rate === 100
                        ? 'rgba(16, 185, 129, 0.15)'
                        : item.rate >= 50
                        ? 'rgba(6, 182, 212, 0.15)'
                        : 'rgba(239, 68, 68, 0.15)',
                      color: item.total === 0
                        ? 'var(--text-dim)'
                        : item.rate === 100
                        ? '#10b981'
                        : item.rate >= 50
                        ? '#06b6d4'
                        : '#ef4444'
                    }}>
                      {item.total === 0 ? '0%' : `${item.rate}%`}
                    </span>
                  </div>

                  {/* Right: Numbers and Inspect Action */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <strong>{item.completed}</strong>/{item.total} done
                    </span>

                    {item.total > 0 && (
                      <button
                        onClick={() => handleInspectDate(item.dateStr)}
                        className="btn btn-ghost btn-sm"
                        style={{
                          fontSize: '0.75rem',
                          padding: '4px 8px',
                          borderRadius: 'var(--radius-sm)',
                          color: 'var(--text-main)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                        title="Filter tasks for this day"
                      >
                        <span>Filter</span>
                        <ArrowUpRight size={13} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};
