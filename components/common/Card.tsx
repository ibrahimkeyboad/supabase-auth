import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Colors from '@/constants/Colors';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'flat' | 'elevated' | 'outline';
}

export default function Card({ 
  children, 
  style, 
  variant = 'default' 
}: CardProps) {
  const getCardStyle = () => {
    switch (variant) {
      case 'flat':
        return styles.flat;
      case 'elevated':
        return styles.elevated;
      case 'outline':
        return styles.outline;
      default:
        return styles.default;
    }
  };

  return (
    <View style={[styles.card, getCardStyle(), style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    backgroundColor: Colors.white,
  },
  default: {
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  flat: {
    backgroundColor: Colors.neutral[50],
  },
  elevated: {
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  outline: {
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
});