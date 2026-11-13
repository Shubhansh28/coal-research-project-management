import { useState, useEffect, useCallback } from 'react';
import { AuthContext } from './auth-context';
import { authApi } from '../api/client';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Check active session against GET /api/auth/me
   */
  const checkAuth = useCallback(async () => {
    try {
      setError(null);
      const data = await authApi.me();
      if (data?.success && data?.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      // 401 simply means unauthenticated (not an application crash)
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function verifySession() {
      try {
        const data = await authApi.me();
        if (isMounted) {
          if (data?.success && data?.user) {
            setUser(data.user);
          } else {
            setUser(null);
          }
        }
      } catch {
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    verifySession();

    return () => {
      isMounted = false;
    };
  }, []);

  /**
   * Log in user and establish session cookie
   */
  const login = async ({ email, password }) => {
    setError(null);
    const data = await authApi.login({ email, password });
    if (data?.success && data?.user) {
      setUser(data.user);
      return data.user;
    }
    throw new Error(data?.message || 'Login failed');
  };

  /**
   * Register a new user
   */
  const signup = async ({ name, email, password }) => {
    setError(null);
    const data = await authApi.signup({ name, email, password });
    return data;
  };

  /**
   * Terminate current session
   */
  const logout = () => {
    setUser(null);
    window.location.href = '/login';
  };

  const value = {
    user,
    role: user?.role || null,
    isAdmin: user?.role === 'ADMIN',
    isResearcher: user?.role === 'RESEARCHER',
    isAuthenticated: !!user,
    loading,
    error,
    login,
    signup,
    logout,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
