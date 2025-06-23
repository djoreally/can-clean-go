
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, Trash2, User, Calendar, Settings } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavItems = () => {
    switch (user.role) {
      case 'admin':
        return [
          { label: 'Dashboard', path: '/admin', icon: Calendar },
          { label: 'Jobs', path: '/admin/jobs', icon: Calendar },
          { label: 'Customers', path: '/admin/customers', icon: User },
          { label: 'Settings', path: '/admin/settings', icon: Settings },
        ];
      case 'technician':
        return [
          { label: 'My Jobs', path: '/technician', icon: Calendar },
          { label: 'Profile', path: '/technician/profile', icon: User },
        ];
      case 'customer':
        return [
          { label: 'Book Service', path: '/customer', icon: Calendar },
          { label: 'My Jobs', path: '/customer/jobs', icon: Calendar },
          { label: 'Profile', path: '/customer/profile', icon: User },
        ];
      default:
        return [];
    }
  };

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Trash2 className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">CleanCans Pro</span>
            </div>
            <div className="hidden md:ml-10 md:flex md:space-x-8">
              {getNavItems().map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700">
              Welcome, {user.name}
            </span>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {user.role}
            </span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
