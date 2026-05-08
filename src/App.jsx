import React, { useEffect } from 'react';
import Router from './router';
import useAuthStore from './store/authStore';

function App() {
  const initAuth = useAuthStore((state) => state.initAuth);

  // Resolve the Supabase session once on mount and subscribe to auth state changes
  useEffect(() => {
    initAuth();
  }, []);

  return <Router />;
}

export default App;
