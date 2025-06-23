
import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';
import BookingForm from '../components/customer/BookingForm';
import AdminDashboard from '../components/admin/AdminDashboard';
import TechnicianDashboard from '../components/technician/TechnicianDashboard';

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      // Redirect based on user role
      switch (user.role) {
        case 'admin':
          navigate('/admin');
          break;
        case 'technician':
          navigate('/technician');
          break;
        case 'customer':
          navigate('/customer');
          break;
      }
    }
  }, [user, navigate]);

  if (!user) {
    return <LoginForm />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main>
        {user.role === 'admin' && <AdminDashboard />}
        {user.role === 'technician' && <TechnicianDashboard />}
        {user.role === 'customer' && <BookingForm />}
      </main>
    </div>
  );
};

export default Index;
