import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import ProductList from '../pages/ProductList';
import MyBids from '../pages/MyBids';
import AdminDashboard from '../pages/AdminDashboard';
import RequestAccess from '../pages/RequestAccess';
import ForgotPassword from '../pages/ForgotPassword';
import Profile from '../pages/Profile';
import InitialSetup from '../pages/InitialSetup';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/login" />;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { currentUser, isAdmin } = useAuth();
  if (!currentUser) return <Navigate to="/login" />;
  if (!isAdmin) return <Navigate to="/" />;
  return <>{children}</>;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/request-access" element={<RequestAccess />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/setup" element={<InitialSetup />} />
      
      <Route path="/" element={
        <PrivateRoute>
          <Layout />
        </PrivateRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="products" element={<ProductList />} />
        <Route path="my-bids" element={<MyBids />} />
        <Route path="profile" element={<Profile />} />
        
        <Route path="admin" element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } />
      </Route>
    </Routes>
  );
}