import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/stores/authStore';
import Colors from '@/constants/Colors';
import Typography from '@/constants/Typography';

export default function AuthCallback() {
  const router = useRouter();
  const { user } = useAuth();
  const authStore = useAuthStore();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('🔄 Processing auth callback...');
        
        // Check if there's already a session (phone OTP doesn't use URL callbacks)
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          console.log('✅ Session found for:', session.user.phone || 'unknown');
          setStatus('success');
          
          // Save phone number to device
          if (session.user.phone) {
            authStore.setSavedPhoneNumber(session.user.phone);
          }
          
          // Check profile completion status
          try {
            const profileStatus = await useAuthStore.getState().checkProfileCompletion();
            
            console.log('📊 Auth callback profile status:', profileStatus);
            
            setTimeout(() => {
              switch (profileStatus) {
                case 'needs_name':
                  console.log('🔄 Redirecting to profile setup (missing name)');
                  router.replace('/(onboarding)/profile-setup');
                  break;
                case 'needs_shop_address':
                  console.log('🔄 Redirecting to shop location (missing address)');
                  router.replace('/(onboarding)/shop-location');
                  break;
                case 'complete':
                  console.log('✅ Profile complete, redirecting to main app');
                  router.replace('/(tabs)');
                  break;
              }
            }, 1000);
          } catch (error) {
            console.error('❌ Failed to check profile completion:', error);
            setTimeout(() => {
              router.replace('/(onboarding)/profile-setup');
            }, 1000);
          }
          return;
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