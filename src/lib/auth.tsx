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
  rolesLoaded: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  hasPermission: (allowedRoles: AppRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [rolesLoaded, setRolesLoaded] = useState(false);

  const fetchUserRoles = async (userId: string): Promise<AppRole[]> => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
      
      if (error) {
        console.error('❌ Error fetching roles:', error.message, error.code);
        console.error('User ID:', userId);
        toast.error('Error al cargar roles. Contacta al administrador.');
        return [];
      }
      
      const roles = data?.map(r => r.role as AppRole) || [];
      console.log('✅ Roles cargados para', userId, ':', roles);
      return roles;
    } catch (err) {
      console.error('❌ Excepción al cargar roles:', err);
      toast.error('Error de conexión al cargar roles.');
      return [];
    }
  };

  const handleSessionChange = (session: Session | null) => {
    if (session?.user) {
      // Estado inmediato sin roles para desbloquear UI básica
      setUser({
        id: session.user.id,
        email: session.user.email!,
        roles: [],
        session,
      });
      setRolesLoaded(false);
      
      // Deferir carga de roles para no bloquear el callback del listener
      setTimeout(async () => {
        const roles = await fetchUserRoles(session.user!.id);
        setUser({
          id: session.user!.id,
          email: session.user!.email!,
          roles,
          session,
        });
        setRolesLoaded(true);
        setLoading(false);
      }, 0);
    } else {
      setUser(null);
      setRolesLoaded(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    // 1) Listener primero, sin async ni llamadas a Supabase en el callback
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      console.log('🔄 Auth state change:', event, session?.user?.email);
      setLoading(true);
      handleSessionChange(session);
    });

    // 2) Hidratar sesión existente después del listener
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        if (!mounted) return;
        if (!session) {
          console.log('✅ Auth inicializado: sin sesión');
          setUser(null);
          setRolesLoaded(false);
          setLoading(false);
        } else {
          console.log('✅ Auth inicializado con sesión:', session.user?.email);
          setLoading(true);
          handleSessionChange(session);
        }
      })
      .catch((error) => {
        console.error('Error al inicializar auth:', error);
        setUser(null);
        setRolesLoaded(false);
        setLoading(false);
      });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
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
    setRolesLoaded(false);
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
    <AuthContext.Provider value={{ user, loading, rolesLoaded, signIn, signOut, hasPermission }}>
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
      const { user, loading, rolesLoaded, hasPermission } = useAuth();
      const navigate = useNavigate();

      useEffect(() => {
        console.log('🔐 withAuth check:', { 
          user: user?.email, 
          loading, 
          rolesLoaded, 
          hasPermission: hasPermission(allowedRoles) 
        });

        const checkTimer = setTimeout(() => {
          if (!loading && rolesLoaded) {
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

        return () => {
          clearTimeout(checkTimer);
        };
      }, [user, loading, rolesLoaded, navigate]);

      if (loading || !rolesLoaded) {
        return (
          <div className="min-h-screen flex flex-col items-center justify-center gap-4">
            <div className="text-muted-foreground">Verificando autenticación...</div>
            <div className="text-xs text-muted-foreground">
              {loading ? 'Cargando sesión...' : 'Cargando permisos...'}
            </div>
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
