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
import { LogOut, User as UserIcon } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import Typography from '@/constants/Typography';

interface UserProfileProps {
  showSignOut?: boolean;
  style?: any;
}

export default function UserProfile({ showSignOut = true, style }: UserProfileProps) {
  const { user, signOut, loading } = useAuth();

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

  const displayName = user.user_metadata?.full_name || 
                     user.user_metadata?.name || 
                     user.phone || 
                     user.email?.split('@')[0] || 
                     'User';

  // Try to get avatar from user profile or fallback to auth metadata
  const avatarUrl = user.user_metadata?.profile_image_url || 
                   user.user_metadata?.avatar_url || 
                   user.user_metadata?.picture;

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
          {(user.phone || user.email) && (
            <Text style={styles.userEmail}>{user.phone || user.email}</Text>
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