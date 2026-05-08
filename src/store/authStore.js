import { create } from 'zustand';
import { supabase } from '../lib/supabase';

// Fetches the user's profile row and determines their role.
// Returns { role, profile } where role is 'vendor' | 'admin' | null.
const resolveUserRole = async (user) => {
  const { data: vendorProfile, error: vErr } = await supabase
    .from('vendor_profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (vErr) console.error('[auth] vendor_profiles lookup failed:', vErr.message);
  if (vendorProfile) return { role: 'vendor', profile: vendorProfile };

  const { data: adminProfile, error: aErr } = await supabase
    .from('admin_profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (aErr) console.error('[auth] admin_profiles lookup failed:', aErr.message);
  if (adminProfile) return { role: 'admin', profile: adminProfile };

  return { role: null, profile: null };
};

const useAuthStore = create((set) => ({
  user: null,
  profile: null,
  role: null,
  isLoading: true,
  isAuthenticated: false,

  setProfile: (profile) => set({ profile }),

  // Call once on app mount. Resolves current session and subscribes to changes.
  initAuth: async () => {
    set({ isLoading: true });

    const { data: { session } } = await supabase.auth.getSession();

    if (session?.user) {
      const { role, profile } = await resolveUserRole(session.user);
      set({ user: session.user, profile, role, isLoading: false, isAuthenticated: true });
    } else {
      set({ isLoading: false, isAuthenticated: false });
    }

    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        set({ user: null, profile: null, role: null, isAuthenticated: false, isLoading: false });
      } else if (event === 'SIGNED_IN' && session?.user) {
        // Re-fetch profile on each sign-in to get fresh approval_status / is_listed
        const { role, profile } = await resolveUserRole(session.user);
        set({ user: session.user, profile, role, isAuthenticated: true, isLoading: false });
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        set({ user: session.user });
      }
    });
  },

  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    // Resolve role immediately so callers can navigate right after awaiting signIn
    if (data.user) {
      const { role, profile } = await resolveUserRole(data.user);
      set({ user: data.user, profile, role, isAuthenticated: true, isLoading: false });
    }
    return data;
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, profile: null, role: null, isAuthenticated: false });
  },
}));

export default useAuthStore;
