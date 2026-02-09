import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import {
  authApi,
  setAuthToken,
  getAuthToken,
  UserDto,
} from '@/app/services/api';
import { User } from '@/app/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (username: string, password: string, name: string, email: string) => Promise<{ success: boolean; storeSetupRequired: boolean; error?: string }>;
  updateProfile: (data: { name?: string; email?: string }) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const mapUserDto = (dto: UserDto): User => ({
  id: dto.id,
  username: dto.username,
  name: dto.name,
  email: dto.email,
  role: dto.role as 'employee' | 'manager',
  status: dto.status as 'Active' | 'Inactive',
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = getAuthToken();
      if (token) {
        try {
          const userData = await authApi.getCurrentUser();
          setUser(mapUserDto(userData));
        } catch (error) {
          console.error('Failed to get current user on init:', error);
          setAuthToken(null);
        }
      }
      setLoading(false);
    };
    initializeAuth();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await authApi.login({ username, password });
      setAuthToken(response.token);
      setUser(mapUserDto(response.user));
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setAuthToken(null);
  };

  const register = async (username: string, password: string, name: string, email: string): Promise<{ success: boolean; storeSetupRequired: boolean; error?: string }> => {
    try {
      const response = await authApi.register({ username, password, name, email });
      setAuthToken(response.token);
      setUser(mapUserDto(response.user));
      return { success: true, storeSetupRequired: response.storeSetupRequired };
    } catch (error) {
      console.error('Registration failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      return { success: false, storeSetupRequired: false, error: errorMessage };
    }
  };

  const updateProfile = async (data: { name?: string; email?: string }) => {
    try {
      const updated = await authApi.updateProfile(data);
      setUser(mapUserDto(updated));
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      await authApi.changePassword({ currentPassword, newPassword });
    } catch (error) {
      console.error('Failed to change password:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    register,
    updateProfile,
    changePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
