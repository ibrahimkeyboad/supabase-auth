import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { supabase } from '@/lib/supabase';
import { AuthService } from '@/lib/auth';
import { AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import { UserProfileService } from '@/services/userProfileService';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
  onboardingCompleted: boolean;
  otpSent: boolean;
  verifyingOtp: boolean;
  savedPhoneNumber: string | null;
}

interface AuthActions {
  signInWithOTP: (phone: string) => Promise<void>;
  verifyOTP: (phone: string, token: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
  initialize: () => Promise<void>;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setOtpSent: (sent: boolean) => void;
  setVerifyingOtp: (verifying: boolean) => void;
  setSavedPhoneNumber: (phone: string | null) => void;
  checkProfileCompletion: () => Promise<'complete' | 'needs_name' | 'needs_shop_address'>;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
  // State
  user: null,
  session: null,
  loading: false,
  error: null,
  initialized: false,
  onboardingCompleted: false,
  otpSent: false,
  verifyingOtp: false,
  savedPhoneNumber: null,

  // Actions
  signInWithOTP: async (phone: string) => {
    try {
      set({ loading: true, error: null });
      console.log('🚀 Starting OTP sign-in for:', phone);

      const { data, error } = await AuthService.signInWithOTP(phone);

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
        savedPhoneNumber: phone,
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

  verifyOTP: async (phone: string, token: string) => {
    try {
      set({ verifyingOtp: true, error: null });
      console.log('🔐 Verifying OTP for:', phone);

      const { data, error } = await AuthService.verifyOTP(phone, token);

      if (error) {
        console.error('❌ OTP verification error:', error);
        set({
          error: error.message || 'Invalid OTP code',
          verifyingOtp: false,
        });
        return;
      }

      console.log('✅ OTP verified successfully');
      console.log('💾 Session data:', data.session?.user?.phone);
      
      set({
        user: data.session?.user || null,
        session: data.session || null,
        verifyingOtp: false,
        otpSent: false,
        error: null,
        savedPhoneNumber: phone,
      });

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
        savedPhoneNumber: null,
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

      console.log('📋 Initial session:', session?.user?.phone || session?.user?.email || 'No user');

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
            session?.user?.phone || session?.user?.email || 'No user'
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
                session?.user?.phone || session?.user?.email
              );
              // Save phone number when user signs in
              if (session?.user?.phone) {
                set({ savedPhoneNumber: session.user.phone });
              }
              break;
            case 'SIGNED_OUT':
              console.log('👋 User signed out');
              set({ savedPhoneNumber: null });
              break;
            case 'TOKEN_REFRESHED':
              console.log('🔄 Token refreshed for user:', session?.user?.phone || session?.user?.email);
              break;
            case 'USER_UPDATED':
              console.log('👤 User updated:', session?.user?.phone || session?.user?.email);
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
  setSavedPhoneNumber: (phone) => set({ savedPhoneNumber: phone }),

  checkProfileCompletion: async () => {
    try {
      const profile = await UserProfileService.getUserProfile();
      
      if (!profile?.full_name?.trim()) {
        console.log('❌ Profile incomplete: missing name');
        return 'needs_name';
      }
      
      if (!profile?.region || !profile?.district || !profile?.street_area) {
        console.log('❌ Profile incomplete: missing shop address');
        return 'needs_shop_address';
      }
      
      console.log('✅ Profile complete');
      return 'complete';
    } catch (error) {
      console.error('❌ Failed to check profile completion:', error);
      return 'needs_name'; // Default to first step if error
    }
  },
}),
{
  name: 'agrilink-auth',
  storage: createJSONStorage(() => Platform.OS === 'web' ? localStorage : AsyncStorage),
  partialize: (state) => ({
    user: state.user,
    session: state.session,
    savedPhoneNumber: state.savedPhoneNumber,
  }),
}
)
);
