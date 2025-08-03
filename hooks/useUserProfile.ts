import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserProfile, UserProfileUpdate, UserProfileService } from '@/services/userProfileService';
import { useAuthStore } from '@/stores/authStore';

// Query keys for user profile
export const userProfileKeys = {
  all: ['userProfile'] as const,
  profile: () => [...userProfileKeys.all, 'profile'] as const,
  onboarding: () => [...userProfileKeys.all, 'onboarding'] as const,
};

// Hook for user profile
export function useUserProfile() {
  const user = useAuthStore((state) => state.user);

  return useQuery({
    queryKey: userProfileKeys.profile(),
    queryFn: UserProfileService.getUserProfile,
    enabled: !!user, // Only run if user is authenticated
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Hook for onboarding status
export function useOnboardingStatus() {
  const user = useAuthStore((state) => state.user);

  return useQuery({
    queryKey: userProfileKeys.onboarding(),
    queryFn: UserProfileService.hasCompletedOnboarding,
    enabled: !!user,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

// Hook for updating user profile
export function useUpdateUserProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UserProfileUpdate) => UserProfileService.updateUserProfile(data),
    onSuccess: () => {
      // Invalidate and refetch user profile
      queryClient.invalidateQueries({ queryKey: userProfileKeys.all });
    },
    onError: (error) => {
      console.error('Failed to update user profile:', error);
    },
  });
}

// Hook for updating personal info
export function useUpdatePersonalInfo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { full_name: string; email: string; phone: string }) =>
      UserProfileService.updatePersonalInfo(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userProfileKeys.all });
    },
    onError: (error) => {
      console.error('Failed to update personal info:', error);
    },
  });
}

// Hook for updating shop location
export function useUpdateShopLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { region: string; district: string; street_area: string }) =>
      UserProfileService.updateShopLocation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userProfileKeys.all });
    },
    onError: (error) => {
      console.error('Failed to update shop location:', error);
    },
  });
}

// Hook for updating shop details
export function useUpdateShopDetails() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { shop_name: string; shop_type: string; business_size?: string }) =>
      UserProfileService.updateShopDetails(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userProfileKeys.all });
    },
    onError: (error) => {
      console.error('Failed to update shop details:', error);
    },
  });
}

// Hook for completing onboarding
export function useCompleteOnboarding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: UserProfileService.completeOnboarding,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userProfileKeys.all });
    },
    onError: (error) => {
      console.error('Failed to complete onboarding:', error);
    },
  });
}