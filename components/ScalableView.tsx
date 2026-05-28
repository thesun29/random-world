import React from 'react';
import { View, StyleSheet, ScrollView, ViewStyle, ScrollViewProps, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { horizontalScale, verticalScale } from '@/utils/Scaling';

interface ScalableViewProps {
  children: React.ReactNode;
  style?: ViewStyle;
  scrollable?: boolean;
  scrollViewProps?: ScrollViewProps;
  contentContainerStyle?: ViewStyle;
  centered?: boolean;
  disableSafeArea?: boolean;
}

export default function ScalableView({
  children,
  style,
  scrollable = false,
  scrollViewProps,
  contentContainerStyle,
  centered = true,
  disableSafeArea = false,
}: ScalableViewProps) {
  const containerStyle = [
    styles.container,
    style,
  ];

  const scrollContentStyle = [
    centered ? styles.scrollContentCentered : styles.scrollContent,
    contentContainerStyle,
  ];

  if (scrollable) {
    if (disableSafeArea) {
      return (
        <View style={containerStyle}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={scrollContentStyle}
            showsVerticalScrollIndicator={false}
            bounces={true}
            {...scrollViewProps}
          >
            {children}
          </ScrollView>
        </View>
      );
    }
    return (
      <SafeAreaView style={containerStyle} edges={['top', 'bottom', 'left', 'right']}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={scrollContentStyle}
          showsVerticalScrollIndicator={false}
          bounces={true}
          {...scrollViewProps}
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (disableSafeArea) {
    return (
      <View style={containerStyle}>
        <View style={centered ? styles.contentCentered : styles.content}>
          {children}
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={containerStyle} edges={['top', 'bottom', 'left', 'right']}>
      <View style={centered ? styles.contentCentered : styles.content}>
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a0a2e',
  },
  content: {
    flex: 1,
  },
  contentCentered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(24),
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  scrollContentCentered: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(24),
  },
});
