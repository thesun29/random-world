import React from 'react';
import { Text, StyleSheet } from 'react-native';

interface GufengIconProps {
  name: string;
  size?: number;
  color?: string;
  style?: any;
}

const iconMap: Record<string, string> = {
  'stone': '🪨',
  'wood': '🪵',
  'herb': '🌿',
  'water': '💧',
  'food': '🍚',
  'people': '👥',
  'shield': '🛡️',
  'settings': '⚙️',
  'mail': '📜',
  'book': '📖',
  'game': '🎮',
  'flame': '🔥',
  'restaurant': '🍜',
  'sparkles': '✨',
  'paw': '🐾',
  'construct': '🏗️',
  'hammer': '🔨',
  'crown': '👑',
  'map': '🗺️',
  'flower': '🌸',
  'cube': '📦',
  'compass': '🧭',
  'arrow-back': '⬅️',
  'play-circle': '▶️',
  'skull': '💀',
  'trophy': '🏆',
  'arrow-forward': '➡️',
  'lock-closed': '🔒',
  'checkmark-circle': '✅',
  'star': '⭐',
  'coin': '💰',
  'sword': '⚔️',
  'scroll': '📜',
  'dragon': '🐉',
  'fan': '🪭',
  'tea': '🍵',
  'moon': '🌙',
  'sun': '☀️',
  'mountain': '⛰️',
  'tree': '🌳',
  'cloud': '☁️',
  'lantern': '🏮',
};

export default function GufengIcon({ name, size = 24, color, style }: GufengIconProps) {
  const icon = iconMap[name] || '❓';
  
  return (
    <Text 
      style={[
        styles.icon, 
        { fontSize: size },
        color ? { color } : null,
        style
      ]}
    >
      {icon}
    </Text>
  );
}

const styles = StyleSheet.create({
  icon: {
    fontFamily: 'System',
    textAlign: 'center',
  },
});
