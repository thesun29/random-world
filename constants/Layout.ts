import { Dimensions } from 'react-native';
import { horizontalScale, verticalScale, responsiveFontSize } from '@/utils/Scaling';

const { width, height } = Dimensions.get('window');

export default {
  window: {
    width,
    height,
  },
  isSmallDevice: width < 375,
  padding: horizontalScale(12),
  paddingSmall: horizontalScale(12),
  paddingLarge: horizontalScale(24),
  borderRadius: horizontalScale(12),
  borderRadiusSmall: horizontalScale(8),
  borderRadiusLarge: horizontalScale(16),
  borderRadiusXLarge: horizontalScale(20),
  shadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  spacing: {
    xs: horizontalScale(4),
    sm: horizontalScale(8),
    md: horizontalScale(12),
    lg: horizontalScale(16),
    xl: horizontalScale(20),
    xxl: horizontalScale(24),
  },
  scale: horizontalScale,
  verticalScale: verticalScale,
  fontScale: responsiveFontSize,
};