import { createContext, useContext, useEffect, useState, ReactNode, ComponentType } from "react";
import { useNavigate } from "react-router-dom";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type AppRole = 'super_admin' | 'admin' | 'manager' | 'senior' | 'junior' | 'finance';

export interface AuthUser {
  id: string;
  email: string;
  roles: AppRole[];
  session: Session | null;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  hasPermission: (allowedRoles: AppRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserRoles = async (userId: string): Promise<AppRole[]> => {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error fetching roles:', error);
      return [];
    }
    
    return data?.map(r => r.role as AppRole) || [];
  };

  const updateUserFromSession = async (session: Session | null) => {
    if (session?.user) {
      const roles = await fetchUserRoles(session.user.id);
      setUser({
        id: session.user.id,
        email: session.user.email!,
        roles,
        session
      });
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        await updateUserFromSession(session);
        setLoading(false);
      }
    );

    // Check existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      updateUserFromSession(session).finally(() => setLoading(false));
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
  };

  const hasPermission = (allowedRoles: AppRole[]): boolean => {
    if (!user || user.roles.length === 0) return false;
    return user.roles.some(role => allowedRoles.includes(role));
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const withAuth = (allowedRoles: AppRole[]) => {
  return <P extends object>(Component: ComponentType<P>) => {
    return (props: P) => {
      const { user, loading, hasPermission } = useAuth();
      const navigate = useNavigate();

      useEffect(() => {
        if (!loading) {
          if (!user) {
            navigate('/login', { replace: true });
          } else if (!hasPermission(allowedRoles)) {
            toast.error('No tienes permisos para acceder a esta página');
            navigate('/', { replace: true });
          }
        }
      }, [user, loading, navigate, hasPermission]);

      if (loading) {
        return (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-muted-foreground">Cargando...</div>
          </div>
        );
      }

      if (!user || !hasPermission(allowedRoles)) {
        return null;
      }

      return <Component {...props} />;
    };
  };
};
