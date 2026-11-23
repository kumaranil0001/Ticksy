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

  const userId = user?.id;

  const isUuid = (str) => {
    return typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
  };

  // Load Initial Data (Offline-First / Cache-First from Local Storage & Supabase)
  const loadData = useCallback(async () => {
    setLoading(true);

    if (user && !isGuest && isSupabaseConfigured()) {
      try {
        setSyncStatus('syncing');

        // 1. Immediately load cached data from localStorage to prevent any empty flash
        let cachedProjectsList = [];
        try {
          const cachedProjStr = localStorage.getItem(`ticksy_projects_${user.id}`);
          if (cachedProjStr) {
            const parsed = JSON.parse(cachedProjStr);
            if (Array.isArray(parsed) && parsed.length > 0) {
              cachedProjectsList = parsed;
              setProjects(parsed);
            }
          }
        } catch (e) {}

        let cachedTodosList = [];
        try {
          const cachedTodoStr = localStorage.getItem(`ticksy_todos_${user.id}`);
          if (cachedTodoStr) {
            const parsed = JSON.parse(cachedTodoStr);
            if (Array.isArray(parsed) && parsed.length > 0) {
              cachedTodosList = parsed;
              setTodos(parsed);
            }
          }
        } catch (e) {}

        // 2. Fetch Projects from Supabase
        const { data: userProjects, error: projError } = await supabase
          .from('projects')
          .select('*')
          .order('created_at', { ascending: false });

        let loadedProjects = userProjects || [];

        // Merge Supabase projects with cached projects
        if (cachedProjectsList.length > 0) {
          const pMap = new Map(loadedProjects.map(p => [p.id, p]));
          cachedProjectsList.forEach(cp => {
            if (!pMap.has(cp.id)) pMap.set(cp.id, cp);
          });
          loadedProjects = Array.from(pMap.values());
        }

        // If new or existing user has 0 projects, provide the default General project and persist it to Supabase
        if (loadedProjects.length === 0) {
          try {
            const { data: newProjData, error: createProjErr } = await supabase
              .from('projects')
              .insert([{
                name: DEFAULT_USER_PROJECT.name,
                description: DEFAULT_USER_PROJECT.description,
                color: DEFAULT_USER_PROJECT.color,
                icon: DEFAULT_USER_PROJECT.icon,
                user_id: user.id
              }])
              .select()
              .single();

            if (newProjData) {
              loadedProjects = [newProjData];
            } else {
              loadedProjects = [DEFAULT_USER_PROJECT];
            }
          } catch (e) {
            loadedProjects = [DEFAULT_USER_PROJECT];
          }
        }

        setProjects(loadedProjects);
        try {
          localStorage.setItem(`ticksy_projects_${user.id}`, JSON.stringify(loadedProjects));
        } catch (e) {}

        // 3. Fetch Todos from Supabase
        const { data: userTodos, error: todoError } = await supabase
          .from('todos')
          .select('*')
          .order('created_at', { ascending: false });

        let finalTodos = [];

        if (todoError) {
          console.warn('Supabase todos fetch error:', todoError);
          // CRITICAL: NEVER wipe local data on fetch error! Use cached todos
          finalTodos = cachedTodosList;
          setSyncStatus('offline');
        } else {
          const rawTodos = userTodos || [];

          if (rawTodos.length === 0 && cachedTodosList.length > 0) {
            // Local cache has tasks, but Supabase returned 0 (e.g. initial sync or network recovery)
            // Keep user tasks and sync them up to Supabase in the background!
            finalTodos = cachedTodosList;
            cachedTodosList.forEach(async (ct) => {
              try {
                const dbPayload = {
                  title: ct.title,
                  description: ct.description || '',
                  priority: ct.priority || 'medium',
                  due_date: ct.due_date,
                  due_time: ct.due_time || '12:00',
                  project_id: isUuid(ct.project_id) ? ct.project_id : null,
                  tags: ct.tags || [],
                  completed: !!ct.completed,
                  user_id: user.id
                };
                await supabase.from('todos').insert([dbPayload]);
              } catch (err) {}
            });
          } else {
            // Merge Supabase tasks with any unsaved local tasks
            const todoMap = new Map();
            rawTodos.forEach(t => todoMap.set(t.id, t));
            cachedTodosList.forEach(t => {
              if (!todoMap.has(t.id)) todoMap.set(t.id, t);
            });
            finalTodos = Array.from(todoMap.values());
          }
          setSyncStatus('synced');
        }

        // Apply saved custom priority order if present
        try {
          const savedOrderStr = localStorage.getItem(`ticksy_order_${user.id}`);
          if (savedOrderStr) {
            const savedOrderIds = JSON.parse(savedOrderStr);
            const todoMap = new Map(finalTodos.map(t => [t.id, t]));
            const orderedList = [];
            for (const id of savedOrderIds) {
              if (todoMap.has(id)) {
                orderedList.push(todoMap.get(id));
                todoMap.delete(id);
              }
            }
            for (const leftover of todoMap.values()) {
              orderedList.push(leftover);
            }
            finalTodos = orderedList;
          }
        } catch (e) {}

        setTodos(finalTodos);
        try {
          localStorage.setItem(`ticksy_todos_${user.id}`, JSON.stringify(finalTodos));
        } catch (e) {}
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
      // Unauthenticated state
      setTodos([]);
      setProjects([]);
      setSyncStatus('synced');
      setLoading(false);
    }
  }, [userId, isGuest]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Persist to local storage for BOTH authenticated users and guest users
  useEffect(() => {
    const todosKey = user?.id ? `ticksy_todos_${user.id}` : (isGuest ? 'donestack_guest_todos' : null);
    const projectsKey = user?.id ? `ticksy_projects_${user.id}` : (isGuest ? 'donestack_guest_projects' : null);

    if (todosKey && todos) {
      try {
        localStorage.setItem(todosKey, JSON.stringify(todos));
      } catch (e) {}
    }
    if (projectsKey && projects) {
      try {
        localStorage.setItem(projectsKey, JSON.stringify(projects));
      } catch (e) {}
    }
  }, [todos, projects, user?.id, isGuest]);

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

    setTodos(currentTodos => {
      // Find tasks whose timeline has finished (strictly completed tasks whose due date has passed)
      const tasksToArchive = currentTodos.filter(t => isTaskTimelineFinished(t, autoArchiveMode, now));
      if (tasksToArchive.length === 0) return currentTodos;

      // Add tasks to archived list so user can still see them under 'Archived' view
      setArchivedTodos(prev => {
        const updatedArchived = [...tasksToArchive, ...prev];
        try {
          localStorage.setItem(`ticksy_archived_todos_${user?.id || 'guest'}`, JSON.stringify(updatedArchived));
        } catch (e) {}
        return updatedArchived;
      });

      // Remove finished tasks from active todos list
      const remainingTodos = currentTodos.filter(t => !isTaskTimelineFinished(t, autoArchiveMode, now));

      // Update local storage for active todos immediately
      const todosKey = user?.id ? `ticksy_todos_${user.id}` : (isGuest ? 'donestack_guest_todos' : null);
      if (todosKey) {
        try {
          localStorage.setItem(todosKey, JSON.stringify(remainingTodos));
        } catch (e) {}
      }

      return remainingTodos;
    });
  }, [autoArchiveMode, user?.id, isGuest]);

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
    const tempId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'todo-' + Date.now();
    const targetProj = projects.find(p => p.id === newTodoData.project_id) || projects[0];
    const targetProjId = newTodoData.project_id || (targetProj?.id ?? null);
    // Project ID in Supabase must strictly be a valid UUID; null is safely allowed
    const validDbProjectId = isUuid(targetProjId) ? targetProjId : null;

    const todoPayload = {
      id: tempId,
      title: newTodoData.title.trim(),
      description: newTodoData.description?.trim() || '',
      priority: newTodoData.priority || 'medium',
      due_date: newTodoData.due_date || getLocalDateString(),
      due_time: newTodoData.due_time || '12:00',
      project_id: targetProjId,
      tags: newTodoData.tags || [],
      completed: false,
      created_at: new Date().toISOString()
    };

    // Optimistic UI update & immediate local persistence
    setTodos(prev => {
      const updated = [todoPayload, ...prev];
      const storageKey = user?.id ? `ticksy_todos_${user.id}` : (isGuest ? 'donestack_guest_todos' : null);
      if (storageKey) {
        try { localStorage.setItem(storageKey, JSON.stringify(updated)); } catch (e) {}
      }
      return updated;
    });

    if (user && !isGuest && isSupabaseConfigured()) {
      try {
        setSyncStatus('syncing');
        const dbPayload = {
          title: todoPayload.title,
          description: todoPayload.description,
          priority: todoPayload.priority,
          due_date: todoPayload.due_date,
          due_time: todoPayload.due_time,
          project_id: validDbProjectId,
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
          setTodos(prev => {
            const updated = prev.map(t => t.id === todoPayload.id ? data : t);
            const storageKey = user?.id ? `ticksy_todos_${user.id}` : (isGuest ? 'donestack_guest_todos' : null);
            if (storageKey) {
              try { localStorage.setItem(storageKey, JSON.stringify(updated)); } catch (e) {}
            }
            return updated;
          });
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

    if (user && !isGuest && isSupabaseConfigured() && isUuid(id)) {
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
          // Also link any pending todos to the real Supabase project ID
          setTodos(prev => prev.map(t => t.project_id === newProj.id ? { ...t, project_id: data.id } : t));
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

    if (user && !isGuest && isSupabaseConfigured() && isUuid(projectId)) {
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
