import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';

export interface UserProfile {
  id: string;
  full_name?: string;
  phone?: string;
  profile_image_url?: string;
  region?: string;
  district?: string;
  street_area?: string;
  shop_name?: string;
  shop_type?: string;
  business_size?: string;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserProfileUpdate {
  full_name?: string;
  phone?: string;
  profile_image_url?: string;
  region?: string;
  district?: string;
  street_area?: string;
  shop_name?: string;
  shop_type?: string;
  business_size?: string;
  onboarding_completed?: boolean;
}

export class UserProfileService {
  /**
   * Get the current user's profile
   */
  static async getUserProfile(): Promise<UserProfile | null> {
    try {
      const user = useAuthStore.getState().user;
      if (!user) {
        throw new Error('User must be authenticated');
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No profile found, return null
          return null;
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Failed to get user profile:', error);
      throw error;
    }
  }

  /**
   * Create or update user profile
   */
  static async upsertUserProfile(profileData: UserProfileUpdate): Promise<UserProfile> {
    try {
      const user = useAuthStore.getState().user;
      if (!user) {
        throw new Error('User must be authenticated');
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          ...profileData,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Failed to upsert user profile:', error);
      throw error;
    }
  }

  /**
   * Update specific fields in user profile
   */
  static async updateUserProfile(updates: UserProfileUpdate): Promise<UserProfile> {
    try {
      const user = useAuthStore.getState().user;
      if (!user) {
        throw new Error('User must be authenticated');
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Failed to update user profile:', error);
      throw error;
    }
  }

  /**
   * Mark onboarding as completed
   */
  static async completeOnboarding(): Promise<void> {
    try {
      await this.updateUserProfile({ onboarding_completed: true });
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      throw error;
    }
  }

  /**
   * Check if user has completed onboarding
   */
  static async hasCompletedOnboarding(): Promise<boolean> {
    try {
      const profile = await this.getUserProfile();
      return profile?.onboarding_completed || false;
    } catch (error) {
      console.error('Failed to check onboarding status:', error);
      return false;
    }
  }

  /**
   * Update personal information
   */
  static async updatePersonalInfo(data: {
    full_name: string;
    phone: string;
  }): Promise<UserProfile> {
    return this.updateUserProfile(data);
  }

  /**
   * Update shop location
   */
  static async updateShopLocation(data: {
    region: string;
    district: string;
    street_area: string;
  }): Promise<UserProfile> {
    return this.updateUserProfile(data);
  }

  /**
   * Update shop details
   */
  static async updateShopDetails(data: {
    shop_name: string;
    shop_type: string;
    business_size?: string;
  }): Promise<UserProfile> {
    return this.updateUserProfile(data);
  }
}