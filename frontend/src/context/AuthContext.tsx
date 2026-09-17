import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../api/axios';
import { User, Company, Role } from '../types';

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  companyId?: string;
  companyName?: string;
}

export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  company?: string;
  companyName: string;
  companyDetails: Company | null;
  role?: Role;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (registerData: RegisterData) => Promise<AuthResult>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('token') || null;
  });

  const [companyDetails, setCompanyDetails] = useState<Company | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchCompanyMe = async () => {
      if (token && user?.companyId) {
        try {
          const res = await api.get('/company/me');
          setCompanyDetails(res.data);
        } catch (_err) {
          // Silent fallback if endpoint fails
        }
      } else {
        setCompanyDetails(null);
      }
    };
    fetchCompanyMe();
  }, [token, user?.companyId]);

  const login = async (email: string, password: string): Promise<AuthResult> => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token: newToken, user: userData } = response.data;

      setToken(newToken);
      setUser(userData);

      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));

      return { success: true, user: userData };
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed';
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (registerData: RegisterData): Promise<AuthResult> => {
    setLoading(true);
    try {
      const response = await api.post('/auth/register', registerData);
      const { token: newToken, user: userData } = response.data;

      setToken(newToken);
      setUser(userData);

      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));

      return { success: true, user: userData };
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed';
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const logout = (): void => {
    setToken(null);
    setUser(null);
    setCompanyDetails(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const companyName = companyDetails?.name || user?.companyName || 'Company';

  const value: AuthContextType = {
    user,
    token,
    company: user?.companyId,
    companyName,
    companyDetails,
    role: user?.role,
    isAuthenticated: !!token && !!user,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
