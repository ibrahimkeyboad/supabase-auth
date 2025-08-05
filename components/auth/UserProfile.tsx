import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { LogOut, User as UserIcon } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import Typography from '@/constants/Typography';

interface UserProfileProps {
  showSignOut?: boolean;
  style?: any;
}

export default function UserProfile({ showSignOut = true, style }: UserProfileProps) {
  const { user, signOut, loading } = useAuth();
  const { data: userProfile, isLoading: profileLoading } = useUserProfile();

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: signOut 
        },
      ]
    );
  };

  if (!user) {
    return null;
  }

  // Get name from user_profiles table, fallback to phone
  const displayName = userProfile?.full_name || user.phone || 'User';

  // Get avatar from user_profiles table
  const avatarUrl = userProfile?.profile_image_url;

  return (
    <View style={[styles.container, style]}>
      <View style={styles.userInfo}>
        <View style={styles.avatarContainer}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <UserIcon size={24} color={Colors.neutral[600]} />
            </View>
          )}
        </View>
        
        <View style={styles.userDetails}>
          <Text style={styles.userName}>{displayName}</Text>
          {user.phone && (
            <Text style={styles.userEmail}>{user.phone}</Text>
          )}
        </View>
      </View>

      {showSignOut && (
        <TouchableOpacity
          style={styles.signOutButton}
          onPress={handleSignOut}
          disabled={loading}
        >
          <LogOut size={20} color={Colors.error[600]} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: Colors.white,
    borderRadius: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    ...Typography.h5,
    marginBottom: 2,
  },
  userEmail: {
    ...Typography.body,
    color: Colors.neutral[600],
  },
  signOutButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.error[50],
  },
});