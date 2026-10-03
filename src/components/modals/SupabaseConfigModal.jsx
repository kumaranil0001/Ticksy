import React, { useState } from 'react';
import { X, Database, Key, CheckCircle2, AlertTriangle, Copy, ExternalLink } from 'lucide-react';
import { getSupabaseConfig, saveSupabaseConfig, clearSupabaseConfig, isSupabaseConfigured } from '../../lib/supabase';

export const SupabaseConfigModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const currentConfig = getSupabaseConfig();
  const configured = isSupabaseConfigured();

  const [url, setUrl] = useState(currentConfig.url || '');
  const [anonKey, setAnonKey] = useState(currentConfig.anonKey || '');
  const [copied, setCopied] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    if (!url || !anonKey) {
      alert('Please provide both Supabase URL and Anon Key');
      return;
    }
    saveSupabaseConfig(url.trim(), anonKey.trim());
  };

  const handleReset = () => {
    if (confirm('Reset to default local storage mode?')) {
      clearSupabaseConfig();
    }
  };

  const copySqlSchema = () => {
    const sql = `-- DoneStack Database Schema for Supabase
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  description text,
  color text default '#6366f1',
  icon text default 'folder',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.projects enable row level security;
create policy "Users can view own projects" on public.projects for select using (auth.uid() = user_id);
create policy "Users can insert own projects" on public.projects for insert with check (auth.uid() = user_id);
create policy "Users can update own projects" on public.projects for update using (auth.uid() = user_id);
create policy "Users can delete own projects" on public.projects for delete using (auth.uid() = user_id);

create table if not exists public.todos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  project_id uuid references public.projects(id) on delete set null,
  title text not null,
  description text,
  completed boolean default false not null,
  priority text check (priority in ('low', 'medium', 'high', 'urgent')) default 'medium' not null,
  due_date date,
  due_time text,
  tags text[] default array[]::text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.todos enable row level security;
create policy "Users can view own todos" on public.todos for select using (auth.uid() = user_id);
create policy "Users can insert own todos" on public.todos for insert with check (auth.uid() = user_id);
create policy "Users can update own todos" on public.todos for update using (auth.uid() = user_id);
create policy "Users can delete own todos" on public.todos for delete using (auth.uid() = user_id);`;

    navigator.clipboard.writeText(sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'rgba(99, 102, 241, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-glow)'
            }}>
              <Database size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem' }}>Supabase Backend Setup</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Cloud database & authentication connector</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close dialog" title="Close">
            <X size={18} strokeWidth={2.2} />
          </button>
        </div>

        {/* Current status pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px',
          background: configured ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-tertiary)',
          border: `1px solid ${configured ? 'rgba(16, 185, 129, 0.25)' : 'var(--border-card)'}`,
          borderRadius: 'var(--radius-md)',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {configured ? (
              <CheckCircle2 size={16} color="#10b981" />
            ) : (
              <Database size={16} color="var(--text-muted)" />
            )}
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: configured ? '#10b981' : 'var(--text-main)' }}>
              {configured ? 'Supabase Connected & Active' : 'Offline / Local Storage Mode'}
            </span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            Source: {currentConfig.source || 'default'}
          </span>
        </div>

        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Database size={14} /> Project URL
            </label>
            <input
              type="url"
              className="form-input"
              placeholder="https://xyzproject.supabase.co"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Key size={14} /> Project Anon / Public Key
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
              Save & Connect Supabase
            </button>
            {configured && (
              <button type="button" className="btn btn-secondary" onClick={handleReset}>
                Reset to Demo
              </button>
            )}
          </div>
        </form>

        <div style={{
          marginTop: '24px',
          paddingTop: '20px',
          borderTop: '1px solid var(--border-subtle)'
        }}>
          <h4 style={{ fontSize: '0.95rem', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>Database SQL Schema</span>
            <button
              onClick={copySqlSchema}
              className="btn btn-ghost btn-sm"
              style={{ fontSize: '0.8rem', gap: '4px' }}
            >
              <Copy size={13} /> {copied ? 'Copied to Clipboard!' : 'Copy SQL Script'}
            </button>
          </h4>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
            Execute this SQL script inside your Supabase Project's <strong>SQL Editor</strong> to configure the <code>todos</code> and <code>projects</code> tables with Row-Level-Security (RLS).
          </p>

          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noreferrer"
            className="btn btn-secondary btn-sm"
            style={{ width: '100%', justifyContent: 'center', gap: '6px' }}
          >
            <span>Open Supabase Dashboard</span>
            <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </div>
  );
};
