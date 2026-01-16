import { useContext } from 'react';
import { AuthContext } from './AuthContext';

const useAuth = () => {
  const auth = useContext(AuthContext);
  if (!auth) throw new Error('Authcontext is unavailable');
  return auth;
};

export default useAuth;
