import { createContext, useState, useEffect } from 'react';
import type { Dispatch, SetStateAction, ReactNode } from 'react';

type AuthContextType = {
  user: User | null;
  setUser: Dispatch<SetStateAction<User | null>>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

const AuthContextProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const getUser = async () => {
      try {
        const baseURL = import.meta.env.VITE_APP_TRAVEL_JOURNAL_API_URL;

        const res = await fetch(`${baseURL}/auth/me`, {
          credentials: 'include',
        });
        if (!res.ok) throw new Error('Failed to fetch user details');
        const data = await res.json();
        setUser(data);
      } catch (error) {
        console.log(error);
      }
    };

    getUser();
  }, []);

  const signOut = async () => {
    const baseURL = import.meta.env.VITE_APP_TRAVEL_JOURNAL_API_URL;

    const res = await fetch(`${baseURL}/auth/logout`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!res.ok) {
      throw new Error('Logout failed!');
    }

    setUser(null);
  };

  const values: AuthContextType = {
    user,
    setUser,
    signOut,
  };

  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>;
};

export { AuthContextProvider, AuthContext };
