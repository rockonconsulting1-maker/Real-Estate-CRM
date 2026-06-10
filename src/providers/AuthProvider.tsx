import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { AppUser, AppUserRole } from '@/types';
import { Session, User } from '@supabase/supabase-js';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  appUser: AppUser | null;
  role: AppUserRole | null;
  ghlLocationId: string | null;
  permissionTemplate: string | null;
  isRevoked: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  appUser: null,
  role: null,
  ghlLocationId: null,
  permissionTemplate: null,
  isRevoked: false,
  isLoading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [role, setRole] = useState<AppUserRole | null>(null);
  const [ghlLocationId, setGhlLocationId] = useState<string | null>(null);
  const [permissionTemplate, setPermissionTemplate] = useState<string | null>(null);
  const [isRevoked, setIsRevoked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!mounted) return;
      
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    }

    async function fetchProfile(userId: string) {
      try {
        const { data: appUserData, error: appUserError } = await supabase
          .from('app_users')
          .select('*')
          .eq('id', userId)
          .single();

        if (appUserError) throw appUserError;
        if (!mounted) return;
        
        setAppUser(appUserData);
        setRole(appUserData.role);

        const { data: linkData } = await supabase
          .from('user_location_links')
          .select('*')
          .eq('app_user_id', userId)
          .order('is_primary', { ascending: false })
          .limit(1)
          .single();

        if (linkData) {
          setGhlLocationId(linkData.ghl_location_id);
          setPermissionTemplate(linkData.permission_template);
          setIsRevoked(!!linkData.revoked_at);

          if (linkData.revoked_at) {
            await supabase.auth.signOut();
          }
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    loadSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        setIsLoading(true);
        fetchProfile(session.user.id);
      } else {
        setAppUser(null);
        setRole(null);
        setGhlLocationId(null);
        setPermissionTemplate(null);
        setIsRevoked(false);
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ session, user, appUser, role, ghlLocationId, permissionTemplate, isRevoked, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
