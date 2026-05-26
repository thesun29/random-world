import React, { useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useGameStore } from '@/store/useGameStore';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import ScalableView from '@/components/ScalableView';

export default function LoginScreen() {
  const { player, loadSavedPlayer } = useGameStore();
  const [isLoading, setIsLoading] = React.useState(true);
  const [isInitialized, setIsInitialized] = React.useState(false);

  useEffect(() => {
    const initialize = async () => {
      if (!isInitialized) {
        setIsInitialized(true);
        await loadSavedPlayer();
        setIsLoading(false);
      }
    };
    initialize();
  }, []);

  const handleStartGame = () => {
    router.replace('/home');
  };

  if (isLoading) {
    return (
      <ScalableView>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.accent} />
          <Text style={styles.loadingText}>加载中...</Text>
        </View>
      </ScalableView>
    );
  }

  return (
    <ScalableView>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>随机世界</Text>
          <Text style={styles.subtitle}>文字肉鸽生存游戏</Text>
        </View>

        <View style={styles.logoContainer}>
          <Text style={styles.logo}>🌟</Text>
        </View>

        <TouchableOpacity 
          style={styles.primaryButton} 
          onPress={handleStartGame}
        >
          <Text style={styles.primaryButtonText}>开始游戏</Text>
        </TouchableOpacity>

        <Text style={styles.disclaimer}>成为造物主，引导你的种族走向辉煌</Text>
      </View>
    </ScalableView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: Layout.scale(360),
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: Layout.scale(20),
  },
  title: {
    color: Colors.accent,
    fontSize: Layout.fontScale(28),
    fontWeight: 'bold',
    marginBottom: Layout.scale(6),
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: Layout.fontScale(15),
  },
  logoContainer: {
    marginBottom: Layout.scale(28),
  },
  logo: {
    fontSize: Layout.scale(72),
  },
  primaryButton: {
    backgroundColor: Colors.accent,
    paddingVertical: Layout.scale(13),
    paddingHorizontal: Layout.scale(36),
    borderRadius: Layout.borderRadius,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: Colors.primaryDark,
    fontSize: Layout.fontScale(17),
    fontWeight: 'bold',
  },
  loadingText: {
    color: Colors.text,
    fontSize: Layout.fontScale(17),
  },
  disclaimer: {
    color: Colors.textMuted,
    fontSize: Layout.fontScale(12),
    marginTop: Layout.scale(20),
    textAlign: 'center',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: Layout.scale(16),
  },
});
