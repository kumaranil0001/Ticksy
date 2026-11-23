import React, { useState } from 'react';
import {
  User,
  Lock,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Save,
  ArrowLeft,
  Sparkles,
  TrendingUp,
  Mail,
  Calendar,
  Clock,
  Archive,
  Check
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTodos } from '../../context/TodoContext';

export const ProfileView = ({ onBackToTasks, onSwitchToProgress }) => {
  const { user, isGuest, updateProfile, updatePassword } = useAuth();
  const { stats, autoArchiveMode, setAutoArchiveMode, clearFinishedTasksNow } = useTodos();
  const [cleanupNotice, setCleanupNotice] = useState('');

  // Username form state
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || '');
  const [nameSaving, setNameSaving] = useState(false);
  const [nameSuccess, setNameSuccess] = useState('');
  const [nameError, setNameError] = useState('');

  // Password form state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Handle Full Name / Username Update
  const handleUpdateName = async (e) => {
    e.preventDefault();
    setNameError('');
    setNameSuccess('');

    if (!fullName.trim()) {
      setNameError('Username / Full Name cannot be empty');
      return;
    }

    setNameSaving(true);
    try {
      const { error } = await updateProfile({ fullName: fullName.trim() });
      if (error) {
        setNameError(error.message || 'Failed to update username');
      } else {
        setNameSuccess('Username updated successfully!');
        setTimeout(() => setNameSuccess(''), 4000);
      }
    } catch (err) {
      setNameError(err.message || 'Failed to update username');
    } finally {
      setNameSaving(false);
    }
  };

  // Handle Password Update
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirm password do not match');
      return;
    }

    setPasswordSaving(true);
    try {
      const { error } = await updatePassword({ newPassword });
      if (error) {
        setPasswordError(error.message || 'Failed to change password');
      } else {
        setPasswordSuccess('Password successfully updated!');
        setNewPassword('');
        setConfirmPassword('');
        setCurrentPassword('');
        setTimeout(() => setPasswordSuccess(''), 4000);
      }
    } catch (err) {
      setPasswordError(err.message || 'Failed to change password');
    } finally {
      setPasswordSaving(false);
    }
  };

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : 'Recent';

  const userInitial = (user?.user_metadata?.full_name || user?.email || 'U')[0].toUpperCase();

  return (
    <div className="profile-page-container" style={{ maxWidth: '960px', margin: '0 auto', animation: 'fadeIn 0.25s ease-out' }}>
      {/* Top Header & Navigation Breadcrumb */}
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
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Account & Profile</h2>
        </div>

        {/* Quick Switch to Progress Tab */}
        {onSwitchToProgress && (
          <button
            onClick={onSwitchToProgress}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <TrendingUp size={15} color="#10b981" />
            <span>View Progress & Success Rate</span>
          </button>
        )}
      </div>

      {/* Hero Profile Overview Card */}
      <div
        className="glass-panel"
        style={{
          padding: '24px',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '24px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px',
          background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-secondary) 100%)',
          border: '1px solid var(--border-card)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          {/* Avatar Icon */}
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 52%, #06b6d4 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.75rem',
            fontWeight: 800,
            color: '#ffffff',
            boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
            flexShrink: 0
          }}>
            {userInitial}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800 }}>
                {user?.user_metadata?.full_name || 'Ticksy Creator'}
              </h3>
              {isGuest ? (
                <span style={{
                  fontSize: '0.725rem',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-full)',
                  background: 'rgba(245, 158, 11, 0.15)',
                  color: '#f59e0b',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <Sparkles size={11} /> Guest Demo Mode
                </span>
              ) : (
                <span style={{
                  fontSize: '0.725rem',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-full)',
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#10b981',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <ShieldCheck size={12} /> Supabase Verified
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '6px', fontSize: '0.85rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Mail size={13} /> {user?.email || 'local@ticksy.dev'}
              </span>
              <span>•</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Calendar size={13} /> Member since {memberSince}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Stats Summary */}
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{
            padding: '10px 16px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-card)',
            borderRadius: 'var(--radius-md)',
            textAlign: 'center',
            minWidth: '85px'
          }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>{stats.total}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>Total Tasks</div>
          </div>
          <div style={{
            padding: '10px 16px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-card)',
            borderRadius: 'var(--radius-md)',
            textAlign: 'center',
            minWidth: '85px'
          }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981' }}>{stats.completed}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>Completed</div>
          </div>
          <div style={{
            padding: '10px 16px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-card)',
            borderRadius: 'var(--radius-md)',
            textAlign: 'center',
            minWidth: '85px'
          }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#22d3ee' }}>{stats.completionPercentage}%</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>Success</div>
          </div>
        </div>
      </div>

      {/* Grid: 2 Columns for Username Management & Password Management */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '24px'
      }}>
        {/* Card 1: Manage Username / Profile Information */}
        <div className="glass-panel" style={{
          padding: '24px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-card)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'rgba(99, 102, 241, 0.15)',
              color: '#6366f1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <User size={18} />
            </div>
            <div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Profile Details</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                Update your display name and username
              </p>
            </div>
          </div>

          {/* Feedback alerts */}
          {nameSuccess && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#10b981',
              fontSize: '0.85rem',
              marginBottom: '16px'
            }}>
              <CheckCircle2 size={16} />
              <span>{nameSuccess}</span>
            </div>
          )}

          {nameError && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#ef4444',
              fontSize: '0.85rem',
              marginBottom: '16px'
            }}>
              <AlertCircle size={16} />
              <span>{nameError}</span>
            </div>
          )}

          <form onSubmit={handleUpdateName}>
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label" style={{ fontWeight: 600 }}>Display Name / Username</label>
              <input
                type="text"
                className="form-input"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Anil Kumar Rout"
                required
                style={{ padding: '10px 14px' }}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                This name appears on your workspace header and greetings.
              </span>
            </div>

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label" style={{ fontWeight: 600 }}>Email Address</label>
              <input
                type="email"
                className="form-input"
                value={user?.email || ''}
                disabled
                style={{ opacity: 0.7, cursor: 'not-allowed', background: 'var(--bg-tertiary)' }}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                Associated account email address.
              </span>
            </div>

            <button
              type="submit"
              disabled={nameSaving}
              className="btn btn-primary"
              style={{
                width: '100%',
                justifyContent: 'center',
                padding: '10px 16px',
                borderRadius: 'var(--radius-md)',
                fontWeight: 600,
                gap: '8px'
              }}
            >
              <Save size={16} />
              <span>{nameSaving ? 'Saving Name...' : 'Save Profile Name'}</span>
            </button>
          </form>
        </div>

        {/* Card 2: Manage Password */}
        <div className="glass-panel" style={{
          padding: '24px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-card)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'rgba(239, 68, 68, 0.15)',
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <KeyRound size={18} />
            </div>
            <div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Security & Password</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                Update your account password
              </p>
            </div>
          </div>

          {/* Feedback alerts */}
          {passwordSuccess && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#10b981',
              fontSize: '0.85rem',
              marginBottom: '16px'
            }}>
              <CheckCircle2 size={16} />
              <span>{passwordSuccess}</span>
            </div>
          )}

          {passwordError && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#ef4444',
              fontSize: '0.85rem',
              marginBottom: '16px'
            }}>
              <AlertCircle size={16} />
              <span>{passwordError}</span>
            </div>
          )}

          <form onSubmit={handleUpdatePassword}>
            {/* New Password */}
            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label className="form-label" style={{ fontWeight: 600 }}>New Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  className="form-input"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter at least 6 characters"
                  required
                  style={{ paddingRight: '40px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="btn-ghost"
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    padding: '4px',
                    color: 'var(--text-dim)'
                  }}
                  title={showNewPassword ? "Hide password" : "Show password"}
                >
                  {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label" style={{ fontWeight: 600 }}>Confirm New Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="form-input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your new password"
                  required
                  style={{ paddingRight: '40px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="btn-ghost"
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    padding: '4px',
                    color: 'var(--text-dim)'
                  }}
                  title={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div style={{
              fontSize: '0.75rem',
              color: 'var(--text-dim)',
              marginBottom: '16px',
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-tertiary)'
            }}>
              🔒 Password must be at least 6 characters. Once changed, your new password will be required on future logins.
            </div>

            <button
              type="submit"
              disabled={passwordSaving}
              className="btn btn-primary"
              style={{
                width: '100%',
                justifyContent: 'center',
                padding: '10px 16px',
                borderRadius: 'var(--radius-md)',
                fontWeight: 600,
                gap: '8px'
              }}
            >
              <Lock size={16} />
              <span>{passwordSaving ? 'Updating Password...' : 'Update Password'}</span>
            </button>
          </form>
        </div>
      </div>

      {/* Card 3: Task Lifecycle & Auto-Cleanup Preferences */}
      <div className="glass-panel" style={{
        marginTop: '24px',
        padding: '24px',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-card)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'rgba(99, 102, 241, 0.15)',
              color: '#818cf8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Clock size={18} />
            </div>
            <div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>
                Task Lifecycle & Auto-Cleanup Rules
              </h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                Decide when finished tasks automatically remove from your workspace while permanently keeping stats for your Progress Graph
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              clearFinishedTasksNow();
              setCleanupNotice('Finished tasks successfully archived! Daily progress locked into graph.');
              setTimeout(() => setCleanupNotice(''), 4000);
            }}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Sparkles size={14} color="#818cf8" />
            <span>Clean Finished Now</span>
          </button>
        </div>

        {cleanupNotice && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: '#10b981',
            fontSize: '0.85rem',
            marginBottom: '16px'
          }}>
            <CheckCircle2 size={16} />
            <span>{cleanupNotice}</span>
          </div>
        )}

        {/* 3 Auto Cleanup Strategy Options */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '16px'
        }}>
          {/* Option 1: At 12:00 AM Midnight */}
          <div
            onClick={() => setAutoArchiveMode('midnight')}
            style={{
              padding: '18px',
              borderRadius: 'var(--radius-md)',
              border: `2px solid ${autoArchiveMode === 'midnight' ? 'var(--accent-primary)' : 'var(--border-card)'}`,
              background: autoArchiveMode === 'midnight' ? 'rgba(99, 102, 241, 0.08)' : 'var(--bg-tertiary)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              position: 'relative'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={16} color="#818cf8" />
                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                  At 12:00 AM (Midnight)
                </span>
              </div>
              <span style={{
                fontSize: '0.7rem',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#10b981',
                fontWeight: 600
              }}>
                Recommended
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0 0 12px 0', lineHeight: 1.45 }}>
              Tasks automatically clear when a new day starts at 12:00 AM midnight. Gives you a clean workspace every morning while preserving history in your Success Graph.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: autoArchiveMode === 'midnight' ? '#818cf8' : 'var(--text-dim)', fontWeight: 600 }}>
              {autoArchiveMode === 'midnight' ? <Check size={14} /> : null}
              <span>{autoArchiveMode === 'midnight' ? 'Active Strategy' : 'Click to select'}</span>
            </div>
          </div>

          {/* Option 2: When Timeline Finishes */}
          <div
            onClick={() => setAutoArchiveMode('time_passed')}
            style={{
              padding: '18px',
              borderRadius: 'var(--radius-md)',
              border: `2px solid ${autoArchiveMode === 'time_passed' ? 'var(--accent-primary)' : 'var(--border-card)'}`,
              background: autoArchiveMode === 'time_passed' ? 'rgba(99, 102, 241, 0.08)' : 'var(--bg-tertiary)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              position: 'relative'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={16} color="#06b6d4" />
                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                  When Timeline Finishes
                </span>
              </div>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0 0 12px 0', lineHeight: 1.45 }}>
              Tasks automatically clear as soon as their scheduled due time passes and they are marked completed, keeping your focus strictly on what is active right now.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: autoArchiveMode === 'time_passed' ? '#818cf8' : 'var(--text-dim)', fontWeight: 600 }}>
              {autoArchiveMode === 'time_passed' ? <Check size={14} /> : null}
              <span>{autoArchiveMode === 'time_passed' ? 'Active Strategy' : 'Click to select'}</span>
            </div>
          </div>

          {/* Option 3: Manual Only */}
          <div
            onClick={() => setAutoArchiveMode('manual')}
            style={{
              padding: '18px',
              borderRadius: 'var(--radius-md)',
              border: `2px solid ${autoArchiveMode === 'manual' ? 'var(--accent-primary)' : 'var(--border-card)'}`,
              background: autoArchiveMode === 'manual' ? 'rgba(99, 102, 241, 0.08)' : 'var(--bg-tertiary)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              position: 'relative'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Archive size={16} color="#94a3b8" />
                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                  Manual Removal Only
                </span>
              </div>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0 0 12px 0', lineHeight: 1.45 }}>
              Tasks remain on your screen until you manually delete or archive them. Auto-cleanup is disabled.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: autoArchiveMode === 'manual' ? '#818cf8' : 'var(--text-dim)', fontWeight: 600 }}>
              {autoArchiveMode === 'manual' ? <Check size={14} /> : null}
              <span>{autoArchiveMode === 'manual' ? 'Active Strategy' : 'Click to select'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
