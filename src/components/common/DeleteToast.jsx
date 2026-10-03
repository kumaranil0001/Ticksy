import React, { useEffect } from 'react';
import { Trash2, RotateCcw, X } from 'lucide-react';
import { useTodos } from '../../context/TodoContext';

export const DeleteToast = () => {
  const { deleteToast, undoDelete, dismissDeleteToast } = useTodos();

  useEffect(() => {
    if (deleteToast) {
      const timer = setTimeout(() => {
        dismissDeleteToast();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [deleteToast, dismissDeleteToast]);

  if (!deleteToast) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '28px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      gap: '14px',
      padding: '10px 18px',
      background: 'var(--text-main)',
      color: 'var(--bg-primary)',
      borderRadius: 'var(--radius-full)',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)',
      fontSize: '0.875rem',
      fontWeight: 500,
      animation: 'toastSlideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Trash2 size={16} opacity={0.8} />
        <span>
          Task moved to trash
          {deleteToast.title && (
            <span style={{ opacity: 0.8, marginLeft: '4px' }}>
              ("{deleteToast.title.length > 25 ? deleteToast.title.slice(0, 25) + '...' : deleteToast.title}")
            </span>
          )}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          onClick={undoDelete}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            background: 'var(--bg-primary)',
            color: 'var(--text-main)',
            border: 'none',
            borderRadius: 'var(--radius-full)',
            padding: '4px 12px',
            fontSize: '0.8rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'opacity 0.15s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.85'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
        >
          <RotateCcw size={12} strokeWidth={2.5} />
          <span>Undo</span>
        </button>

        <button
          onClick={dismissDeleteToast}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--bg-primary)',
            opacity: 0.6,
            cursor: 'pointer',
            padding: '2px',
            display: 'flex',
            alignItems: 'center'
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '0.6'}
        >
          <X size={15} />
        </button>
      </div>

      <style>{`
        @keyframes toastSlideUp {
          from { opacity: 0; transform: translate(-50%, 20px) scale(0.96); }
          to { opacity: 1; transform: translate(-50%, 0) scale(1); }
        }
      `}</style>
    </div>
  );
};
