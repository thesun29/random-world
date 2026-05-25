import React, { useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useGameStore } from '@/store/useGameStore';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';

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
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors.accent} />
        <Text style={styles.loadingText}>加载中...</Text>
      </View>
    );
  }

  return (
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: Layout.padding,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    color: Colors.accent,
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 16,
  },
  logoContainer: {
    marginBottom: 60,
  },
  logo: {
    fontSize: 100,
  },
  primaryButton: {
    backgroundColor: Colors.accent,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: Layout.borderRadius,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: Colors.primaryDark,
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingText: {
    color: Colors.text,
    fontSize: 18,
  },
  disclaimer: {
    color: Colors.textMuted,
    fontSize: 14,
    marginTop: 40,
    textAlign: 'center',
  },
});
