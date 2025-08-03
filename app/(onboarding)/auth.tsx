import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Platform,
  Alert,
  Image,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

import Colors from '@/constants/Colors';
import Typography from '@/constants/Typography';
import OTPSignInForm from '@/components/auth/OTPSignInForm';
import { useAuth } from '@/hooks/useAuth';

const { width, height } = Dimensions.get('window');

export default function AuthScreen() {
  const router = useRouter();
  const { user, error, clearError } = useAuth();

  // Redirect if user is already authenticated
  useEffect(() => {
    if (user) {
      console.log('User already authenticated, redirecting to profile setup');
      router.replace('/(onboarding)/profile-setup');
    }
  }, [user, router]);

  // Show error if authentication fails
  useEffect(() => {
    if (error) {
      Alert.alert('Authentication Error', error, [
        { text: 'OK', onPress: clearError },
      ]);
    }
  }, [error, clearError]);

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#E8F5E8', '#F0F9FF']} style={styles.gradient}>
        {/* Header Image */}
        {/* <View style={styles.headerImageContainer}>
          <Image
            source={{ uri: 'https://images.pexels.com/photos/2132171/pexels-photo-2132171.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' }}
            style={styles.headerImage}
          />
          <View style={styles.imageOverlay} />
        </View> */}

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoText}>🌱</Text>
            </View>
          </View>

          <Text style={styles.title}>Welcome to AgriLink</Text>
          <Text style={styles.subtitle}>
            Connect with trusted suppliers using your phone number to get started with quality agricultural products
          </Text>

          {/* OTP Sign In Form */}
          <View style={styles.signInContainer}>
            <OTPSignInForm style={styles.otpForm} />
          </View>

          {/* Terms */}
          <Text style={styles.terms}>
            By continuing, you agree to our{' '}
            <Text style={styles.link}>Terms of Service</Text> and{' '}
            <Text style={styles.link}>Privacy Policy</Text>
          </Text>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  headerImageContainer: {
    height: height * 0.4,
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 32,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  logoText: {
    fontSize: 32,
  },
  title: {
    ...Typography.h1,
    textAlign: 'center',
    marginBottom: 16,
    color: Colors.neutral[900],
  },
  subtitle: {
    ...Typography.body,
    textAlign: 'center',
    color: Colors.neutral[600],
    lineHeight: 24,
    marginBottom: 48,
    paddingHorizontal: 16,
  },
  signInContainer: {
    width: '100%',
    marginBottom: 32,
  },
  otpForm: {
    width: '100%',
  },
  terms: {
    ...Typography.caption,
    textAlign: 'center',
    color: Colors.neutral[500],
    lineHeight: 18,
    paddingHorizontal: 32,
  },
  link: {
    color: Colors.primary[700],
    textDecorationLine: 'underline',
  },
});
