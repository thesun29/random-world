import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';

interface ProgressBarProps {
  progress: number;
  total?: number;
  height?: number;
  showText?: boolean;
}

export default function ProgressBar({ 
  progress, 
  total = 100, 
  height = 12,
  showText = true 
}: ProgressBarProps) {
  const safeProgress = typeof progress === 'number' && !isNaN(progress) ? progress : 0;
  const percentage = Math.min(Math.max((safeProgress / total) * 100, 0), 100);

  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <View style={styles.labelLeft}>
          <Ionicons name="compass" size={14} color={Colors.accent} />
          <Text style={styles.label}>探索进度</Text>
        </View>
      </View>
      <View style={[styles.progressBarContainer, { height: height + 20 }]}>
        <View style={[styles.background, { height }]}>
          <View style={[styles.fillContainer, { height }]}>
            <View style={[styles.fill, { width: `${percentage}%`, height }]} />
            <View style={[styles.fillGlow, { width: `${percentage}%`, height }]} />
          </View>
          <View style={styles.markers}>
            {[...Array(10)].map((_, index) => (
              <View key={index} style={styles.marker} />
            ))}
          </View>
        </View>
        {percentage > 0 && percentage < 100 && (
          <View style={[styles.bubble, { left: `${percentage}%` }]}>
            <Text style={styles.bubbleText}>{Math.round(percentage)}%</Text>
            <View style={styles.bubbleArrow} />
          </View>
        )}
        {percentage >= 100 && (
          <View style={[styles.bubble, styles.bubbleComplete, { left: `${percentage}%` }]}>
            <Text style={styles.bubbleText}>{Math.round(percentage)}%</Text>
            <View style={styles.bubbleArrow} />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  labelLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  label: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  progressBarContainer: {
    width: '100%',
    position: 'relative',
    justifyContent: 'center',
  },
  background: {
    width: '100%',
    backgroundColor: Colors.primaryDark,
    borderRadius: Layout.borderRadiusSmall,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border.subtle,
  },
  fillContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    overflow: 'hidden',
    borderRadius: Layout.borderRadiusSmall,
  },
  fill: {
    backgroundColor: Colors.accent,
    borderRadius: Layout.borderRadiusSmall,
  },
  fillGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: Colors.accentLight,
    opacity: 0.3,
    borderRadius: Layout.borderRadiusSmall,
  },
  markers: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  marker: {
    width: 1,
    height: '100%',
    backgroundColor: Colors.primaryDark,
    opacity: 0.5,
  },
  bubble: {
    position: 'absolute',
    top: -8,
    transform: [{ translateX: -20 }],
    backgroundColor: Colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    alignItems: 'center',
    zIndex: 10,
    borderWidth: 1,
    borderColor: Colors.primaryDark,
  },
  bubbleComplete: {
    backgroundColor: Colors.success,
  },
  bubbleText: {
    color: Colors.primaryDark,
    fontSize: 10,
    fontWeight: 'bold',
  },
  bubbleArrow: {
    position: 'absolute',
    bottom: -4,
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderTopWidth: 4,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: Colors.accent,
  },
});
