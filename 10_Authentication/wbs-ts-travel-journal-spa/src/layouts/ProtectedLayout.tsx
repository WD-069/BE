import { Outlet, Navigate } from 'react-router';
import useAuth from '@/context/useAuth';

const ProtectedLayout = () => {
  const { user } = useAuth();

  return user ? <Outlet /> : <Navigate to='/login' />;
};

export default ProtectedLayout;
