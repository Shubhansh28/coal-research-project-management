import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import { authApi } from '../api/client';
import { clearCookie, getCookie } from './cookieStorage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    const cookie = await getCookie();
    if (Platform.OS !== 'web' && !cookie) {
      setUser(null);
      setLoading(false);
      return null;
    }
    try {
      const { data } = await authApi.me();
      setUser(data?.user || null);
      return data?.user || null;
    } catch {
      await clearCookie();
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { checkAuth(); }, [checkAuth]);

  const login = async (credentials) => {
    const { data } = await authApi.login(credentials);
    setUser(data.user);
    return data.user;
  };
  const signup = async (details) => (await authApi.signup(details)).data;
  const logout = async () => {
    await clearCookie();
    setUser(null);
  };

  const value = useMemo(() => ({
    user,
    role: user?.role || null,
    isAdmin: user?.role === 'ADMIN',
    isResearcher: user?.role === 'RESEARCHER',
    isAuthenticated: Boolean(user),
    loading,
    login,
    signup,
    logout,
    checkAuth
  }), [user, loading, checkAuth]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
