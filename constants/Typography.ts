import { StyleSheet } from 'react-native';
import Colors from './Colors';

export const Typography = StyleSheet.create({
  // Headings
  h1: {
    fontFamily: 'Inter-Bold',
    fontSize: 32,
    lineHeight: 38,
    color: Colors.neutral[900],
  },
  h2: {
    fontFamily: 'Inter-Bold',
    fontSize: 28,
    lineHeight: 34,
    color: Colors.neutral[900],
  },
  h3: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    lineHeight: 29,
    color: Colors.neutral[900],
  },
  h4: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 20,
    lineHeight: 24,
    color: Colors.neutral[900],
  },
  h5: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    lineHeight: 22,
    color: Colors.neutral[900],
  },
  h6: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    lineHeight: 19,
    color: Colors.neutral[900],
  },

  // Body text
  bodyLarge: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    lineHeight: 24,
    color: Colors.neutral[800],
  },
  body: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    lineHeight: 21,
    color: Colors.neutral[800],
  },
  bodySmall: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    lineHeight: 18,
    color: Colors.neutral[800],
  },

  // Special text styles
  caption: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    lineHeight: 16,
    color: Colors.neutral[600],
  },
  button: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    lineHeight: 17,
    color: Colors.white,
    textTransform: 'uppercase',
  },
  label: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    lineHeight: 17,
    color: Colors.neutral[700],
  },
  price: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    lineHeight: 22,
    color: Colors.primary[800],
  },
  discount: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    lineHeight: 17,
    color: Colors.error[500],
    textDecorationLine: 'line-through',
  },
});

export default Typography;