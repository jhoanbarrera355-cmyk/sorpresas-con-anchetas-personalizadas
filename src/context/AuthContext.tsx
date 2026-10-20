import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types.ts';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAdmin: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: { name: string; email: string; phone: string; password: string; address?: string; city?: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('anchetas_token'));
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadUser() {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
        } else {
          // Token expired or invalid
          localStorage.removeItem('anchetas_token');
          setToken(null);
          setUser(null);
        }
      } catch (err) {
        console.error('Failed to verify token:', err);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, [token]);

  const login = async (email: string, pass: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass })
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Error al iniciar sesión' };
      }
      localStorage.setItem('anchetas_token', data.token);
      setToken(data.token);
      setUser(data.user);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error de conexión' };
    }
  };

  const register = async (formData: {
    name: string;
    email: string;
    phone: string;
    password: string;
    address?: string;
    city?: string;
  }) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Error al registrarte' };
      }
      localStorage.setItem('anchetas_token', data.token);
      setToken(data.token);
      setUser(data.user);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error de conexión' };
    }
  };

  const logout = async () => {
    if (token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (err) {
        console.error(err);
      }
    }
    localStorage.removeItem('anchetas_token');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!token) return { success: false, error: 'No autenticado' };
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Error al actualizar perfil' };
      }
      setUser(data);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error de conexión' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
