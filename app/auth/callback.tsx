import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/stores/authStore';
import Colors from '@/constants/Colors';
import Typography from '@/constants/Typography';

export default function AuthCallback() {
  const router = useRouter();
  const { user } = useAuth();
  const authStore = useAuthStore();
  const [status, setStatus] = useState<'processing' | 'checking_profile' | 'success' | 'error'>('processing');
  const [currentStep, setCurrentStep] = useState('Verifying authentication...');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('🔄 Processing auth callback...');
        setStatus('processing');
        setCurrentStep('Verifying authentication...');
        
        // Check if there's already a session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          console.log('✅ Session found for:', session.user.phone || 'unknown');
          
          // Save phone number to device
          if (session.user.phone) {
            authStore.setSavedPhoneNumber(session.user.phone);
          }
          
          setStatus('checking_profile');
          setCurrentStep('Checking your profile...');
          
          // Wait a moment for better UX
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Check profile completion status
          try {
            const profileStatus = await authStore.checkProfileCompletion();
            
            console.log('📊 Auth callback profile status:', profileStatus);
            
            setCurrentStep('Setting up your experience...');
            await new Promise(resolve => setTimeout(resolve, 800));
            
            setStatus('success');
            
            // Navigate based on profile completion
            setTimeout(() => {
              switch (profileStatus) {
                case 'needs_name':
                  console.log('🔄 Redirecting to profile setup (missing name)');
                  setCurrentStep('Setting up your profile...');
                  router.replace('/(onboarding)/profile-setup');
                  break;
                case 'needs_shop_address':
                  console.log('🔄 Redirecting to shop location (missing address)');
                  setCurrentStep('Setting up your shop location...');
                  router.replace('/(onboarding)/shop-location');
                  break;
                case 'complete':
                  console.log('✅ Profile complete, redirecting to main app');
                  setCurrentStep('Welcome back! Taking you to the app...');
                  router.replace('/(tabs)');
                  break;
              }
            }, 1200);
          } catch (error) {
            console.error('❌ Failed to check profile completion:', error);
            setCurrentStep('Setting up your profile...');
            setTimeout(() => {
              router.replace('/(onboarding)/profile-setup');
            }, 1000);
          }
          return;
        }

        // If no auth data found, redirect to auth screen
        console.log('❌ No authentication data found');
        setStatus('error');
        setCurrentStep('Authentication failed. Please try again.');
        setTimeout(() => {
          router.replace('/(onboarding)/auth');
        }, 2000);

      } catch (error) {
        console.error('❌ Auth callback processing error:', error);
        setStatus('error');
        setCurrentStep('Something went wrong. Please try again.');
        setTimeout(() => {
          router.replace('/(onboarding)/auth');
        }, 2000);
      }
    };

    handleAuthCallback();
  }, [router]);

  const getStatusIcon = () => {
    switch (status) {
      case 'processing':
        return <ActivityIndicator size="large" color={Colors.primary[700]} />;
      case 'checking_profile':
        return <Ionicons name="person-circle" size={48} color={Colors.primary[700]} />;
      case 'success':
        return <Ionicons name="checkmark-circle" size={48} color={Colors.success[500]} />;
      case 'error':
        return <Ionicons name="alert-circle" size={48} color={Colors.error[500]} />;
      default:
        return <ActivityIndicator size="large" color={Colors.primary[700]} />;
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
      <View style={styles.content}>
        {getStatusIcon()}
        <Text style={[styles.text, { color: getStatusColor() }]}>
          {currentStep}
        </Text>
        
        {status === 'checking_profile' && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={styles.progressFill} />
            </View>
            <Text style={styles.progressText}>
              Personalizing your experience...
            </Text>
          </View>
        )}
        
        {status === 'success' && (
          <View style={styles.successContainer}>
            <Ionicons name="sparkles" size={20} color={Colors.primary[600]} />
            <Text style={styles.successText}>
              Everything looks great!
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  text: {
    ...Typography.h5,
    marginTop: 24,
    textAlign: 'center',
    fontFamily: 'Inter-Medium',
  },
  progressContainer: {
    marginTop: 32,
    alignItems: 'center',
    width: '100%',
  },
  progressBar: {
    width: '80%',
    height: 4,
    backgroundColor: Colors.neutral[200],
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    width: '70%',
    height: '100%',
    backgroundColor: Colors.primary[600],
    borderRadius: 2,
  },
  progressText: {
    ...Typography.body,
    color: Colors.neutral[600],
    textAlign: 'center',
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  successText: {
    ...Typography.body,
    color: Colors.primary[600],
    marginLeft: 8,
    fontFamily: 'Inter-Medium',
  },
});