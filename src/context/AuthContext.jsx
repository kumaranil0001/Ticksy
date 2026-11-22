import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [isGuest, setIsGuest] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const configured = isSupabaseConfigured();

  useEffect(() => {
    // Check if user was previously in guest mode
    const storedGuest = localStorage.getItem('donestack_guest_user');
    if (storedGuest) {
      try {
        const guestData = JSON.parse(storedGuest);
        setUser(guestData);
        setIsGuest(true);
        setLoading(false);
        return;
      } catch (e) {
        localStorage.removeItem('donestack_guest_user');
      }
    }

    if (!configured) {
      setLoading(false);
      return;
    }

    // Check active Supabase session
    const getInitialSession = async () => {
      try {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Session retrieval error:', error);
        }
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
      } catch (err) {
        console.error('Unexpected auth check error:', err);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for Supabase auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (newSession?.user) {
        setIsGuest(false);
        localStorage.removeItem('donestack_guest_user');
      }
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [configured]);

  const signUp = async ({ email, password, fullName }) => {
    setAuthError(null);
    if (!configured) {
      // In unconfigured mode, seamlessly allow trial
      const mockUser = {
        id: 'guest-' + Date.now(),
        email,
        user_metadata: { full_name: fullName || email.split('@')[0] },
        created_at: new Date().toISOString()
      };
      setUser(mockUser);
      setIsGuest(true);
      localStorage.setItem('donestack_guest_user', JSON.stringify(mockUser));
      return { data: { user: mockUser }, error: null };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      });
      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      setAuthError(err.message);
      return { data: null, error: err };
    }
  };

  const signIn = async ({ email, password }) => {
    setAuthError(null);
    if (!configured) {
      // Seamless fallback
      const mockUser = {
        id: 'guest-' + Date.now(),
        email,
        user_metadata: { full_name: email.split('@')[0] },
        created_at: new Date().toISOString()
      };
      setUser(mockUser);
      setIsGuest(true);
      localStorage.setItem('donestack_guest_user', JSON.stringify(mockUser));
      return { data: { user: mockUser }, error: null };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      setAuthError(err.message);
      return { data: null, error: err };
    }
  };

  const signOut = async () => {
    setAuthError(null);
    if (isGuest) {
      localStorage.removeItem('donestack_guest_user');
      setUser(null);
      setIsGuest(false);
      return { error: null };
    }

    if (configured) {
      try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      } catch (err) {
        console.error('Sign out error:', err);
      }
    }
    setUser(null);
    setSession(null);
  };

  const loginAsGuest = () => {
    const guestUser = {
      id: 'guest-explorer-101',
      email: 'alex.creator@ticksy.dev',
      user_metadata: {
        full_name: 'Alex Rivera',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'
      },
      created_at: new Date().toISOString()
    };
    setUser(guestUser);
    setIsGuest(true);
    localStorage.setItem('donestack_guest_user', JSON.stringify(guestUser));
  };

  const updateProfile = async ({ fullName }) => {
    setAuthError(null);
    const trimmed = (fullName || '').trim();
    if (!trimmed) {
      const err = new Error('Username / Full name cannot be empty');
      setAuthError(err.message);
      return { data: null, error: err };
    }

    if (isGuest || !configured) {
      const updatedUser = {
        ...user,
        user_metadata: {
          ...(user?.user_metadata || {}),
          full_name: trimmed
        }
      };
      setUser(updatedUser);
      localStorage.setItem('donestack_guest_user', JSON.stringify(updatedUser));
      return { data: { user: updatedUser }, error: null };
    }

    try {
      const { data, error } = await supabase.auth.updateUser({
        data: { full_name: trimmed }
      });
      if (error) throw error;
      if (data?.user) {
        setUser(data.user);
      }
      return { data, error: null };
    } catch (err) {
      setAuthError(err.message);
      return { data: null, error: err };
    }
  };

  const updatePassword = async ({ newPassword }) => {
    setAuthError(null);
    if (!newPassword || newPassword.length < 6) {
      const err = new Error('Password must be at least 6 characters long');
      setAuthError(err.message);
      return { data: null, error: err };
    }

    if (isGuest || !configured) {
      return { data: { message: 'Password updated successfully for local session' }, error: null };
    }

    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      });
      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      setAuthError(err.message);
      return { data: null, error: err };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isGuest,
        loading,
        authError,
        isConfigured: configured,
        signUp,
        signIn,
        signOut,
        loginAsGuest,
        updateProfile,
        updatePassword,
        clearError: () => setAuthError(null)
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
