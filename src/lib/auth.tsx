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
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);
      
      if (error) {
        console.error('Error fetching roles:', error);
        console.error('User ID:', userId);
        return [];
      }
      
      const roles = data?.map(r => r.role as AppRole) || [];
      console.log('Roles cargados para', userId, ':', roles);
      return roles;
    } catch (err) {
      console.error('Excepción al cargar roles:', err);
      return [];
    }
  };

  const updateUserFromSession = async (session: Session | null) => {
    if (session?.user) {
      console.log('Actualizando usuario desde sesión:', session.user.email);
      const roles = await fetchUserRoles(session.user.id);
      
      if (roles.length === 0) {
        console.warn('⚠️ No se encontraron roles para:', session.user.email);
      }
      
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
    // Set up auth state listener (NO async para evitar deadlocks)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!session?.user) {
          setUser(null);
          setLoading(false);
          return;
        }
        
        // Establecer usuario con sesión inmediatamente (sin roles aún)
        setUser(prev => ({
          id: session.user.id,
          email: session.user.email!,
          roles: prev?.id === session.user.id ? prev.roles : [],
          session
        }));
        
        // Diferir carga de roles para evitar deadlocks
        setTimeout(async () => {
          const roles = await fetchUserRoles(session.user.id);
          setUser({
            id: session.user.id,
            email: session.user.email!,
            roles,
            session
          });
          setLoading(false);
        }, 0);
      }
    );

    // Check existing session (también sin async directo)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        setUser(null);
        setLoading(false);
        return;
      }
      
      setUser(prev => ({
        id: session.user.id,
        email: session.user.email!,
        roles: prev?.id === session.user.id ? prev.roles : [],
        session
      }));
      
      setTimeout(async () => {
        const roles = await fetchUserRoles(session.user.id);
        setUser({
          id: session.user.id,
          email: session.user.email!,
          roles,
          session
        });
        setLoading(false);
      }, 0);
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
    if (!user) return false;
    
    // Si no hay roles asignados, denegar acceso
    if (user.roles.length === 0) {
      console.warn('Usuario sin roles asignados:', user.email);
      return false;
    }
    
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
        const timer = setTimeout(() => {
          if (!loading) {
            if (!user) {
              navigate('/login', { replace: true });
            } else if (!hasPermission(allowedRoles)) {
              if (user.roles.length === 0) {
                toast.error('No tienes roles asignados. Contacta al administrador.');
                navigate('/setup', { replace: true });
              } else {
                toast.error('No tienes permisos para acceder a esta página');
                navigate('/', { replace: true });
              }
            }
          }
        }, 100);

        return () => clearTimeout(timer);
      }, [user, loading, navigate]);

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
