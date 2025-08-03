import { supabase } from './supabase';
import { Platform } from 'react-native';

export class AuthService {
  /**
   * Sign in with OTP (email)
   */
  static async signInWithOTP(email: string) {
    try {
      console.log('🔗 Starting OTP sign-in for:', email);

      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: Platform.OS === 'web' 
            ? `${window.location.origin}/auth/callback`
            : undefined,
        },
      });

      if (error) {
        console.error('❌ OTP error:', error);
        throw error;
      }

      console.log('✅ OTP sent successfully');
      return { data, error: null };
    } catch (error) {
      console.error('❌ OTP sign-in error:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error : new Error('Failed to send OTP') 
      };
    }
  }

  /**
   * Verify OTP token
   */
  static async verifyOTP(email: string, token: string) {
    try {
      console.log('🔐 Verifying OTP for:', email);

      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email',
      });

      if (error) {
        console.error('❌ OTP verification error:', error);
        throw error;
      }

      console.log('✅ OTP verified successfully');
      return { data, error: null };
    } catch (error) {
      console.error('❌ OTP verification error:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error : new Error('Invalid OTP code') 
      };
    }
  }

  /**
   * Sign out the current user
   */
  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }

      return { error: null };
    } catch (error) {
      console.error('❌ Sign out error:', error);
      return { 
        error: error instanceof Error ? error : new Error('Sign out failed') 
      };
    }
  }

  /**
   * Get the current session
   */
  static async getSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        throw error;
      }

      return { session, error: null };
    } catch (error) {
      console.error('❌ Get session error:', error);
      return { 
        session: null, 
        error: error instanceof Error ? error : new Error('Failed to get session') 
      };
    }
  }

  /**
   * Get the current user
   */
  static async getUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        throw error;
      }

      return { user, error: null };
    } catch (error) {
      console.error('❌ Get user error:', error);
      return { 
        user: null, 
        error: error instanceof Error ? error : new Error('Failed to get user') 
      };
    }
  }

  /**
   * Refresh the current session
   */
  static async refreshSession() {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      console.error('❌ Refresh session error:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error : new Error('Failed to refresh session') 
      };
    }
  }
}