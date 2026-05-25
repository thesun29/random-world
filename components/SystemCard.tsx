import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';

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
        <Ionicons 
          name={unlocked ? (icon as any) : 'lock-closed'} 
          size={32} 
          color={unlocked ? Colors.accent : Colors.textMuted} 
        />
      </View>
      <Text style={[styles.name, !unlocked && styles.lockedText]}>{name}</Text>
      <Text style={[styles.description, !unlocked && styles.lockedText]}>
        {unlocked ? description : '未解锁'}
      </Text>
      {unlocked && (
        <View style={styles.unlockedBadge}>
          <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
        </View>
      )}
      {!unlocked && (
        <View style={styles.lockOverlay}>
          <Ionicons name="lock-closed" size={24} color={Colors.textMuted} />
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
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    minHeight: 120,
  },
  locked: {
    opacity: 0.5,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 2,
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
    top: 8,
    right: 8,
  },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: Layout.borderRadiusLarge,
    justifyContent: 'center',
    alignItems: 'center',
  },
});