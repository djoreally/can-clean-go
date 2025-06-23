
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { storage } from '../services/storage';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (email: string, password: string, name: string, role: User['role']) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('current_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    // Initialize demo data
    initializeDemoData();
  }, []);

  const initializeDemoData = () => {
    // Only initialize if no users exist
    const users = storage.getCollection('users');
    if (users.length === 0) {
      // Create demo users
      const adminUser = storage.create('users', {
        email: 'admin@cleancans.com',
        name: 'Admin User',
        role: 'admin' as const,
        phone: '+1234567890',
      });

      const techUser = storage.create('users', {
        email: 'tech@cleancans.com',
        name: 'Mike Johnson',
        role: 'technician' as const,
        phone: '+1234567891',
      });

      const customerUser = storage.create('users', {
        email: 'customer@example.com',
        name: 'Sarah Smith',
        role: 'customer' as const,
        phone: '+1234567892',
      });

      // Create demo services
      storage.create('services', {
        name: 'Basic Can Cleaning',
        description: 'Standard cleaning for up to 2 trash cans',
        price: 25,
        duration: 30,
        active: true,
      });

      storage.create('services', {
        name: 'Premium Can Cleaning',
        description: 'Deep cleaning with sanitization for up to 4 cans',
        price: 45,
        duration: 60,
        active: true,
      });

      storage.create('services', {
        name: 'Commercial Cleaning',
        description: 'Large scale cleaning for commercial properties',
        price: 75,
        duration: 90,
        active: true,
      });

      // Create demo customer
      storage.create('customers', {
        userId: customerUser.id,
        name: 'Sarah Smith',
        email: 'customer@example.com',
        phone: '+1234567892',
        address: '123 Main St, Anytown, USA 12345',
        notes: 'Gate code: 1234, Friendly dog in backyard',
      });
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simple demo authentication
    const users = storage.getCollection<User>('users');
    const foundUser = users.find(u => u.email === email);
    
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('current_user', JSON.stringify(foundUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('current_user');
  };

  const register = async (email: string, password: string, name: string, role: User['role']): Promise<boolean> => {
    try {
      const newUser = storage.create<User>('users', {
        email,
        name,
        role,
      });
      
      setUser(newUser);
      localStorage.setItem('current_user', JSON.stringify(newUser));
      return true;
    } catch (error) {
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};
