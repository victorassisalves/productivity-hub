import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { User } from '@shared/schema';
import { auth, loginWithGoogle, logoutFirebase } from '@/lib/firebase';
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  logout: () => Promise<void>;
  register: (userData: RegisterData) => Promise<boolean>;
}

interface RegisterData {
  name: string;
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Listen for Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // When Firebase Auth authenticates, send the token to our backend
          const idToken = await firebaseUser.getIdToken();
          
          // Send token to backend to either verify or create a user account
          const userData = await apiRequest<User>('/api/auth/firebase-token', {
            method: 'POST',
            body: JSON.stringify({ idToken }),
          });
          
          setUser(userData);
          setIsLoading(false);
        } catch (error) {
          console.error('Failed to authenticate with backend:', error);
          toast({
            title: 'Authentication error',
            description: 'Failed to connect your Google account. Please try again.',
            variant: 'destructive',
          });
          setIsLoading(false);
        }
      } else {
        // No Firebase user, check for session-based auth
        checkServerAuth();
      }
    });

    return () => unsubscribe();
  }, [toast]);

  // Check if user is authenticated with the server (session-based)
  const checkServerAuth = async () => {
    try {
      try {
        // Use apiRequest which handles errors and parsing
        const userData = await apiRequest<User>('/api/auth/current-user');
        setUser(userData);
      } catch (err) {
        // If API request fails, user is not authenticated
        setUser(null);
      }
    } catch (error) {
      console.error('Failed to check authentication status', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      try {
        // First try to authenticate with Firebase
        await signInWithEmailAndPassword(auth, email, password);
        // Firebase auth state change will trigger user update
        return true;
      } catch (firebaseError) {
        console.error('Firebase login failed, falling back to server auth:', firebaseError);
        
        // Fall back to server authentication
        const userData = await apiRequest<User>('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        });
        
        setUser(userData);
        return true;
      }
    } catch (error) {
      console.error('Login failed', error);
      toast({
        title: 'Login Failed',
        description: 'Invalid email or password. Please try again.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const googleLogin = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      await loginWithGoogle();
      return true;
    } catch (error) {
      console.error('Google login failed', error);
      toast({
        title: 'Login Failed',
        description: 'Could not sign in with Google. Please try again.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      
      // First logout from Firebase
      if (auth.currentUser) {
        await logoutFirebase();
      }
      
      // Then logout from our backend
      await apiRequest<{ success: boolean }>('/api/auth/logout', {
        method: 'POST',
      });
      
      setUser(null);
    } catch (error) {
      console.error('Logout failed', error);
      toast({
        title: 'Logout Failed',
        description: 'Could not sign out. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      try {
        // First, create the user in Firebase Authentication
        await createUserWithEmailAndPassword(auth, userData.email, userData.password);
        console.log('Firebase user registration successful');
        
        // The Firebase auth state change will trigger the onAuthStateChanged listener,
        // which will authenticate with our backend and set the user
        return true;
      } catch (firebaseError) {
        console.error('Firebase registration failed, falling back to server registration:', firebaseError);
        
        // Fall back to server-only registration
        const newUser = await apiRequest<User>('/api/auth/register', {
          method: 'POST',
          body: JSON.stringify(userData),
        });
        
        setUser(newUser);
        return true;
      }
    } catch (error) {
      console.error('Registration failed', error);
      toast({
        title: 'Registration Failed',
        description: error instanceof Error ? error.message : 'Could not create account. Please try again.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    loginWithGoogle: googleLogin,
    logout,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}