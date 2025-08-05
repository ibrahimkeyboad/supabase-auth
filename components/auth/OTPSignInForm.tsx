import React, { useState } from 'react';
import { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Phone, Lock } from 'lucide-react-native';

import Colors from '@/constants/Colors';
import Typography from '@/constants/Typography';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/stores/authStore';

interface OTPSignInFormProps {
  style?: any;
}

export default function OTPSignInForm({ style }: OTPSignInFormProps) {
  const { signInWithOTP, verifyOTP, loading, verifyingOtp, otpSent, error, clearError, canResendOTP, getResendCooldownTime } = useAuth();
  const { savedPhoneNumber, resetOTPState } = useAuthStore();
  const [phone, setPhone] = useState(savedPhoneNumber || '');
  const [otpCode, setOtpCode] = useState('');
  const [cooldownTime, setCooldownTime] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load saved phone number on component mount
  useEffect(() => {
    if (savedPhoneNumber && !phone) {
      setPhone(savedPhoneNumber);
    }
  }, [savedPhoneNumber, phone]);

  // Update cooldown timer
  useEffect(() => {
    if (otpSent && !canResendOTP()) {
      const updateCooldown = () => {
        const remaining = getResendCooldownTime();
        setCooldownTime(Math.ceil(remaining / 1000));
        
        if (remaining <= 0) {
          setCooldownTime(0);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        }
      };
      
      updateCooldown();
      intervalRef.current = setInterval(updateCooldown, 1000);
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [otpSent, canResendOTP, getResendCooldownTime]);
  const handleSendOTP = async () => {
    if (!phone.trim()) {
      Alert.alert('Error', 'Please enter your phone number');
      return;
    }

    // Basic phone validation for Tanzanian numbers
    const phoneRegex = /^(\+255|0)[67]\d{8}$/;
    if (!phoneRegex.test(phone)) {
      Alert.alert('Error', 'Please enter a valid Tanzanian phone number (e.g., +255712345678 or 0712345678)');
      return;
    }

    // Normalize phone number to international format
    const normalizedPhone = phone.startsWith('0') ? '+255' + phone.slice(1) : phone;

    clearError();
    await signInWithOTP(normalizedPhone);
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
    await verifyOTP(phone.startsWith('0') ? '+255' + phone.slice(1) : phone, otpCode);
  };

  const handleResendOTP = async () => {
    clearError();
    await signInWithOTP(phone.startsWith('0') ? '+255' + phone.slice(1) : phone);
  };

  const formatCooldownTime = (seconds: number) => {
    if (seconds >= 3600) {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (seconds >= 60) {
      const minutes = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${minutes}m ${secs}s`;
    } else {
      return `${seconds}s`;
    }
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
              Enter your phone number to receive a verification code via SMS
            </Text>

            <Input
              label="Phone Number"
              value={phone}
              onChangeText={setPhone}
              placeholder="+255712345678 or 0712345678"
              leftIcon={<Phone size={20} color={Colors.neutral[500]} />}
              keyboardType="phone-pad"
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
              We've sent a 6-digit code to {phone}
            </Text>

            <Input
              label="Verification Code"
              value={otpCode}
              onChangeText={setOtpCode}
              placeholder="000000"
              leftIcon={<Lock size={20} color={Colors.neutral[500]} />}
              keyboardType="numeric"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Button
              title="Verify Code"
              onPress={handleVerifyOTP}
              loading={verifyingOtp}
              style={styles.verifyButton}
            />

            {canResendOTP() ? (
              <Button
                title="Resend Code"
                onPress={handleResendOTP}
                variant="text"
                disabled={loading}
                style={styles.resendButton}
              />
            ) : (
              <View style={styles.cooldownContainer}>
                <Text style={styles.cooldownText}>
                  Resend code in {formatCooldownTime(cooldownTime)}
                </Text>
              </View>
            )}

            <Button
              title="Change Phone"
              onPress={() => {
                setPhone('');
                setOtpCode('');
                resetOTPState();
                clearError();
              }}
              variant="text"
              style={styles.changePhoneButton}
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
  cooldownContainer: {
    width: '100%',
    marginTop: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cooldownText: {
    ...Typography.body,
    color: Colors.neutral[600],
    textAlign: 'center',
  },
  changePhoneButton: {
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