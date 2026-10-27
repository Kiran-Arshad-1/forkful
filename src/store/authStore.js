import { create } from 'zustand';
import { supabase } from '../lib/supabase';

// Fetches the user's profile row and determines their role.
// For new Google OAuth users with no profile yet, auto-creates a vendor_profiles row.
// Returns { role, profile } where role is 'vendor' | 'admin' | null.
const resolveUserRole = async (user) => {
  const { data: vendorProfile, error: vErr } = await supabase
    .from('vendor_profiles')
    .select('*')
    .eq('vendor_id', user.id)
    .maybeSingle();

  if (vErr) console.error('[auth] vendor_profiles lookup failed:', vErr.message);
  if (vendorProfile) {
    return { role: 'vendor', profile: vendorProfile };
  }

  const { data: adminProfile, error: aErr } = await supabase
    .from('admin_profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (aErr) console.error('[auth] admin_profiles lookup failed:', aErr.message);
  if (adminProfile) return { role: 'admin', profile: adminProfile };

  // New Google user — no profile yet. Caller handles redirect to signup.
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

    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;

      if (session?.user) {
        const { role, profile } = await resolveUserRole(session.user);
        set({ user: { ...session.user, subscription_expires_at: profile?.subscription_expires_at }, profile, role, isLoading: false, isAuthenticated: true });
      } else {
        set({ user: null, profile: null, role: null, isLoading: false, isAuthenticated: false });
      }
    } catch (error) {
      console.error('[auth] failed to restore session:', error);
      set({ user: null, profile: null, role: null, isLoading: false, isAuthenticated: false });
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setTimeout(async () => {
        try {
          if (event === 'SIGNED_OUT') {
            set({ user: null, profile: null, role: null, isAuthenticated: false, isLoading: false });
          } else if (event === 'SIGNED_IN' && session?.user) {
            const { role, profile } = await resolveUserRole(session.user);
            set({ user: { ...session.user, subscription_expires_at: profile?.subscription_expires_at }, profile, role, isAuthenticated: true, isLoading: false });
          } else if (event === 'TOKEN_REFRESHED' && session?.user) {
            set((state) => ({ user: { ...session.user, subscription_expires_at: state.profile?.subscription_expires_at } }));
          }
        } catch (error) {
          console.error('[auth] failed to process auth state change:', error);
          set({ isLoading: false });
        }
      }, 0);
    });

    return () => subscription.unsubscribe();
  },

  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (data.user) {
      const { role, profile } = await resolveUserRole(data.user);

      if (profile?.approval_status === 'block') {
        await supabase.auth.signOut();
        set({ user: null, profile: null, role: null, isAuthenticated: false });
        throw new Error('Your account has been blocked. Please contact support.');
      }

      set({ user: data.user, profile, role, isAuthenticated: true, isLoading: false });
    }
    return data;
  },

  // Redirects to Google — page will navigate away; no return value.
  signInWithGoogle: async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) throw error;
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, profile: null, role: null, isAuthenticated: false });
  },
}));

export default useAuthStore;
