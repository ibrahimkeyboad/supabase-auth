import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { AuthService } from '@/lib/auth';
import { AuthChangeEvent, Session, User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
  onboardingCompleted: boolean;
  otpSent: boolean;
  verifyingOtp: boolean;
}

interface AuthActions {
  signInWithOTP: (email: string) => Promise<void>;
  verifyOTP: (email: string, token: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
  initialize: () => Promise<void>;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setOtpSent: (sent: boolean) => void;
  setVerifyingOtp: (verifying: boolean) => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()((set, get) => ({
  // State
  user: null,
  session: null,
  loading: false,
  error: null,
  initialized: false,
  onboardingCompleted: false,
  otpSent: false,
  verifyingOtp: false,

  // Actions
  signInWithOTP: async (email: string) => {
    try {
      set({ loading: true, error: null });
      console.log('🚀 Starting OTP sign-in for:', email);

      const { data, error } = await AuthService.signInWithOTP(email);

      if (error) {
        console.error('❌ OTP send error:', error);
        set({
          error: error.message || 'Authentication failed',
          loading: false,
          otpSent: false,
        });
        return;
      }

      console.log('✅ OTP sent successfully');
      set({
        loading: false,
        otpSent: true,
        error: null,
      });
    } catch (error) {
      console.error('❌ Unexpected OTP error:', error);
      set({
        error: error instanceof Error ? error.message : 'Authentication failed',
        loading: false,
        otpSent: false,
      });
    }
  },

  verifyOTP: async (email: string, token: string) => {
    try {
      set({ verifyingOtp: true, error: null });
      console.log('🔐 Verifying OTP for:', email);

      const { data, error } = await AuthService.verifyOTP(email, token);

      if (error) {
        console.error('❌ OTP verification error:', error);
        set({
          error: error.message || 'Invalid OTP code',
          verifyingOtp: false,
        });
        return;
      }

      console.log('✅ OTP verified successfully');
      set({
        verifyingOtp: false,
        otpSent: false,
        error: null,
      });

      // Session will be set automatically by auth state change listener
    } catch (error) {
      console.error('❌ Unexpected OTP verification error:', error);
      set({
        error:
          error instanceof Error ? error.message : 'OTP verification failed',
        verifyingOtp: false,
      });
    }
  },
  signOut: async () => {
    try {
      set({ loading: true, error: null });
      console.log('👋 Signing out...');

      const { error } = await AuthService.signOut();

      if (error) {
        throw error;
      }

      set({
        user: null,
        session: null,
        loading: false,
        otpSent: false,
        verifyingOtp: false,
      });
      console.log('✅ Signed out successfully');
    } catch (error) {
      console.error('❌ Sign out error:', error);
      set({
        error: error instanceof Error ? error.message : 'Sign out failed',
        loading: false,
      });
    }
  },

  clearError: () => {
    set({ error: null, otpSent: false, verifyingOtp: false });
  },

  initialize: async () => {
    try {
      console.log('🔧 Initializing auth...');
      set({ loading: true });

      // Get initial session
      const { session, error } = await AuthService.getSession();

      if (error) {
        console.error('❌ Session error:', error);
        set({ error: error.message });
      }

      console.log('📋 Initial session:', session?.user?.email || 'No user');

      set({
        user: session?.user || null,
        session: session || null,
        loading: false,
        initialized: true,
      });

      // Listen for auth changes
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(
        (event: AuthChangeEvent, session: Session | null) => {
          console.log(
            '🔄 Auth state changed:',
            event,
            session?.user?.email || 'No user'
          );

          set({
            user: session?.user || null,
            session: session || null,
            loading: false,
            error: null,
          });

          // Handle specific auth events
          switch (event) {
            case 'SIGNED_IN':
              console.log(
                '✅ User signed in successfully:',
                session?.user?.email
              );
              break;
            case 'SIGNED_OUT':
              console.log('👋 User signed out');
              break;
            case 'TOKEN_REFRESHED':
              console.log('🔄 Token refreshed for user:', session?.user?.email);
              break;
            case 'USER_UPDATED':
              console.log('👤 User updated:', session?.user?.email);
              break;
          }
        }
      );

      // Store subscription for cleanup if needed
      (get() as any)._subscription = subscription;
    } catch (error) {
      console.error('❌ Auth initialization error:', error);
      set({
        error:
          error instanceof Error ? error.message : 'Failed to initialize auth',
        loading: false,
        initialized: true,
      });
    }
  },

  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setOtpSent: (sent) => set({ otpSent: sent }),
  setVerifyingOtp: (verifying) => set({ verifyingOtp: verifying }),
}));
