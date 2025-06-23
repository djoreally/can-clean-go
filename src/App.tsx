
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LoginForm from "./components/auth/LoginForm";
import BookingForm from "./components/customer/BookingForm";
import AdminDashboard from "./components/admin/AdminDashboard";
import TechnicianDashboard from "./components/technician/TechnicianDashboard";
import AdminSettings from "./pages/AdminSettings";
import PublicLanding from "./pages/PublicLanding";
import CustomerProfile from "./pages/CustomerProfile";
import TechnicianProfile from "./pages/TechnicianProfile";
import Navbar from "./components/Navbar";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: string[] }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {user && <Navbar />}
      <Routes>
        <Route path="/landing" element={<PublicLanding />} />
        <Route path="/login" element={!user ? <LoginForm /> : <Navigate to="/" replace />} />
        <Route path="/" element={user ? <Index /> : <Navigate to="/landing" replace />} />
        
        {/* Customer Routes */}
        <Route
          path="/customer"
          element={
            <ProtectedRoute allowedRoles={['customer']}>
              <BookingForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/jobs"
          element={
            <ProtectedRoute allowedRoles={['customer']}>
              <div className="p-6">
                <h1 className="text-2xl font-bold">My Jobs</h1>
                <p className="text-gray-600">View your scheduled and completed services</p>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/profile"
          element={
            <ProtectedRoute allowedRoles={['customer']}>
              <CustomerProfile />
            </ProtectedRoute>
          }
        />
        
        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/jobs"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <div className="p-6">
                <h1 className="text-2xl font-bold">Job Management</h1>
                <p className="text-gray-600">Manage all jobs and assignments</p>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/customers"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <div className="p-6">
                <h1 className="text-2xl font-bold">Customer Management</h1>
                <p className="text-gray-600">Manage customer accounts and information</p>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminSettings />
            </ProtectedRoute>
          }
        />
        
        {/* Technician Routes */}
        <Route
          path="/technician"
          element={
            <ProtectedRoute allowedRoles={['technician']}>
              <TechnicianDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/technician/profile"
          element={
            <ProtectedRoute allowedRoles={['technician']}>
              <TechnicianProfile />
            </ProtectedRoute>
          }
        />
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
