import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ShippingAddress } from '@/types/ecommerce';

interface AddressStore {
  addresses: ShippingAddress[];
  isLoading: boolean;
  error?: string;

  // Actions
  addAddress: (address: Omit<ShippingAddress, 'id'>) => void;
  updateAddress: (id: string, address: Partial<ShippingAddress>) => void;
  deleteAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
  getDefaultAddress: () => ShippingAddress | undefined;
  getAddress: (id: string) => ShippingAddress | undefined;
  clearAddresses: () => void;
}

export const useAddressStore = create<AddressStore>()(
  persist(
    (set, get) => ({
      addresses: [],
      isLoading: false,
      error: undefined,

      addAddress: (addressData) => {
        set({ isLoading: true, error: undefined });

        try {
          const id = `addr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          const addresses = get().addresses;
          
          // If this is the first address, make it default
          const isDefault = addresses.length === 0 || addressData.isDefault;
          
          // If setting as default, remove default from other addresses
          const updatedAddresses = isDefault 
            ? addresses.map(addr => ({ ...addr, isDefault: false }))
            : addresses;

          const newAddress: ShippingAddress = {
            ...addressData,
            id,
            isDefault,
          };

          set({
            addresses: [...updatedAddresses, newAddress],
            isLoading: false,
          });
        } catch (error) {
          set({ error: 'Failed to add address', isLoading: false });
        }
      },

      updateAddress: (id, updates) => {
        set({ isLoading: true, error: undefined });

        try {
          const addresses = get().addresses;
          let updatedAddresses = addresses.map(addr =>
            addr.id === id ? { ...addr, ...updates } : addr
          );

          // If setting as default, remove default from other addresses
          if (updates.isDefault) {
            updatedAddresses = updatedAddresses.map(addr =>
              addr.id === id ? addr : { ...addr, isDefault: false }
            );
          }

          set({ addresses: updatedAddresses, isLoading: false });
        } catch (error) {
          set({ error: 'Failed to update address', isLoading: false });
        }
      },

      deleteAddress: (id) => {
        set({ isLoading: true, error: undefined });

        try {
          const addresses = get().addresses;
          const addressToDelete = addresses.find(addr => addr.id === id);
          const remainingAddresses = addresses.filter(addr => addr.id !== id);

          // If deleted address was default and there are remaining addresses,
          // make the first one default
          if (addressToDelete?.isDefault && remainingAddresses.length > 0) {
            remainingAddresses[0].isDefault = true;
          }

          set({ addresses: remainingAddresses, isLoading: false });
        } catch (error) {
          set({ error: 'Failed to delete address', isLoading: false });
        }
      },

      setDefaultAddress: (id) => {
        set({ isLoading: true, error: undefined });

        try {
          const addresses = get().addresses.map(addr => ({
            ...addr,
            isDefault: addr.id === id,
          }));

          set({ addresses, isLoading: false });
        } catch (error) {
          set({ error: 'Failed to set default address', isLoading: false });
        }
      },

      getDefaultAddress: () => {
        return get().addresses.find(addr => addr.isDefault);
      },

      getAddress: (id) => {
        return get().addresses.find(addr => addr.id === id);
      },

      clearAddresses: () => {
        set({ addresses: [] });
      },
    }),
    {
      name: 'agrilink-addresses',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        addresses: state.addresses,
      }),
    }
  )
);