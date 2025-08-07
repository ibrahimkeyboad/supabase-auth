import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import Colors from '@/constants/Colors';
import Typography from '@/constants/Typography';
import Card from '@/components/common/Card';
import UserProfile from '@/components/auth/UserProfile';
import AuthGuard from '@/components/auth/AuthGuard';

export default function ProfileScreen() {
  const router = useRouter();

  const menuItems = [
    {
      title: 'Account',
      items: [
        {
          icon: <Ionicons name="person" size={20} color={Colors.neutral[700]} />,
          label: 'Personal Information',
          onPress: () => router.push('/profile/personal'),
        },
        {
          icon: <Ionicons name="storefront" size={20} color={Colors.neutral[700]} />,
          label: 'My Shop Address', 
          onPress: () => router.push('/profile/addresses'),
        },
        {
          icon: <Ionicons name="card" size={20} color={Colors.neutral[700]} />,
          label: 'Payment Methods',
          onPress: () => router.push('/profile/payment'),
        },
      ],
    },
    {
      title: 'Activities',
      items: [
        {
          icon: <Ionicons name="receipt" size={20} color={Colors.neutral[700]} />,
          label: 'Order History',
          onPress: () => router.push('/profile/orders'),
        },
        {
          icon: <Ionicons name="bar-chart" size={20} color={Colors.neutral[700]} />,
          label: 'Purchase Analytics',
          onPress: () => router.push('/profile/analytics'),
        },
      ],
    },
    {
      title: 'Preferences',
      items: [
        {
          icon: <Ionicons name="notifications" size={20} color={Colors.neutral[700]} />,
          label: 'Notifications',
          onPress: () => router.push('/profile/notifications'),
        },
        {
          icon: <Ionicons name="settings" size={20} color={Colors.neutral[700]} />,
          label: 'Settings',
          onPress: () => router.push('/profile/settings'),
        },
        {
          icon: <Ionicons name="help-circle" size={20} color={Colors.neutral[700]} />,
          label: 'Help & Support',
          onPress: () => router.push('/profile/help'),
        },
        {
          icon: <Ionicons name="document-text" size={20} color={Colors.neutral[700]} />,
          label: 'Terms & Conditions',
          onPress: () => router.push('/legal/terms'),
        },
        {
          icon: <Ionicons name="shield-checkmark" size={20} color={Colors.neutral[700]} />,
          label: 'Privacy Policy',
          onPress: () => router.push('/legal/privacy'),
        },
      ],
    },
  ];

  return (
    <AuthGuard>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>My Profile</Text>
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <UserProfile style={styles.profileCard} />

          {menuItems.map((section, index) => (
            <View key={index} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <Card style={styles.menuCard}>
                {section.items.map((item, itemIndex) => (
                  <TouchableOpacity
                    key={itemIndex}
                    style={[
                      styles.menuItem,
                      itemIndex < section.items.length - 1 && styles.menuItemBorder,
                    ]}
                    onPress={item.onPress}
                  >
                    <View style={styles.menuItemContent}>
                      <View style={styles.menuItemIcon}>{item.icon}</View>
                      <Text style={styles.menuItemLabel}>{item.label}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={Colors.neutral[400]} />
                  </TouchableOpacity>
                ))}
              </Card>
            </View>
          ))}

          <Text style={styles.versionText}>Version 1.0.0</Text>
        </ScrollView>
      </View>
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },
  header: {
    backgroundColor: Colors.white,
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  title: {
    ...Typography.h3,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  profileCard: {
    marginTop: 16,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    ...Typography.h5,
    marginBottom: 12,
    marginLeft: 4,
  },
  menuCard: {
    padding: 0,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemIcon: {
    marginRight: 12,
  },
  menuItemLabel: {
    ...Typography.body,
  },
  versionText: {
    ...Typography.caption,
    color: Colors.neutral[500],
    textAlign: 'center',
    marginBottom: 16,
  },
});