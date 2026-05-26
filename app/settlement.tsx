import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useGameStore } from '@/store/useGameStore';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import ScalableView from '@/components/ScalableView';

export default function SettlementScreen() {
  const { player, currentRun } = useGameStore();
  const isExtinction = currentRun && currentRun.population <= 0;

  const handleContinue = () => {
    router.replace('/home');
  };

  if (!player) {
    return null;
  }

  return (
    <ScalableView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{isExtinction ? '探索失败' : '探索完成'}</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.successIcon}>
          {isExtinction ? (
            <Ionicons name="skull" size={Layout.scale(80)} color={Colors.error} />
          ) : (
            <Ionicons name="checkmark-circle" size={Layout.scale(80)} color={Colors.accent} />
          )}
        </View>

        <Text style={[styles.subtitle, isExtinction && { color: Colors.error }]}>
          {isExtinction ? '族群灭亡...' : '收获颇丰！'}
        </Text>

        {!isExtinction && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>获得资源</Text>
              <View style={styles.resourcesGrid}>
                {Object.entries(player.worldData.resources).map(([key, value]) => (
                  <View key={key} style={styles.resourceItem}>
                    <Text style={styles.resourceValue}>{value}</Text>
                    <Text style={styles.resourceName}>
                      {key === 'food' ? '食物' : 
                       key === 'water' ? '水源' :
                       key === 'wood' ? '木材' : '石材'}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>解锁种族</Text>
              <View style={styles.raceList}>
                {player.worldData.unlockedRaces.map((raceId, index) => (
                  <View key={index} style={styles.raceItem}>
                    <Ionicons name="person" size={Layout.scale(20)} color={Colors.accent} />
                    <Text style={styles.raceName}>{raceId}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>解锁系统</Text>
              <View style={styles.systemsList}>
                {player.unlockedSystems.length > 0 ? (
                  player.unlockedSystems.map((systemId, index) => (
                    <View key={index} style={styles.systemItem}>
                      <Ionicons name="star" size={Layout.scale(16)} color={Colors.accent} />
                      <Text style={styles.systemName}>
                        {systemId === 'dishes' ? '菜品' :
                         systemId === 'secrets' ? '秘术' :
                         systemId === 'beasts' ? '异兽' :
                         systemId === 'weapons' ? '神兵' :
                         systemId === 'building' ? '修建' :
                         systemId === 'arrays' ? '阵界' : '皇朝'}
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.noItems}>暂无解锁系统</Text>
                )}
              </View>
            </View>
          </>
        )}
        
        {isExtinction && (
          <View style={styles.extinctionInfo}>
            <Text style={styles.extinctionText}>你的族人都已死去。</Text>
            <Text style={styles.extinctionText}>下次探索要更加小心！</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueButtonText}>继续游戏</Text>
        </TouchableOpacity>
      </View>
    </ScalableView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    alignItems: 'center',
    paddingTop: Layout.scale(20),
  },
  title: {
    color: Colors.accent,
    fontSize: Layout.fontScale(28),
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: Layout.padding,
  },
  successIcon: {
    alignItems: 'center',
    marginVertical: Layout.scale(30),
  },
  subtitle: {
    color: Colors.text,
    fontSize: Layout.fontScale(22),
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: Layout.scale(30),
  },
  section: {
    marginBottom: Layout.scale(30),
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: Layout.fontScale(20),
    fontWeight: 'bold',
    marginBottom: Layout.scale(16),
  },
  resourcesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Layout.scale(12),
  },
  resourceItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.card,
    padding: Layout.scale(20),
    borderRadius: Layout.borderRadius,
    alignItems: 'center',
  },
  resourceValue: {
    color: Colors.accent,
    fontSize: Layout.fontScale(28),
    fontWeight: 'bold',
  },
  resourceName: {
    color: Colors.textSecondary,
    fontSize: Layout.fontScale(14),
    marginTop: Layout.scale(8),
  },
  raceList: {
    gap: Layout.scale(12),
  },
  raceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    padding: Layout.scale(16),
    borderRadius: Layout.borderRadius,
    gap: Layout.scale(12),
  },
  raceName: {
    color: Colors.text,
    fontSize: Layout.fontScale(16),
    fontWeight: '600',
  },
  systemsList: {
    gap: Layout.scale(12),
  },
  systemItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    padding: Layout.scale(16),
    borderRadius: Layout.borderRadius,
    gap: Layout.scale(12),
  },
  systemName: {
    color: Colors.text,
    fontSize: Layout.fontScale(16),
    fontWeight: '600',
  },
  noItems: {
    color: Colors.textMuted,
    fontSize: Layout.fontScale(14),
    textAlign: 'center',
    padding: Layout.scale(20),
  },
  extinctionInfo: {
    alignItems: 'center',
    paddingVertical: Layout.scale(30),
  },
  extinctionText: {
    color: Colors.text,
    fontSize: Layout.fontScale(18),
    textAlign: 'center',
    marginVertical: Layout.scale(8),
  },
  footer: {
    padding: Layout.padding,
  },
  continueButton: {
    backgroundColor: Colors.accent,
    paddingVertical: Layout.scale(18),
    paddingHorizontal: Layout.scale(32),
    borderRadius: Layout.borderRadius,
    alignItems: 'center',
  },
  continueButtonText: {
    color: Colors.primaryDark,
    fontSize: Layout.fontScale(18),
    fontWeight: 'bold',
  },
});
