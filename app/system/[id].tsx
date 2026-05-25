import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useGameStore } from '@/store/useGameStore';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';

const systemInfo = {
  dishes: { name: '菜品', icon: 'restaurant', description: '收集各种美食食谱，提升种族的食物品质', items: ['烧烤', '炖菜', '点心', '汤品'] },
  secrets: { name: '秘术', icon: 'sparkles', description: '学习古老的秘术，获得神秘的力量', items: ['火焰术', '治愈术', '隐身术', '传送术'] },
  beasts: { name: '异兽', icon: 'paw', description: '驯养各种神奇的异兽作为伙伴', items: ['灵狐', '神鹰', '龙驹', '凤凰'] },
  weapons: { name: '神兵', icon: 'shield', description: '打造强力的神兵利器', items: ['轩辕剑', '盘古斧', '东皇钟', '太极图'] },
  building: { name: '修建', icon: 'construct', description: '建造各种建筑来发展你的种族', items: ['祭坛', '工坊', '学院', '城墙'] },
  arrays: { name: '阵界', icon: 'grid', description: '布置神秘的阵法', items: ['聚灵阵', '防御阵', '迷踪阵', '杀阵'] },
  empire: { name: '皇朝', icon: 'crown', description: '建立强大的皇朝统治', items: ['宫殿', '军队', '律法', '朝贡'] },
};

export default function SystemDetailScreen() {
  const { id } = useLocalSearchParams();
  const { player } = useGameStore();

  const systemId = Array.isArray(id) ? id[0] : id;
  const info = systemInfo[systemId as keyof typeof systemInfo];
  const isUnlocked = player?.unlockedSystems.includes(systemId);

  if (!info) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>{info.name}</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <View style={styles.infoSection}>
          <Ionicons name={info.icon as any} size={60} color={Colors.accent} />
          <Text style={styles.description}>{info.description}</Text>
          {!isUnlocked && (
            <View style={styles.lockedNotice}>
              <Ionicons name="lock-closed" size={20} color={Colors.textMuted} />
              <Text style={styles.lockedText}>系统未解锁</Text>
            </View>
          )}
        </View>

        <View style={styles.itemsSection}>
          <Text style={styles.sectionTitle}>{isUnlocked ? '可收集' : '即将解锁'}</Text>
          <View style={styles.itemsGrid}>
            {info.items.map((item, index) => (
              <View key={index} style={[styles.itemCard, !isUnlocked && styles.itemLocked]}>
                <Ionicons name="cube" size={24} color={isUnlocked ? Colors.accent : Colors.textMuted} />
                <Text style={[styles.itemName, !isUnlocked && styles.itemNameLocked]}>{item}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Layout.padding,
    paddingTop: 10,
  },
  backButton: {
    padding: 8,
  },
  title: {
    color: Colors.accent,
    fontSize: 24,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: Layout.padding,
  },
  infoSection: {
    alignItems: 'center',
    marginBottom: 32,
    padding: 24,
    backgroundColor: Colors.card,
    borderRadius: Layout.borderRadius,
    ...Layout.shadow,
  },
  description: {
    color: Colors.text,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 24,
  },
  lockedNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    gap: 8,
  },
  lockedText: {
    color: Colors.textMuted,
    fontSize: 14,
  },
  itemsSection: {
    flex: 1,
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  itemCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.card,
    padding: 20,
    borderRadius: Layout.borderRadius,
    alignItems: 'center',
    ...Layout.shadow,
  },
  itemLocked: {
    opacity: 0.5,
  },
  itemName: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
    marginTop: 12,
    textAlign: 'center',
  },
  itemNameLocked: {
    color: Colors.textMuted,
  },
});
