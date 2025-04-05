import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';

export interface User {
  id: string;
  email: string;
  role: string;
  name?: string;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void> | void;
  checkAuth: () => Promise<boolean>;
}

// --- REMOVE async from login and checkAuth here ---
const defaultContext: AuthContextType = {
  user: null,
  isLoading: true,
  isAuthenticated: false,
  login: /*async*/ () => {
    // Remove async
    return Promise.resolve(false); // Return a resolved promise to match the type
  },
  logout: () => {},
  checkAuth: /*async*/ () => {
    // Remove async
    return Promise.resolve(false); // Return a resolved promise to match the type
  },
};
// --- END CHANGE ---

export const AuthContext = createContext<AuthContextType>(defaultContext);

export interface AuthProviderProps {
  children: ReactNode;
  loginApi: (email: string, password: string) => Promise<User>;
  logoutApi: () => Promise<void>;
  checkAuthApi: () => Promise<User | null>;
}

export const AuthProvider = ({
  children,
  loginApi,
  logoutApi,
  checkAuthApi,
}: AuthProviderProps): React.ReactElement => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Keep async here - this is the real implementation
  const checkAuth = useCallback(async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      const userData = await checkAuthApi();
      if (userData) {
        setUser(userData);
        return true;
      } else {
        setUser(null);
        return false;
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setUser(null);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [checkAuthApi]);

  // Keep async here - this is the real implementation
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const userData = await loginApi(email, password);
      setUser(userData);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Keep async here - this is the real implementation
  const logout = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      await logoutApi();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [logoutApi]);

  useEffect(() => {
    void checkAuth();
  }, [checkAuth]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => useContext(AuthContext);
