import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { INITIAL_TODOS, INITIAL_PROJECTS } from '../constants/mockData';
import { getLocalDateString, getOffsetDateString, isTaskTimelineFinished } from '../lib/dateUtils';

const TodoContext = createContext({});

export const TodoProvider = ({ children }) => {
  const { user, isGuest } = useAuth();
  const [todos, setTodos] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'today', 'upcoming', 'completed', 'urgent'
  const [activeProject, setActiveProject] = useState('all'); // 'all' or projectId
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(null); // 'YYYY-MM-DD'
  const [searchQuery, setSearchQuery] = useState('');
  const [syncStatus, setSyncStatus] = useState('synced'); // 'synced', 'syncing', 'offline'

  // Load Initial Data (from Supabase or Local Storage)
  const loadData = useCallback(async () => {
    setLoading(true);

    if (user && !isGuest && isSupabaseConfigured()) {
      try {
        setSyncStatus('syncing');
        // Fetch Projects from Supabase
        const { data: userProjects, error: projError } = await supabase
          .from('projects')
          .select('*')
          .order('created_at', { ascending: false });

        if (projError) {
          console.warn('Supabase projects fetch error:', projError);
          setProjects([]);
        } else {
          setProjects(userProjects || []);
        }

        // Fetch Todos from Supabase
        const { data: userTodos, error: todoError } = await supabase
          .from('todos')
          .select('*')
          .order('created_at', { ascending: false });

        if (todoError) {
          console.warn('Supabase todos fetch error:', todoError);
          setTodos([]);
        } else {
          // Check for saved custom priority order
          const rawTodos = userTodos || [];
          try {
            const savedOrderStr = localStorage.getItem(`ticksy_order_${user.id}`);
            if (savedOrderStr) {
              const savedOrderIds = JSON.parse(savedOrderStr);
              const todoMap = new Map(rawTodos.map(t => [t.id, t]));
              const orderedList = [];
              for (const id of savedOrderIds) {
                if (todoMap.has(id)) {
                  orderedList.push(todoMap.get(id));
                  todoMap.delete(id);
                }
              }
              // Append any new or remaining todos not in saved order
              for (const leftover of todoMap.values()) {
                orderedList.push(leftover);
              }
              setTodos(orderedList);
            } else {
              setTodos(rawTodos);
            }
          } catch (e) {
            setTodos(rawTodos);
          }
        }
        setSyncStatus('synced');
      } catch (err) {
        console.error('Error fetching Supabase data:', err);
        setSyncStatus('offline');
      } finally {
        setLoading(false);
      }
    } else if (isGuest) {
      // Local storage fallback strictly for Guest Demo mode
      const storedTodos = localStorage.getItem('donestack_guest_todos');
      const storedProjects = localStorage.getItem('donestack_guest_projects');

      if (storedTodos) {
        try {
          setTodos(JSON.parse(storedTodos));
        } catch (e) {
          setTodos(INITIAL_TODOS);
        }
      } else {
        setTodos(INITIAL_TODOS);
      }

      if (storedProjects) {
        try {
          setProjects(JSON.parse(storedProjects));
        } catch (e) {
          setProjects(INITIAL_PROJECTS);
        }
      } else {
        setProjects(INITIAL_PROJECTS);
      }

      setSyncStatus('synced');
      setLoading(false);
    } else {
      // Unauthenticated / fresh state starts clean at 0
      setTodos([]);
      setProjects([]);
      setSyncStatus('synced');
      setLoading(false);
    }
  }, [user, isGuest]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Persist to local storage ONLY if in guest demo mode
  useEffect(() => {
    if (isGuest) {
      if (todos.length > 0) {
        localStorage.setItem('donestack_guest_todos', JSON.stringify(todos));
      }
      if (projects.length > 0) {
        localStorage.setItem('donestack_guest_projects', JSON.stringify(projects));
      }
    }
  }, [todos, projects, isGuest]);

  // Lightweight Daily Progress History Engine (Reduces DB load by storing only lightweight daily metrics)
  const historyStorageKey = user?.id ? `ticksy_progress_history_${user.id}` : 'ticksy_progress_history_guest';
  const [progressHistory, setProgressHistory] = useState({});

  // Helper to generate a realistic initial historical baseline for previous days so graph is never empty
  const generateInitialSeedHistory = useCallback(() => {
    const seed = {};
    const sampleRates = [85, 100, 75, 90, 100, 80]; // realistic positive rates for previous 6 days
    for (let i = 6; i >= 1; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = getLocalDateString(d);
      const rate = sampleRates[6 - i] || 85;
      const total = 4 + (i % 3);
      const completed = Math.round((total * rate) / 100);
      seed[dStr] = {
        date: dStr,
        total,
        completed,
        rate,
        isSnapshot: true
      };
    }
    return seed;
  }, []);

  // Load progress history from storage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(historyStorageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        // If parsed is empty or has fewer than 2 days, combine with seed
        if (Object.keys(parsed).length < 2) {
          const seed = generateInitialSeedHistory();
          const merged = { ...seed, ...parsed };
          setProgressHistory(merged);
          localStorage.setItem(historyStorageKey, JSON.stringify(merged));
        } else {
          setProgressHistory(parsed);
        }
      } else {
        const seed = generateInitialSeedHistory();
        setProgressHistory(seed);
        localStorage.setItem(historyStorageKey, JSON.stringify(seed));
      }
    } catch (e) {
      const seed = generateInitialSeedHistory();
      setProgressHistory(seed);
    }
  }, [historyStorageKey, generateInitialSeedHistory]);

  // Record / update a day's progress snapshot
  const recordDailyProgress = useCallback((dateStr, total, completed) => {
    setProgressHistory(prev => {
      const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
      const updated = {
        ...prev,
        [dateStr]: {
          date: dateStr,
          total,
          completed,
          rate,
          updated_at: new Date().toISOString()
        }
      };
      try {
        localStorage.setItem(historyStorageKey, JSON.stringify(updated));
      } catch (err) {}
      return updated;
    });
  }, [historyStorageKey]);

  // Backfill or regenerate seed history
  const seedProgressHistory = useCallback((customSeed = null) => {
    const seed = customSeed || generateInitialSeedHistory();
    setProgressHistory(prev => {
      const merged = { ...seed, ...prev };
      try {
        localStorage.setItem(historyStorageKey, JSON.stringify(merged));
      } catch (err) {}
      return merged;
    });
  }, [historyStorageKey, generateInitialSeedHistory]);

  // Task Auto-Archive & Timeline Cleanup Configuration
  // Modes: 'midnight' (default: reset at 12:00 AM daily), 'time_passed' (auto-clear as timeline/time finishes), 'manual'
  const [autoArchiveMode, setAutoArchiveModeState] = useState(() => {
    return localStorage.getItem('ticksy_auto_archive_mode') || 'midnight';
  });

  const [archivedTodos, setArchivedTodos] = useState(() => {
    try {
      const stored = localStorage.getItem(`ticksy_archived_todos_${user?.id || 'guest'}`);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const setAutoArchiveMode = (mode) => {
    setAutoArchiveModeState(mode);
    localStorage.setItem('ticksy_auto_archive_mode', mode);
  };

  // Automatically sync today's progress snapshot into history
  useEffect(() => {
    const todayStr = getLocalDateString();
    const todayTodos = todos.filter(t => t.due_date === todayStr);

    if (todayTodos.length > 0) {
      const completed = todayTodos.filter(t => t.completed).length;
      recordDailyProgress(todayStr, todayTodos.length, completed);
    } else if (todos.length > 0) {
      const completed = todos.filter(t => t.completed).length;
      recordDailyProgress(todayStr, todos.length, completed);
    }
  }, [todos, recordDailyProgress]);

  // Perform automatic timeline cleanup & ensure daily progress is locked into database/history
  const cleanupFinishedTasks = useCallback(() => {
    if (autoArchiveMode === 'manual') return;

    const now = new Date();
    const todayStr = getLocalDateString(now);

    setTodos(currentTodos => {
      // Find tasks whose timeline has finished
      const tasksToArchive = currentTodos.filter(t => isTaskTimelineFinished(t, autoArchiveMode, now));
      if (tasksToArchive.length === 0) return currentTodos;

      // Group tasks by due_date to guarantee daily metrics are permanently saved into progressHistory
      const datesToRecord = {};
      currentTodos.forEach(t => {
        const d = t.due_date || t.created_at?.split('T')[0] || todayStr;
        if (!datesToRecord[d]) {
          datesToRecord[d] = { total: 0, completed: 0 };
        }
        datesToRecord[d].total += 1;
        if (t.completed) datesToRecord[d].completed += 1;
      });

      // Save each date's progress report into progressHistory
      Object.entries(datesToRecord).forEach(([dateStr, metrics]) => {
        recordDailyProgress(dateStr, metrics.total, metrics.completed);
      });

      // Add tasks to archived list so user can still see them under 'Archived' if needed
      setArchivedTodos(prev => {
        const updatedArchived = [...tasksToArchive, ...prev];
        try {
          localStorage.setItem(`ticksy_archived_todos_${user?.id || 'guest'}`, JSON.stringify(updatedArchived));
        } catch (e) {}
        return updatedArchived;
      });

      // Remove finished tasks from active todos list
      const remainingTodos = currentTodos.filter(t => !isTaskTimelineFinished(t, autoArchiveMode, now));

      // Also sync deletion to Supabase for archived tasks
      if (user && !isGuest && isSupabaseConfigured()) {
        const archiveIds = tasksToArchive.map(t => t.id);
        supabase.from('todos').delete().in('id', archiveIds).then(() => {
          setSyncStatus('synced');
        }).catch(err => {
          console.warn('Failed to delete archived tasks from Supabase:', err);
        });
      }

      return remainingTodos;
    });
  }, [autoArchiveMode, recordDailyProgress, user, isGuest]);

  // Run cleanup on mount, when mode changes, and on interval every 30 seconds
  useEffect(() => {
    cleanupFinishedTasks();
    const interval = setInterval(cleanupFinishedTasks, 30000);
    return () => clearInterval(interval);
  }, [cleanupFinishedTasks]);

  // Manual trigger to clear finished timeline tasks immediately
  const clearFinishedTasksNow = () => {
    cleanupFinishedTasks();
  };

  // Restore archived task back to active workspace
  const restoreArchivedTodo = async (todoId) => {
    const todoToRestore = archivedTodos.find(t => t.id === todoId);
    if (!todoToRestore) return;

    setArchivedTodos(prev => {
      const updated = prev.filter(t => t.id !== todoId);
      try {
        localStorage.setItem(`ticksy_archived_todos_${user?.id || 'guest'}`, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    const todayStr = getLocalDateString();
    const restoredTodo = {
      ...todoToRestore,
      completed: false,
      due_date: todoToRestore.due_date && todoToRestore.due_date < todayStr ? todayStr : todoToRestore.due_date
    };

    setTodos(prev => [restoredTodo, ...prev]);

    if (user && !isGuest && isSupabaseConfigured()) {
      try {
        setSyncStatus('syncing');
        await supabase.from('todos').insert([{
          ...restoredTodo,
          user_id: user.id
        }]);
        setSyncStatus('synced');
      } catch (err) {
        console.warn('Failed to restore todo to Supabase:', err);
      }
    }
  };

  // Permanently delete an archived task
  const deleteArchivedTodo = (todoId) => {
    setArchivedTodos(prev => {
      const updated = prev.filter(t => t.id !== todoId);
      try {
        localStorage.setItem(`ticksy_archived_todos_${user?.id || 'guest'}`, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  // Trigger celebration confetti
  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.65 },
        colors: ['#6366f1', '#a855f7', '#ec4899', '#06b6d4', '#10b981'],
        disableForReducedMotion: true
      });
    } catch (e) {
      // Ignore in non-browser context
    }
  };

  // Add new Todo
  const addTodo = async (newTodoData) => {
    const todoPayload = {
      id: 'todo-' + Date.now(),
      title: newTodoData.title.trim(),
      description: newTodoData.description?.trim() || '',
      priority: newTodoData.priority || 'medium',
      due_date: newTodoData.due_date || getLocalDateString(),
      due_time: newTodoData.due_time || '12:00',
      project_id: newTodoData.project_id || (projects[0]?.id ?? null),
      tags: newTodoData.tags || [],
      completed: false,
      created_at: new Date().toISOString()
    };

    // Optimistic UI update
    setTodos(prev => [todoPayload, ...prev]);

    if (user && !isGuest && isSupabaseConfigured()) {
      try {
        setSyncStatus('syncing');
        const dbPayload = {
          title: todoPayload.title,
          description: todoPayload.description,
          priority: todoPayload.priority,
          due_date: todoPayload.due_date,
          due_time: todoPayload.due_time,
          project_id: todoPayload.project_id || null,
          tags: todoPayload.tags,
          completed: false,
          user_id: user.id
        };

        const { data, error } = await supabase
          .from('todos')
          .insert([dbPayload])
          .select()
          .single();

        if (error) {
          console.error('Supabase insert todo error:', error);
          setSyncStatus('offline');
        } else if (data) {
          setTodos(prev => prev.map(t => t.id === todoPayload.id ? data : t));
          setSyncStatus('synced');
        }
      } catch (err) {
        console.error('Failed to sync todo to Supabase:', err);
        setSyncStatus('offline');
      }
    }
    return todoPayload;
  };

  // Toggle Todo completion
  const toggleTodo = async (id) => {
    const target = todos.find(t => t.id === id);
    if (!target) return;
    const nextCompleted = !target.completed;

    if (nextCompleted) {
      triggerConfetti();
    }

    setTodos(prev =>
      prev.map(t => (t.id === id ? { ...t, completed: nextCompleted, updated_at: new Date().toISOString() } : t))
    );

    if (user && !isGuest && isSupabaseConfigured()) {
      try {
        setSyncStatus('syncing');
        const { error } = await supabase
          .from('todos')
          .update({ completed: nextCompleted, updated_at: new Date().toISOString() })
          .eq('id', id);

        if (error) {
          console.error('Supabase toggle error:', error);
          setSyncStatus('offline');
        } else {
          setSyncStatus('synced');
        }
      } catch (err) {
        setSyncStatus('offline');
      }
    }
  };

  // Update Todo details
  const updateTodo = async (id, updates) => {
    setTodos(prev =>
      prev.map(t => (t.id === id ? { ...t, ...updates, updated_at: new Date().toISOString() } : t))
    );

    if (user && !isGuest && isSupabaseConfigured()) {
      try {
        setSyncStatus('syncing');
        const { error } = await supabase
          .from('todos')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', id);

        if (error) {
          console.error('Supabase update error:', error);
          setSyncStatus('offline');
        } else {
          setSyncStatus('synced');
        }
      } catch (err) {
        setSyncStatus('offline');
      }
    }
  };

  // Delete Todo with Undo Support
  const [deleteToast, setDeleteToast] = useState(null); // { show: boolean, todo: object }
  const [lastDeletedTodo, setLastDeletedTodo] = useState(null);

  const deleteTodo = async (id) => {
    const target = todos.find(t => t.id === id);
    if (!target) return;

    setLastDeletedTodo(target);
    setDeleteToast({
      show: true,
      title: target.title,
      todo: target
    });

    // Remove from UI optimistically
    setTodos(prev => prev.filter(t => t.id !== id));

    if (user && !isGuest && isSupabaseConfigured()) {
      try {
        setSyncStatus('syncing');
        const { error } = await supabase.from('todos').delete().eq('id', id);
        if (error) {
          console.error('Supabase delete error:', error);
          setSyncStatus('offline');
        } else {
          setSyncStatus('synced');
        }
      } catch (err) {
        setSyncStatus('offline');
      }
    }
  };

  const undoDelete = async () => {
    if (!lastDeletedTodo) return;
    const restored = { ...lastDeletedTodo };
    setTodos(prev => [restored, ...prev]);
    setDeleteToast(null);
    setLastDeletedTodo(null);

    if (user && !isGuest && isSupabaseConfigured()) {
      try {
        setSyncStatus('syncing');
        await supabase.from('todos').insert([{ ...restored, user_id: user.id }]);
        setSyncStatus('synced');
      } catch (err) {
        setSyncStatus('offline');
      }
    }
  };

  const dismissDeleteToast = () => {
    setDeleteToast(null);
  };

  // Add Project
  const addProject = async (projectData) => {
    const newProj = {
      id: 'proj-' + Date.now(),
      name: projectData.name.trim(),
      description: projectData.description?.trim() || '',
      color: projectData.color || '#6366f1',
      icon: projectData.icon || 'folder',
      created_at: new Date().toISOString()
    };

    setProjects(prev => [...prev, newProj]);

    if (user && !isGuest && isSupabaseConfigured()) {
      try {
        setSyncStatus('syncing');
        const { data, error } = await supabase
          .from('projects')
          .insert([{
            ...newProj,
            id: undefined,
            user_id: user.id
          }])
          .select()
          .single();

        if (error) {
          console.error('Supabase insert project error:', error);
          setSyncStatus('offline');
        } else if (data) {
          setProjects(prev => prev.map(p => p.id === newProj.id ? data : p));
          setSyncStatus('synced');
        }
      } catch (err) {
        setSyncStatus('offline');
      }
    }
    return newProj;
  };

  // Delete Project
  const deleteProject = async (projectId) => {
    setProjects(prev => prev.filter(p => p.id !== projectId));
    // Also remove project from associated todos or keep them unassigned
    setTodos(prev => prev.map(t => t.project_id === projectId ? { ...t, project_id: null } : t));

    if (user && !isGuest && isSupabaseConfigured()) {
      try {
        setSyncStatus('syncing');
        const { error } = await supabase.from('projects').delete().eq('id', projectId);
        if (error) setSyncStatus('offline');
        else setSyncStatus('synced');
      } catch (err) {
        setSyncStatus('offline');
      }
    }
  };

  // Filtered Todos calculation (strictly evaluated in local timezone)
  const todayStr = getLocalDateString();

  const sourceTodoList = activeFilter === 'archived' ? archivedTodos : todos;

  const filteredTodos = sourceTodoList.filter(todo => {
    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesTitle = todo.title.toLowerCase().includes(q);
      const matchesDesc = (todo.description || '').toLowerCase().includes(q);
      const matchesTags = (todo.tags || []).some(tag => tag.toLowerCase().includes(q));
      if (!matchesTitle && !matchesDesc && !matchesTags) return false;
    }

    // Archived view returns all matching archived items
    if (activeFilter === 'archived') {
      return true;
    }

    // Project filter
    if (activeProject !== 'all' && todo.project_id !== activeProject) {
      return false;
    }

    // Calendar selected date filter
    if (selectedCalendarDate) {
      return todo.due_date === selectedCalendarDate;
    }

    // Status / View filter
    if (activeFilter === 'today') {
      return todo.due_date === todayStr;
    }
    if (activeFilter === 'upcoming') {
      return todo.due_date && todo.due_date > todayStr && !todo.completed;
    }
    if (activeFilter === 'completed') {
      return todo.completed;
    }
    if (activeFilter === 'active') {
      return !todo.completed;
    }
    if (activeFilter === 'urgent') {
      return (todo.priority === 'urgent' || todo.priority === 'high') && !todo.completed;
    }

    return true;
  });

  // Calculate statistics
  const stats = {
    total: todos.length,
    completed: todos.filter(t => t.completed).length,
    pending: todos.filter(t => !t.completed).length,
    todayCount: todos.filter(t => t.due_date === todayStr && !t.completed).length,
    urgentCount: todos.filter(t => (t.priority === 'urgent' || t.priority === 'high') && !t.completed).length,
    completionPercentage: todos.length ? Math.round((todos.filter(t => t.completed).length / todos.length) * 100) : 0,
    archivedCount: archivedTodos.length
  };

  // Reorder todos (Drag & Drop prioritization)
  const reorderTodos = (newOrderedTodos) => {
    setTodos(newOrderedTodos);
    if (isGuest) {
      localStorage.setItem('donestack_guest_todos', JSON.stringify(newOrderedTodos));
    } else if (user?.id) {
      try {
        const orderIds = newOrderedTodos.map(t => t.id);
        localStorage.setItem(`ticksy_order_${user.id}`, JSON.stringify(orderIds));
      } catch (e) {
        console.warn('Failed to save todo ordering', e);
      }
    }
  };

  return (
    <TodoContext.Provider
      value={{
        todos,
        projects,
        loading,
        syncStatus,
        activeFilter,
        setActiveFilter,
        activeProject,
        setActiveProject,
        selectedCalendarDate,
        setSelectedCalendarDate,
        searchQuery,
        setSearchQuery,
        filteredTodos,
        stats,
        addTodo,
        updateTodo,
        deleteTodo,
        undoDelete,
        deleteToast,
        dismissDeleteToast,
        toggleTodo,
        reorderTodos,
        progressHistory,
        recordDailyProgress,
        seedProgressHistory,
        autoArchiveMode,
        setAutoArchiveMode,
        archivedTodos,
        cleanupFinishedTasks,
        clearFinishedTasksNow,
        restoreArchivedTodo,
        deleteArchivedTodo,
        addProject,
        deleteProject,
        refreshData: loadData,
        triggerConfetti
      }}
    >
      {children}
    </TodoContext.Provider>
  );
};

export const useTodos = () => useContext(TodoContext);
