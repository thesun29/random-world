import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import GufengIcon from './GufengIcons';

interface SystemCardProps {
  id: string;
  name: string;
  icon: string;
  description: string;
  unlocked: boolean;
  onPress?: () => void;
}

export default function SystemCard({ 
  id, 
  name, 
  icon, 
  description, 
  unlocked, 
  onPress 
}: SystemCardProps) {
  return (
    <TouchableOpacity
      style={[styles.card, !unlocked && styles.locked]}
      onPress={unlocked ? onPress : undefined}
      disabled={!unlocked}
      activeOpacity={unlocked ? 0.7 : 1}
    >
      <View style={[styles.iconContainer, !unlocked && styles.lockedIconContainer]}>
        <GufengIcon 
          name={unlocked ? icon : 'lock-closed'} 
          size={34} 
        />
      </View>
      <Text style={[styles.name, !unlocked && styles.lockedText]}>{name}</Text>
      <Text style={[styles.description, !unlocked && styles.lockedText]}>
        {unlocked ? description : '未解锁'}
      </Text>
      {unlocked && (
        <View style={styles.unlockedBadge}>
          <GufengIcon name="checkmark-circle" size={18} />
        </View>
      )}
      {!unlocked && (
        <View style={styles.lockOverlay}>
          <GufengIcon name="lock-closed" size={28} />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: Layout.borderRadiusLarge,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    ...Colors.shadow.card,
    position: 'relative',
    aspectRatio: 1,
    borderWidth: 2,
    borderColor: Colors.border.subtle,
    minHeight: 120,
  },
  locked: {
    opacity: 0.5,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: Layout.borderRadius,
    backgroundColor: Colors.backgroundLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 3,
    borderColor: Colors.border.accent,
  },
  lockedIconContainer: {
    backgroundColor: Colors.backgroundLight,
    borderColor: Colors.textMuted,
  },
  name: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  description: {
    color: Colors.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  lockedText: {
    color: Colors.textMuted,
  },
  unlockedBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.overlay.medium,
    borderRadius: Layout.borderRadiusLarge,
    justifyContent: 'center',
    alignItems: 'center',
  },
});