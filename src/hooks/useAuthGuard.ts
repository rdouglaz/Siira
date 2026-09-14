"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Redirects to /auth when there is no session.
// Returns `checking` so pages can render nothing (or a loader) while the
// session is being verified instead of flashing protected content.
export function useAuthGuard() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push("/auth");
      } else {
        setChecking(false);
      }
    };

    checkAuth();
  }, [router]);

  return { checking };
}

export function withAuthGuard<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  return function WithAuthGuard(props: P) {
    const { checking } = useAuthGuard();

    if (checking) return null;

    // Use React.createElement to avoid JSX type issues
    return React.createElement(WrappedComponent, props);
  };
}