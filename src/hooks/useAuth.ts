"use client";

import { useEffect, useState, useCallback } from "react";
import { getSupabase } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabase();

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSession(session);
        setLoading(false);
      } else {
        supabase.auth.signInAnonymously().then(({ data, error }) => {
          if (error) {
            console.error("Anonymous sign-in failed:", error);
          } else {
            setSession(data.session);
          }
          setLoading(false);
        });
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const getAccessToken = useCallback(async (): Promise<string | null> => {
    const { data } = await getSupabase().auth.getSession();
    return data.session?.access_token ?? null;
  }, []);

  return { session, loading, userId: session?.user?.id ?? null, getAccessToken };
}
