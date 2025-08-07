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
  otpCooldown: number; // Timestamp when cooldown ends
  resendCount: number; // Number of times OTP has been resent
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
  canResendOTP: () => boolean;
  getResendCooldownTime: () => number;
  resetOTPState: () => void;
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
  otpCooldown: 0,
  resendCount: 0,

  // Actions
  signInWithOTP: async (phone: string) => {
    const state = get();
    
    // Check if user can resend OTP
    if (!state.canResendOTP()) {
      const remainingTime = Math.ceil((state.otpCooldown - Date.now()) / 1000);
      const minutes = Math.floor(remainingTime / 60);
      const seconds = remainingTime % 60;
      const timeString = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
      
      set({
        error: `Please wait ${timeString} before requesting another code`,
        loading: false,
      });
      return;
    }

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
      
      // Set cooldown based on resend count
      const currentResendCount = state.resendCount;
      const cooldownDuration = currentResendCount === 0 
        ? 60 * 1000 // 1 minute for first resend
        : 6 * 60 * 60 * 1000; // 6 hours for subsequent resends
      
      set({
        loading: false,
        otpSent: true,
        error: null,
        savedPhoneNumber: phone,
        otpCooldown: Date.now() + cooldownDuration,
        resendCount: currentResendCount + 1,
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
        resendCount: 0, // Reset resend count on successful verification
        otpCooldown: 0,
      });

      // Redirect to callback for profile checking
      if (typeof window !== 'undefined' && window.location) {
        window.location.href = '/auth/callback';
      }
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
        resendCount: 0,
        otpCooldown: 0,
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
    set({ error: null });
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
  
  canResendOTP: () => {
    const state = get();
    return Date.now() >= state.otpCooldown;
  },
  
  getResendCooldownTime: () => {
    const state = get();
    return Math.max(0, state.otpCooldown - Date.now());
  },
  
  resetOTPState: () => {
    set({ 
      otpSent: false, 
      verifyingOtp: false, 
      resendCount: 0, 
      otpCooldown: 0,
      error: null 
    });
  },

  checkProfileCompletion: async () => {
    try {
      const user = get().user;
      if (!user) {
        console.log('❌ No authenticated user found');
        return 'needs_name';
      }

      console.log('🔍 Checking profile completion for user:', user.id);
      
      // Fetch user profile from database
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No profile found
          console.log('❌ No profile found in database');
          return 'needs_name';
        }
        console.error('❌ Error fetching profile:', error);
        return 'needs_name';
      }

      console.log('📋 Profile data:', {
        full_name: profile?.full_name,
        region: profile?.region,
        district: profile?.district,
        street_area: profile?.street_area,
      });
      
      if (!profile?.full_name?.trim()) {
        console.log('❌ Profile incomplete: missing name');
        return 'needs_name';
      }
      
      if (!profile?.region || !profile?.district || !profile?.street_area) {
        console.log('❌ Profile incomplete: missing shop address', {
          region: profile?.region,
          district: profile?.district,
          street_area: profile?.street_area,
        });
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
      resendCount: state.resendCount,
      otpCooldown: state.otpCooldown,
  }),
}
)
);
