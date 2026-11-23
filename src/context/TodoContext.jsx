import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { INITIAL_TODOS, INITIAL_PROJECTS, DEFAULT_USER_PROJECT } from '../constants/mockData';
import { getLocalDateString, getOffsetDateString, isTaskTimelineFinished, getTaskDate } from '../lib/dateUtils';

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

        let loadedProjects = userProjects || [];

        // Check local storage for any projects previously created or cached
        try {
          const cachedProjects = localStorage.getItem(`ticksy_projects_${user.id}`);
          if (cachedProjects) {
            const parsed = JSON.parse(cachedProjects);
            if (Array.isArray(parsed) && parsed.length > 0) {
              const map = new Map(loadedProjects.map(p => [p.id, p]));
              parsed.forEach(p => {
                if (!map.has(p.id)) map.set(p.id, p);
              });
              loadedProjects = Array.from(map.values());
            }
          }
        } catch (e) {}

        // If new or existing user has 0 projects, provide the default General project
        if (loadedProjects.length === 0) {
          loadedProjects = [DEFAULT_USER_PROJECT];
          if (isSupabaseConfigured()) {
            supabase.from('projects').insert([{
              name: DEFAULT_USER_PROJECT.name,
              description: DEFAULT_USER_PROJECT.description,
              color: DEFAULT_USER_PROJECT.color,
              icon: DEFAULT_USER_PROJECT.icon,
              user_id: user.id
            }]).then(({ data }) => {
              if (data) setProjects([data]);
            }).catch(() => {});
          }
        }

        setProjects(loadedProjects);
        try {
          localStorage.setItem(`ticksy_projects_${user.id}`, JSON.stringify(loadedProjects));
        } catch (e) {}

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

  // Lightweight Daily Progress History Engine (Stores only actual, real daily metrics)
  const historyStorageKey = user?.id ? `ticksy_progress_history_${user.id}` : 'ticksy_progress_history_guest';
  const [progressHistory, setProgressHistory] = useState({});

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

  // Synchronize progress history strictly from current active + archived tasks
  const syncProgressHistory = useCallback((currentTodos, currentArchived) => {
    const activeList = currentTodos !== undefined ? currentTodos : todos;
    const archivedList = currentArchived !== undefined ? currentArchived : archivedTodos;
    const combined = [...(activeList || []), ...(archivedList || [])];
    const dateStats = {};

    combined.forEach(t => {
      // Attribute each task strictly to ONE single date: created_at date in local timezone
      const dateKey = getTaskDate(t);
      if (!dateStats[dateKey]) {
        dateStats[dateKey] = { date: dateKey, total: 0, completed: 0, rate: 0 };
      }
      dateStats[dateKey].total += 1;
      if (t.completed) {
        dateStats[dateKey].completed += 1;
      }
    });

    Object.keys(dateStats).forEach(d => {
      const s = dateStats[d];
      s.rate = s.total > 0 ? Math.round((s.completed / s.total) * 100) : 0;
      s.updated_at = new Date().toISOString();
    });

    setProgressHistory(dateStats);
    try {
      localStorage.setItem(historyStorageKey, JSON.stringify(dateStats));
    } catch (err) {}
    return dateStats;
  }, [todos, archivedTodos, historyStorageKey]);

  // Keep progress synchronized with actual tasks whenever tasks or archives change
  useEffect(() => {
    syncProgressHistory(todos, archivedTodos);
  }, [todos, archivedTodos, syncProgressHistory]);

  // Purge any legacy fake seed data and load only genuine historical records
  useEffect(() => {
    const keysToCheck = ['ticksy_progress_history_guest'];
    if (user?.id) keysToCheck.push(`ticksy_progress_history_${user.id}`);

    keysToCheck.forEach(key => {
      try {
        const stored = localStorage.getItem(key);
        if (stored) {
          const parsed = JSON.parse(stored);
          const realHistory = {};
          let hasLegacyFake = false;
          Object.entries(parsed).forEach(([dStr, val]) => {
            if (val && !val.isSnapshot && typeof val.total === 'number') {
              realHistory[dStr] = val;
            } else {
              hasLegacyFake = true;
            }
          });
          if (hasLegacyFake) {
            localStorage.setItem(key, JSON.stringify(realHistory));
          }
        }
      } catch (e) {}
    });
  }, [user]);

  // Perform automatic timeline cleanup & ensure daily progress is locked into database/history
  const cleanupFinishedTasks = useCallback(() => {
    if (autoArchiveMode === 'manual') return;

    const now = new Date();
    const todayStr = getLocalDateString(now);

    setTodos(currentTodos => {
      // Find tasks whose timeline has finished
      const tasksToArchive = currentTodos.filter(t => isTaskTimelineFinished(t, autoArchiveMode, now));
      if (tasksToArchive.length === 0) return currentTodos;

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
  }, [autoArchiveMode, user, isGuest]);

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

    const remainingArchived = archivedTodos.filter(t => t.id !== todoId);
    setArchivedTodos(remainingArchived);
    try {
      localStorage.setItem(`ticksy_archived_todos_${user?.id || 'guest'}`, JSON.stringify(remainingArchived));
    } catch (e) {}

    const todayStr = getLocalDateString();
    const restoredTodo = {
      ...todoToRestore,
      completed: false,
      due_date: todoToRestore.due_date && todoToRestore.due_date < todayStr ? todayStr : todoToRestore.due_date
    };

    const updatedTodos = [restoredTodo, ...todos];
    setTodos(updatedTodos);
    syncProgressHistory(updatedTodos, remainingArchived);

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
    const remainingArchived = archivedTodos.filter(t => t.id !== todoId);
    setArchivedTodos(remainingArchived);
    try {
      localStorage.setItem(`ticksy_archived_todos_${user?.id || 'guest'}`, JSON.stringify(remainingArchived));
    } catch (e) {}
    syncProgressHistory(todos, remainingArchived);
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

    // 1. Remove from UI optimistically
    const remainingTodos = todos.filter(t => t.id !== id);
    setTodos(remainingTodos);

    // 2. Also remove from archived if present
    const remainingArchived = archivedTodos.filter(t => t.id !== id);
    if (remainingArchived.length !== archivedTodos.length) {
      setArchivedTodos(remainingArchived);
      try {
        localStorage.setItem(`ticksy_archived_todos_${user?.id || 'guest'}`, JSON.stringify(remainingArchived));
      } catch (e) {}
    }

    // 3. Immediately re-calculate and save progress history without the deleted task
    syncProgressHistory(remainingTodos, remainingArchived);

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
    const updatedTodos = [restored, ...todos];
    setTodos(updatedTodos);
    setDeleteToast(null);
    setLastDeletedTodo(null);
    syncProgressHistory(updatedTodos, archivedTodos);

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

    setProjects(prev => {
      const updated = [...prev, newProj];
      try {
        localStorage.setItem(`ticksy_projects_${user?.id || 'guest'}`, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    if (user && !isGuest && isSupabaseConfigured()) {
      try {
        setSyncStatus('syncing');
        const { data, error } = await supabase
          .from('projects')
          .insert([{
            name: newProj.name,
            description: newProj.description,
            color: newProj.color,
            icon: newProj.icon,
            user_id: user.id
          }])
          .select()
          .single();

        if (error) {
          console.error('Supabase insert project error:', error);
          setSyncStatus('offline');
        } else if (data) {
          setProjects(prev => {
            const updated = prev.map(p => p.id === newProj.id ? data : p);
            try {
              localStorage.setItem(`ticksy_projects_${user.id}`, JSON.stringify(updated));
            } catch (e) {}
            return updated;
          });
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
    setProjects(prev => {
      const updated = prev.filter(p => p.id !== projectId);
      try {
        localStorage.setItem(`ticksy_projects_${user?.id || 'guest'}`, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
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
        syncProgressHistory,
        recordDailyProgress: syncProgressHistory,
        recalculateActualHistory: syncProgressHistory,
        seedProgressHistory: syncProgressHistory,
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
