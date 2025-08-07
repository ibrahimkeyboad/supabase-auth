import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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
  const otpInputRefs = useRef<(TextInput | null)[]>([]);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);

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

  // Auto-verify when all 6 digits are entered
  useEffect(() => {
    const fullOtp = otpDigits.join('');
    if (fullOtp.length === 6 && /^\d{6}$/.test(fullOtp)) {
      setOtpCode(fullOtp);
      handleVerifyOTP(fullOtp);
    }
  }, [otpDigits]);

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

  const handleVerifyOTP = async (otp?: string) => {
    const codeToVerify = otp || otpCode;
    
    if (!codeToVerify.trim()) {
      Alert.alert('Error', 'Please enter the OTP code');
      return;
    }

    if (codeToVerify.length !== 6) {
      Alert.alert('Error', 'OTP code must be 6 digits');
      return;
    }

    clearError();
    await verifyOTP(phone.startsWith('0') ? '+255' + phone.slice(1) : phone, codeToVerify);
  };

  const handleResendOTP = async () => {
    clearError();
    await signInWithOTP(phone.startsWith('0') ? '+255' + phone.slice(1) : phone);
  };

  const handleOtpDigitChange = (digit: string, index: number) => {
    // Only allow numeric input
    if (!/^\d*$/.test(digit)) return;

    const newOtpDigits = [...otpDigits];
    newOtpDigits[index] = digit;
    setOtpDigits(newOtpDigits);

    // Auto-focus next input
    if (digit && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otpDigits[index] && index > 0) {
      // Focus previous input on backspace if current is empty
      otpInputRefs.current[index - 1]?.focus();
    }
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
              leftIcon={<Ionicons name="call" size={20} color={Colors.neutral[500]} />}
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

            {/* Custom OTP Input */}
            <View style={styles.otpContainer}>
              <Text style={styles.otpLabel}>Verification Code</Text>
              <View style={styles.otpInputContainer}>
                {otpDigits.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => (otpInputRefs.current[index] = ref)}
                    style={[
                      styles.otpInput,
                      digit && styles.otpInputFilled,
                      error && styles.otpInputError,
                    ]}
                    value={digit}
                    onChangeText={(text) => handleOtpDigitChange(text, index)}
                    onKeyPress={({ nativeEvent }) => handleOtpKeyPress(nativeEvent.key, index)}
                    keyboardType="numeric"
                    maxLength={1}
                    selectTextOnFocus
                    autoFocus={index === 0}
                  />
                ))}
              </View>
              {verifyingOtp && (
                <View style={styles.verifyingContainer}>
                  <Ionicons name="checkmark-circle" size={16} color={Colors.success[600]} />
                  <Text style={styles.verifyingText}>Verifying code...</Text>
                </View>
              )}
            </View>

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
                <Ionicons name="time" size={16} color={Colors.neutral[500]} />
                <Text style={styles.cooldownText}>
                  Resend code in {formatCooldownTime(cooldownTime)}
                </Text>
              </View>
            )}

            <Button
              title="Change Phone Number"
              onPress={() => {
                setPhone('');
                setOtpDigits(['', '', '', '', '', '']);
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
            <Ionicons name="alert-circle" size={16} color={Colors.error[600]} />
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
  otpContainer: {
    marginBottom: 24,
  },
  otpLabel: {
    ...Typography.label,
    marginBottom: 12,
    textAlign: 'center',
  },
  otpInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  otpInput: {
    width: 45,
    height: 55,
    borderWidth: 2,
    borderColor: Colors.neutral[300],
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: Colors.neutral[900],
    backgroundColor: Colors.white,
  },
  otpInputFilled: {
    borderColor: Colors.primary[600],
    backgroundColor: Colors.primary[50],
  },
  otpInputError: {
    borderColor: Colors.error[500],
    backgroundColor: Colors.error[50],
  },
  verifyingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  verifyingText: {
    ...Typography.bodySmall,
    color: Colors.success[600],
    marginLeft: 6,
    fontFamily: 'Inter-Medium',
  },
  resendButton: {
    width: '100%',
    marginTop: 16,
  },
  cooldownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: 16,
    paddingVertical: 12,
    backgroundColor: Colors.neutral[50],
    borderRadius: 8,
  },
  cooldownText: {
    ...Typography.body,
    color: Colors.neutral[600],
    marginLeft: 6,
  },
  changePhoneButton: {
    width: '100%',
    marginTop: 8,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.error[50],
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  errorText: {
    ...Typography.bodySmall,
    color: Colors.error[700],
    marginLeft: 6,
    textAlign: 'center',
    flex: 1,
  },
});