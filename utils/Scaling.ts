import { Dimensions, PixelRatio, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

export const BASE_SCREEN_WIDTH = 375;
export const BASE_SCREEN_HEIGHT = 667;

export const horizontalScale = (size: number) => (width / BASE_SCREEN_WIDTH) * size;

export const verticalScale = (size: number) => (height / BASE_SCREEN_HEIGHT) * size;

export const moderateScale = (size: number, factor: number = 0.5) => {
  return size + (horizontalScale(size) - size) * factor;
};

export const responsiveFontSize = (size: number) => {
  const scale = width / BASE_SCREEN_WIDTH;
  const newSize = size * scale;
  return Platform.OS === 'ios' 
    ? Math.round(PixelRatio.roundToNearestPixel(newSize))
    : Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2;
};

export const screenWidth = width;
export const screenHeight = height;

export const isSmallDevice = width < 375;
export const isMediumDevice = width >= 375 && width < 414;
export const isLargeDevice = width >= 414;

export const getDeviceType = () => {
  if (isSmallDevice) return 'small';
  if (isMediumDevice) return 'medium';
  return 'large';
};

export default {
  horizontalScale,
  verticalScale,
  moderateScale,
  responsiveFontSize,
  screenWidth,
  screenHeight,
  isSmallDevice,
  isMediumDevice,
  isLargeDevice,
  getDeviceType,
};
