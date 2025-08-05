import { useAuthStore } from '@/stores/authStore';
import { useEffect } from 'react';

export function useAuth() {
  const store = useAuthStore();

  useEffect(() => {
    if (!store.initialized) {
      console.log('Initializing auth from useAuth hook...');
      store.initialize();
    }
  }, [store.initialized, store.initialize]);

  return {
    ...store,
    canResendOTP: store.canResendOTP,
    getResendCooldownTime: store.getResendCooldownTime,
  };
}