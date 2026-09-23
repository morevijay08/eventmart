'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import API from '@/lib/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const stored = Cookies.get('user');
    if (stored) {
      try { setUser(JSON.parse(stored)); }
      catch { Cookies.remove('user'); }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await API.post('/api/auth/login', { email, password });
    const { accessToken, user } = res.data;
    Cookies.set('token', accessToken, { expires: 1 });
    Cookies.set('user', JSON.stringify(user), { expires: 1 });
    setUser(user);
    return user;
  };

  const register = async (name, email, password) => {
    const res = await API.post('/api/auth/register', { name, email, password });
    const { accessToken, user } = res.data;
    Cookies.set('token', accessToken, { expires: 1 });
    Cookies.set('user', JSON.stringify(user), { expires: 1 });
    setUser(user);
    return user;
  };

  const logout = () => {
    Cookies.remove('token');
    Cookies.remove('user');
    setUser(null);
    router.push('/auth/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);