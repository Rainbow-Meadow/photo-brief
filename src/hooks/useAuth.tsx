import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { onboardingDebug, supabaseErrorDebug } from "@/lib/onboardingDebug";

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  session: null,
  user: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  // Prevent getSession from overwriting a newer onAuthStateChange result
  const listenerFiredRef = useRef(false);

  useEffect(() => {
    listenerFiredRef.current = false;

    // Set up listener BEFORE fetching session
    const { data: sub } = supabase.auth.onAuthStateChange((event, newSession) => {
      onboardingDebug("auth.state_change", {
        event,
        sessionPresent: !!newSession,
        currentUserId: newSession?.user?.id ?? null,
        currentUserEmail: newSession?.user?.email ?? null,
      });
      listenerFiredRef.current = true;
      setSession(newSession);
      setLoading(false);
    });

    onboardingDebug("auth.get_session.start", { sessionPresent: false });
    supabase.auth.getSession().then(({ data, error }) => {
      onboardingDebug("auth.get_session.done", {
        sessionPresent: !!data.session,
        currentUserId: data.session?.user?.id ?? null,
        currentUserEmail: data.session?.user?.email ?? null,
        error: supabaseErrorDebug(error),
      });
      // Only apply if the listener hasn't already delivered a fresher state
      if (!listenerFiredRef.current) {
        setSession(data.session);
        setLoading(false);
      }
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
