import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase, updateLastLogin, getUserApiKeys } from '../supabase';

// Create the authentication context
const AuthContext = createContext();

// Provider component that wraps the app and makes auth object available to any child component that calls useAuth()
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionId] = useState(() => localStorage.getItem('mindmap_session_id') || crypto.randomUUID());
  const [userApiKeys, setUserApiKeys] = useState(null);

  // Helper function to load API keys for a user
  const loadUserApiKeys = async (userId) => {
    if (!userId) return null;
    
    try {
      console.log('AuthContext: Loading API keys for user', userId);
      
      // First try to get keys from sessionStorage for quick response
      const cachedKeys = sessionStorage.getItem('user_api_keys');
      if (cachedKeys) {
        try {
          const parsedKeys = JSON.parse(cachedKeys);
          console.log('AuthContext: Using cached API keys from session storage');
          setUserApiKeys(parsedKeys);
          return parsedKeys;
        } catch (err) {
          console.error('AuthContext: Error parsing cached API keys:', err);
          // Continue to fetch from database if parsing fails
        }
      }
      
      // If no cached keys, or parsing failed, fetch from database
      const keys = await getUserApiKeys(userId);
      if (keys) {
        console.log('AuthContext: Successfully loaded API keys from database');
        setUserApiKeys(keys);
        
        // Store keys in a session-only storage for quick access and page reloads
        sessionStorage.setItem('user_api_keys', JSON.stringify(keys));
        return keys;
      } else {
        console.log('AuthContext: No API keys found for user');
        return null;
      }
    } catch (err) {
      console.error('AuthContext: Error loading user API keys:', err);
      return null;
    }
  };

  // Try to load cached API keys from session storage on initial load
  useEffect(() => {
    const loadCachedKeys = () => {
      const cachedKeys = sessionStorage.getItem('user_api_keys');
      if (cachedKeys) {
        try {
          const parsedKeys = JSON.parse(cachedKeys);
          setUserApiKeys(parsedKeys);
          console.log('AuthContext: Loaded API keys from session storage on init');
        } catch (err) {
          console.error('AuthContext: Error parsing cached API keys on init:', err);
          sessionStorage.removeItem('user_api_keys'); // Remove invalid data
        }
      }
    };
    
    loadCachedKeys();
  }, []);

  // Listen for authentication state changes
  useEffect(() => {
    // Store session ID for anonymous users
    if (!localStorage.getItem('mindmap_session_id')) {
      localStorage.setItem('mindmap_session_id', sessionId);
    }

    // Set up the subscription to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('AuthContext: Auth state changed:', event);
        if (session?.user) {
          setUser(session.user);
          await updateLastLogin(session.user.id);
          
          // Load API keys when user logs in
          if (event === 'SIGNED_IN') {
            await loadUserApiKeys(session.user.id);
          }
        } else {
          setUser(null);
          // Clear API keys when user logs out
          if (event === 'SIGNED_OUT') {
            setUserApiKeys(null);
            sessionStorage.removeItem('user_api_keys');
          }
        }
        setLoading(false);
      }
    );

    // Check for an active session on init
    checkUser();

    // Clean up the subscription
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [sessionId]);

  // Check if there's an active user session
  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        await updateLastLogin(user.id);
        
        // Load API keys on initial load for existing session
        await loadUserApiKeys(user.id);
      }
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setLoading(false);
    }
  };

  // Sign up a new user
  const signUp = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      // The user profile will be created automatically by the database trigger
      // Let's verify that the profile exists and update it with initial values
      if (data?.user) {
        try {
          // We wait a moment to ensure the trigger has time to execute
          setTimeout(async () => {
            const { error: checkError } = await supabase
              .from('user_profiles')
              .select('id')
              .eq('id', data.user.id)
              .single();
              
            if (checkError) {
              // If profile doesn't exist yet, create it manually as a fallback
              const { error: insertError } = await supabase
                .from('user_profiles')
                .insert({
                  id: data.user.id,
                  research_count: 0,
                  normal_count: 0,
                  last_login: new Date(),
                  total_generations: 0
                });
                
              if (insertError) console.error('Error creating user profile:', insertError);
            }
          }, 1000);
          
          // Transfer any anonymous usage to the new account
          await transferAnonymousUsage(data.user.id);
        } catch (profileError) {
          console.error('Error handling user profile:', profileError);
        }
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error signing up:', error);
      return { success: false, error };
    }
  };

  // Sign in a user
  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error signing in:', error);
      return { success: false, error };
    }
  };

  // Direct force signout method
  const signOut = () => {
    console.log('AuthContext: Force signing out...');
    
    // 1. Explicitly clear user state
    setUser(null);
    
    // 2. Clear all auth-related items from localStorage
    Object.keys(localStorage).forEach(key => {
      if (key.includes('supabase') || key.includes('auth') || key.includes('token') || key.includes('mindmap_auth')) {
        localStorage.removeItem(key);
      }
    });
    
    // 3. Force page reload immediately
    window.location.href = '/';
    
    return { success: true };
  };

  // Reset password
  const resetPassword = async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error resetting password:', error);
      return { success: false, error };
    }
  };

  // Use localStorage to track anonymous usage
  const getAnonymousUsage = () => {
    return JSON.parse(localStorage.getItem('mindmap_usage') || '{"research": 0, "normal": 0}');
  };

  // Transfer anonymous usage to user account after login
  const transferAnonymousUsage = async (userId) => {
    const localUsage = getAnonymousUsage();
    
    if (localUsage.research > 0 || localUsage.normal > 0) {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          research_count: supabase.rpc('add_counts', { row_id: userId, count_to_add: localUsage.research, field_name: 'research_count' }),
          normal_count: supabase.rpc('add_counts', { row_id: userId, count_to_add: localUsage.normal, field_name: 'normal_count' }),
          total_generations: supabase.rpc('add_counts', { row_id: userId, count_to_add: localUsage.research + localUsage.normal, field_name: 'total_generations' })
        })
        .eq('id', userId);
      
      if (!error) {
        // Clear local storage after transferring
        localStorage.setItem('mindmap_usage', JSON.stringify({"research": 0, "normal": 0}));
      }
    }
  };

  // Value object to be passed to consumers
  const value = {
    user,
    loading,
    sessionId,
    userApiKeys,
    loadUserApiKeys,
    signUp,
    signIn,
    signOut,
    resetPassword,
    getAnonymousUsage,
    transferAnonymousUsage
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 