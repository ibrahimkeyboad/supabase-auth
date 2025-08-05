import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

// Create storage adapter that works for both web and mobile
const createStorageAdapter = () => {
  if (Platform.OS === 'web') {
    return {
      getItem: (key: string) => {
        if (typeof window !== 'undefined' && window.localStorage) {
          return window.localStorage.getItem(key);
        }
        return null;
      },
      setItem: (key: string, value: string) => {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(key, value);
        }
      },
      removeItem: (key: string) => {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.removeItem(key);
        }
      },
    };
  } else {
    // For React Native (iOS/Android)
    return {
      getItem: async (key: string) => {
        try {
          return await AsyncStorage.getItem(key);
        } catch (error) {
          console.error('AsyncStorage getItem error:', error);
          return null;
        }
      },
      setItem: async (key: string, value: string) => {
        try {
          await AsyncStorage.setItem(key, value);
        } catch (error) {
          console.error('AsyncStorage setItem error:', error);
        }
      },
      removeItem: async (key: string) => {
        try {
          await AsyncStorage.removeItem(key);
        } catch (error) {
          console.error('AsyncStorage removeItem error:', error);
        }
      },
    };
  }
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    storage: createStorageAdapter(),
  },
});