import React, { useEffect } from 'react';
import Router from './router';
import useAuthStore from './store/authStore';

function App() {
  const initAuth = useAuthStore((state) => state.initAuth);

  // Resolve the Supabase session once on mount and subscribe to auth state changes
  useEffect(() => {
    let active = true;
    let cleanup;
    initAuth().then((unsubscribe) => {
      if (active) cleanup = unsubscribe;
      else unsubscribe?.();
    });

    return () => {
      active = false;
      cleanup?.();
    };
  }, []);

  return <Router />;
}

export default App;
