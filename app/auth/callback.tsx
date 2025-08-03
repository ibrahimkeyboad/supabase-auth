import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { UserProfileService } from '@/services/userProfileService';
import Colors from '@/constants/Colors';
import Typography from '@/constants/Typography';

export default function AuthCallback() {
  const router = useRouter();
  const { user } = useAuth();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('🔄 Processing auth callback...');
        
        // Check if we have URL parameters (for web)
        if (typeof window !== 'undefined') {
          const urlParams = new URLSearchParams(window.location.search);
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          
          // Check for error in URL
          const error = urlParams.get('error') || hashParams.get('error');
          const errorDescription = urlParams.get('error_description') || hashParams.get('error_description');
          
          if (error) {
            console.error('❌ Auth callback error:', error, errorDescription);
            setStatus('error');
            setTimeout(() => {
              router.replace('/(onboarding)/auth');
            }, 2000);
            return;
          }

          // Check for access token
          const accessToken = urlParams.get('access_token') || hashParams.get('access_token');
          const refreshToken = urlParams.get('refresh_token') || hashParams.get('refresh_token');
          
          if (accessToken && refreshToken) {
            console.log('🔑 Setting session from URL params...');
            
            const { data, error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (sessionError) {
              console.error('❌ Error setting session:', sessionError);
              setStatus('error');
              setTimeout(() => {
                router.replace('/(onboarding)/auth');
              }, 2000);
              return;
            }

            if (data.user) {
              console.log('✅ Session set successfully for:', data.user.email);
              setStatus('success');
              
              // Check onboarding status and redirect accordingly
              try {
                const hasCompletedOnboarding = await UserProfileService.hasCompletedOnboarding();
                console.log('🔍 Onboarding completed:', hasCompletedOnboarding);
                
                setTimeout(() => {
                  if (hasCompletedOnboarding) {
                    console.log('✅ Redirecting to main app');
                    router.replace('/(tabs)');
                  } else {
                    console.log('📝 Redirecting to onboarding');
                    router.replace('/(onboarding)/profile-setup');
                  }
                }, 1000);
              } catch (error) {
                console.error('❌ Failed to check onboarding status:', error);
                // Default to onboarding if we can't check
                setTimeout(() => {
                  router.replace('/(onboarding)/profile-setup');
                }, 1000);
              }
              // Small delay to show success state, then redirect
              setTimeout(() => {
                router.replace('/(tabs)');
              }, 1000);
              return;
            }
          }

          // If we get here, check if there's already a session
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session?.user) {
            console.log('✅ Existing session found for:', session.user.email);
            setStatus('success');
            
            // Check onboarding status for existing session
            try {
              const hasCompletedOnboarding = await UserProfileService.hasCompletedOnboarding();
              console.log('🔍 Existing user onboarding completed:', hasCompletedOnboarding);
              
              setTimeout(() => {
                if (hasCompletedOnboarding) {
                  router.replace('/(tabs)');
                } else {
                  router.replace('/(onboarding)/profile-setup');
                }
              }, 1000);
            } catch (error) {
              console.error('❌ Failed to check existing user onboarding:', error);
              setTimeout(() => {
                router.replace('/(onboarding)/profile-setup');
              }, 1000);
            }
            setTimeout(() => {
              router.replace('/(tabs)');
            }, 1000);
            return;
          }
        }

        // If no auth data found, redirect to auth screen
        console.log('❌ No authentication data found');
        setStatus('error');
        setTimeout(() => {
          router.replace('/(onboarding)/auth');
        }, 2000);

      } catch (error) {
        console.error('❌ Auth callback processing error:', error);
        setStatus('error');
        setTimeout(() => {
          router.replace('/(onboarding)/auth');
        }, 2000);
      }
    };

    handleAuthCallback();
  }, [router]);

  const getStatusMessage = () => {
    switch (status) {
      case 'processing':
        return 'Processing sign in...';
      case 'success':
        return 'Sign in successful! Redirecting...';
      case 'error':
        return 'Authentication failed. Redirecting...';
      default:
        return 'Processing...';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return Colors.success[500];
      case 'error':
        return Colors.error[500];
      default:
        return Colors.primary[700];
    }
  };

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={getStatusColor()} />
      <Text style={[styles.text, { color: getStatusColor() }]}>
        {getStatusMessage()}
      </Text>
      {status === 'success' && (
        <Text style={styles.subText}>
          Welcome! Taking you to the app...
        </Text>
      )}
      {status === 'error' && (
        <Text style={styles.subText}>
          Please try signing in again.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: 32,
  },
  text: {
    ...Typography.h5,
    marginTop: 24,
    textAlign: 'center',
  },
  subText: {
    ...Typography.body,
    color: Colors.neutral[600],
    marginTop: 8,
    textAlign: 'center',
  },
});