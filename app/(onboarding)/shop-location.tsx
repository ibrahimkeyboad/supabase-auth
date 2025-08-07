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
import { useUpdateShopLocation } from '@/hooks/useUserProfile';
import { useAuthStore } from '@/stores/authStore';

const TANZANIA_REGIONS = [
  'Arusha', 'Dar es Salaam', 'Dodoma', 'Geita', 'Iringa', 'Kagera',
  'Katavi', 'Kigoma', 'Kilimanjaro', 'Lindi', 'Manyara', 'Mara',
  'Mbeya', 'Morogoro', 'Mtwara', 'Mwanza', 'Njombe', 'Pemba North',
  'Pemba South', 'Pwani', 'Rukwa', 'Ruvuma', 'Shinyanga', 'Simiyu',
  'Singida', 'Songwe', 'Tabora', 'Tanga', 'Unguja North', 'Unguja South'
];

export default function ShopLocationScreen() {
  const router = useRouter();
  const updateShopLocationMutation = useUpdateShopLocation();
  
  const [formData, setFormData] = useState({
    region: '',
    district: '',
    streetArea: '',
  });
  
  const [showRegionPicker, setShowRegionPicker] = useState(false);
  const isLoading = updateShopLocationMutation.isPending;

  const handleContinue = async () => {
    if (!formData.region.trim()) {
      Alert.alert('Error', 'Please select your region');
      return;
    }

    if (!formData.district.trim()) {
      Alert.alert('Error', 'Please enter your district');
      return;
    }

    if (!formData.streetArea.trim()) {
      Alert.alert('Error', 'Please enter your street or area');
      return;
    }

    try {
      await updateShopLocationMutation.mutateAsync({
        region: formData.region,
        district: formData.district,
        street_area: formData.streetArea,
      });
      
      // Check if we need shop details or can go to main app
      const profileStatus = await useAuthStore.getState().checkProfileCompletion();
      
      console.log('📊 Shop location - next step:', profileStatus);
      
      if (profileStatus === 'complete') {
        router.replace('/(tabs)');
      } else {
        router.replace('/(onboarding)/shop-details');
      }
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to save location. Please try again.');
    }
  };

  const selectRegion = (region: string) => {
    setFormData({ ...formData, region });
    setShowRegionPicker(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="location" size={24} color={Colors.primary[700]} />
            </View>
            <Text style={styles.title}>Shop Location</Text>
            <Text style={styles.subtitle}>
              Please provide the location of your agrovet shop so we can deliver agricultural inputs directly to your shop.
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Region Selector */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Region</Text>
              <TouchableOpacity
                style={styles.selector}
                onPress={() => setShowRegionPicker(!showRegionPicker)}
              >
                <Text style={[
                  styles.selectorText,
                  !formData.region && styles.placeholder
                ]}>
                  {formData.region || 'Select your region'}
                </Text>
                <Ionicons name="chevron-down" size={20} color={Colors.neutral[500]} />
              </TouchableOpacity>
              
              {showRegionPicker && (
                <View style={styles.pickerContainer}>
                  <ScrollView style={styles.picker} nestedScrollEnabled>
                    {TANZANIA_REGIONS.map((region) => (
                      <TouchableOpacity
                        key={region}
                        style={styles.pickerItem}
                        onPress={() => selectRegion(region)}
                      >
                        <Text style={styles.pickerItemText}>{region}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            <Input
              label="District"
              value={formData.district}
              onChangeText={(text) => setFormData({ ...formData, district: text })}
              placeholder="Enter your district"
              autoCapitalize="words"
            />

            <Input
              label="Street/Area"
              value={formData.streetArea}
              onChangeText={(text) => setFormData({ ...formData, streetArea: text })}
              placeholder="Street name or area"
              autoCapitalize="words"
            />
          </View>
        </View>
      </ScrollView>

      {/* Footer Button */}
      <View style={styles.footer}>
        <Button
          title="Continue"
          onPress={handleContinue}
          loading={isLoading}
          style={styles.continueButton}
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
  continueButton: {
    width: '100%',
  },
});