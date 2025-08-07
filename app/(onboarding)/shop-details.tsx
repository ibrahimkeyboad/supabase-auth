import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import Colors from '@/constants/Colors';
import Typography from '@/constants/Typography';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import { useUpdateShopDetails, useCompleteOnboarding } from '@/hooks/useUserProfile';
import { useAuthStore } from '@/stores/authStore';

const SHOP_TYPES = [
  'Agrovet Shop',
  'Agricultural Supplies Store',
  'Farm Input Dealer',
  'Veterinary Clinic',
  'Seed & Fertilizer Store',
  'Agricultural Equipment Dealer',
  'Other'
];

const BUSINESS_SIZES = [
  'Small (1-5 employees)',
  'Medium (6-20 employees)',
  'Large (21+ employees)',
  'Individual/Solo'
];

export default function ShopDetailsScreen() {
  const router = useRouter();
  const updateShopDetailsMutation = useUpdateShopDetails();
  const completeOnboardingMutation = useCompleteOnboarding();
  
  const [formData, setFormData] = useState({
    shopName: '',
    shopType: '',
    businessSize: '',
  });
  
  const [showShopTypePicker, setShowShopTypePicker] = useState(false);
  const [showBusinessSizePicker, setShowBusinessSizePicker] = useState(false);
  const isLoading = updateShopDetailsMutation.isPending || completeOnboardingMutation.isPending;

  const handleCompleteSetup = async () => {
    if (!formData.shopName.trim()) {
      Alert.alert('Error', 'Please enter your shop name');
      return;
    }

    if (!formData.shopType.trim()) {
      Alert.alert('Error', 'Please select your shop type');
      return;
    }

    try {
      // Save shop details
      await updateShopDetailsMutation.mutateAsync({
        shop_name: formData.shopName,
        shop_type: formData.shopType,
        business_size: formData.businessSize || undefined,
      });

      // Mark onboarding as completed
      await completeOnboardingMutation.mutateAsync();
      
      // Clear any saved phone number since profile is now complete
      useAuthStore.getState().setSavedPhoneNumber(null);
      
      // Redirect to main app
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to complete setup. Please try again.');
    }
  };

  const selectShopType = (type: string) => {
    setFormData({ ...formData, shopType: type });
    setShowShopTypePicker(false);
  };

  const selectBusinessSize = (size: string) => {
    setFormData({ ...formData, businessSize: size });
    setShowBusinessSizePicker(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="storefront" size={24} color={Colors.primary[700]} />
            </View>
            <Text style={styles.title}>Agrovet Shop Details</Text>
            <Text style={styles.subtitle}>
              Tell us about your agrovet business so we can provide the best wholesale prices and product recommendations for your shop.
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Input
              label="Shop Name"
              value={formData.shopName}
              onChangeText={(text) => setFormData({ ...formData, shopName: text })}
              placeholder="Enter your shop name"
              autoCapitalize="words"
            />

            {/* Shop Type Selector */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Shop Type</Text>
              <TouchableOpacity
                style={styles.selector}
                onPress={() => setShowShopTypePicker(!showShopTypePicker)}
              >
                <Text style={[
                  styles.selectorText,
                  !formData.shopType && styles.placeholder
                ]}>
                  {formData.shopType || 'select shop type'}
                </Text>
                <Ionicons name="chevron-down" size={20} color={Colors.neutral[500]} />
              </TouchableOpacity>
              
              {showShopTypePicker && (
                <View style={styles.pickerContainer}>
                  <ScrollView style={styles.picker} nestedScrollEnabled>
                    {SHOP_TYPES.map((type) => (
                      <TouchableOpacity
                        key={type}
                        style={styles.pickerItem}
                        onPress={() => selectShopType(type)}
                      >
                        <Text style={styles.pickerItemText}>{type}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            {/* Business Size Selector */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Business size (optional)</Text>
              <TouchableOpacity
                style={styles.selector}
                onPress={() => setShowBusinessSizePicker(!showBusinessSizePicker)}
              >
                <Text style={[
                  styles.selectorText,
                  !formData.businessSize && styles.placeholder
                ]}>
                  {formData.businessSize || 'Select business size'}
                </Text>
                <Ionicons name="chevron-down" size={20} color={Colors.neutral[500]} />
              </TouchableOpacity>
              
              {showBusinessSizePicker && (
                <View style={styles.pickerContainer}>
                  <ScrollView style={styles.picker} nestedScrollEnabled>
                    {BUSINESS_SIZES.map((size) => (
                      <TouchableOpacity
                        key={size}
                        style={styles.pickerItem}
                        onPress={() => selectBusinessSize(size)}
                      >
                        <Text style={styles.pickerItemText}>{size}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Footer Button */}
      <View style={styles.footer}>
        <Button
          title="Complete Setup"
          onPress={handleCompleteSetup}
          loading={isLoading}
          style={styles.completeButton}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    ...Typography.h2,
    textAlign: 'center',
    marginBottom: 12,
    color: Colors.neutral[900],
  },
  subtitle: {
    ...Typography.body,
    textAlign: 'center',
    color: Colors.neutral[600],
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  form: {
    gap: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    ...Typography.label,
    marginBottom: 6,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.neutral[300],
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.white,
  },
  selectorText: {
    ...Typography.body,
    color: Colors.neutral[900],
  },
  placeholder: {
    color: Colors.neutral[500],
  },
  pickerContainer: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: Colors.neutral[300],
    borderRadius: 8,
    backgroundColor: Colors.white,
    maxHeight: 200,
  },
  picker: {
    maxHeight: 200,
  },
  pickerItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  pickerItemText: {
    ...Typography.body,
    color: Colors.neutral[900],
  },
  footer: {
    padding: 24,
    paddingBottom: 40,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[200],
  },
  completeButton: {
    width: '100%',
  },
});