import { create } from 'zustand';
import { supabase } from '../lib/supabase';

// Fetches the user's profile row and determines their role.
// For new Google OAuth users with no profile yet, auto-creates a vendor_profiles row.
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

  // Auto-create a vendor profile for new Google OAuth sign-ins
  const providers = user.app_metadata?.providers || [];
  const isOAuth = user.app_metadata?.provider === 'google' || providers.includes('google');
  if (isOAuth) {
    const name = user.user_metadata?.full_name || user.user_metadata?.name || '';
    const email = user.email || '';
    const { data: created } = await supabase
      .from('vendor_profiles')
      .insert({
        user_id: user.id,
        business_name: name || email.split('@')[0],
        full_name: name,
        email,
        approval_status: 'pending',
        is_listed: false,
      })
      .select()
      .single();
    if (created) return { role: 'vendor', profile: created };
  }

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
    if (data.user) {
      const { role, profile } = await resolveUserRole(data.user);
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
