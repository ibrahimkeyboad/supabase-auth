import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Mail, Lock } from 'lucide-react-native';

import Colors from '@/constants/Colors';
import Typography from '@/constants/Typography';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import { useAuth } from '@/hooks/useAuth';

interface OTPSignInFormProps {
  style?: any;
}

export default function OTPSignInForm({ style }: OTPSignInFormProps) {
  const { signInWithOTP, verifyOTP, loading, verifyingOtp, otpSent, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');

  const handleSendOTP = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    clearError();
    await signInWithOTP(email);
  };

  const handleVerifyOTP = async () => {
    if (!otpCode.trim()) {
      Alert.alert('Error', 'Please enter the OTP code');
      return;
    }

    if (otpCode.length !== 6) {
      Alert.alert('Error', 'OTP code must be 6 digits');
      return;
    }

    clearError();
    await verifyOTP(email, otpCode);
  };

  const handleResendOTP = async () => {
    clearError();
    await signInWithOTP(email);
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, style]}
    >
      <View style={styles.form}>
        {!otpSent ? (
          <>
            <Text style={styles.title}>Sign in to AgriLink</Text>
            <Text style={styles.subtitle}>
              Enter your email address to receive a verification code
            </Text>

            <Input
              label="Email Address"
              value={email}
              onChangeText={setEmail}
              placeholder="youremail@example.com"
              leftIcon={<Mail size={20} color={Colors.neutral[500]} />}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Button
              title="Send Verification Code"
              onPress={handleSendOTP}
              loading={loading}
              style={styles.sendButton}
            />
          </>
        ) : (
          <>
            <Text style={styles.title}>Enter Verification Code</Text>
            <Text style={styles.subtitle}>
              We've sent a 6-digit code to {email}
            </Text>

            <Input
              label="Verification Code"
              value={otpCode}
              onChangeText={setOtpCode}
              placeholder="000000"
              leftIcon={<Lock size={20} color={Colors.neutral[500]} />}
              keyboardType="numeric"
              maxLength={6}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Button
              title="Verify Code"
              onPress={handleVerifyOTP}
              loading={verifyingOtp}
              style={styles.verifyButton}
            />

            <Button
              title="Resend Code"
              onPress={handleResendOTP}
              variant="text"
              disabled={loading}
              style={styles.resendButton}
            />

            <Button
              title="Change Email"
              onPress={() => {
                setOtpCode('');
                clearError();
              }}
              variant="text"
              style={styles.changeEmailButton}
            />
          </>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  form: {
    width: '100%',
  },
  title: {
    ...Typography.h3,
    textAlign: 'center',
    marginBottom: 8,
    color: Colors.neutral[900],
  },
  subtitle: {
    ...Typography.body,
    textAlign: 'center',
    color: Colors.neutral[600],
    marginBottom: 32,
    lineHeight: 22,
  },
  sendButton: {
    width: '100%',
    marginTop: 8,
  },
  verifyButton: {
    width: '100%',
    marginTop: 8,
  },
  resendButton: {
    width: '100%',
    marginTop: 16,
  },
  changeEmailButton: {
    width: '100%',
    marginTop: 8,
  },
  errorContainer: {
    backgroundColor: Colors.error[50],
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  errorText: {
    ...Typography.bodySmall,
    color: Colors.error[700],
    textAlign: 'center',
  },
});