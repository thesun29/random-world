import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useGameStore } from '@/store/useGameStore';
import { getRaceById, RACES } from '@/utils/races';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import ScalableView from '@/components/ScalableView';

const systemInfo = {
  essence: { name: '精华', icon: 'flame', description: '收集天地精华，提升种族血脉品质', items: ['血精', '魂晶', '灵髓', '道果'] },
  dishes: { name: '菜品', icon: 'restaurant', description: '收集各种美食食谱，提升种族的食物品质', items: ['烧烤', '炖菜', '点心', '汤品'] },
  secrets: { name: '秘术', icon: 'sparkles', description: '学习古老的秘术，获得神秘的力量', items: ['火焰术', '治愈术', '隐身术', '传送术'] },
  beasts: { name: '异兽', icon: 'paw', description: '驯养各种神奇的异兽作为伙伴', items: ['灵狐', '神鹰', '龙驹', '凤凰'] },
  equipment: { name: '装备', icon: 'construct', description: '打造强力的装备，提升种族战力', items: [] },
  building: { name: '修建', icon: 'hammer', description: '建造各种建筑来发展你的种族', items: ['祭坛', '工坊', '学院', '城墙'] },
  empire: { name: '帝名', icon: 'crown', description: '建立强大的皇朝统治', items: ['宫殿', '军队', '律法', '朝贡'] },
};

const EQUIPMENT_SLOTS = [
  { id: 'head', name: '头', icon: 'ribbon', count: 1 },
  { id: 'body', name: '身', icon: 'shirt', count: 1 },
  { id: 'arm', name: '臂', icon: 'hand-right', count: 2 },
  { id: 'hand', name: '手', icon: 'hand-left', count: 2 },
  { id: 'leg', name: '腿', icon: 'walk', count: 2 },
  { id: 'foot', name: '足', icon: 'footsteps', count: 2 },
];

export default function SystemDetailScreen() {
  const { id } = useLocalSearchParams();
  const { player } = useGameStore();

  const systemId = Array.isArray(id) ? id[0] : id;
  const info = systemInfo[systemId as keyof typeof systemInfo];
  const isUnlocked = player?.unlockedSystems.includes(systemId);

  if (!info) {
    return null;
  }

  if (systemId === 'equipment') {
    return <EquipmentScreen />;
  }

  return (
    <ScalableView>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={Layout.scale(24)} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>{info.name}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.infoSection}>
          <Ionicons name={info.icon as any} size={Layout.scale(60)} color={Colors.accent} />
          <Text style={styles.description}>{info.description}</Text>
          {!isUnlocked && (
            <View style={styles.lockedNotice}>
              <Ionicons name="lock-closed" size={Layout.scale(20)} color={Colors.textMuted} />
              <Text style={styles.lockedText}>系统未解锁</Text>
            </View>
          )}
        </View>

        <View style={styles.itemsSection}>
          <Text style={styles.sectionTitle}>{isUnlocked ? '可收集' : '即将解锁'}</Text>
          <View style={styles.itemsGrid}>
            {info.items.map((item, index) => (
              <View key={index} style={[styles.itemCard, !isUnlocked && styles.itemLocked]}>
                <Ionicons name="cube" size={Layout.scale(24)} color={isUnlocked ? Colors.accent : Colors.textMuted} />
                <Text style={[styles.itemName, !isUnlocked && styles.itemNameLocked]}>{item}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </ScalableView>
  );
}

function EquipmentScreen() {
  const { player } = useGameStore();
  const unlockedRaces = player?.worldData.unlockedRaces || ['ape'];

  const renderEquipmentSlot = (slotType: string, slotName: string, icon: string, index: number = 0) => (
    <View key={`${slotType}-${index}`} style={styles.equipmentSlot}>
      <View style={styles.slotIcon}>
        <Ionicons name={icon as any} size={Layout.scale(28)} color={Colors.accent} />
      </View>
      <Text style={styles.slotName}>{slotName}{index > 0 ? `${index + 1}` : ''}</Text>
      <View style={styles.slotPlaceholder}>
        <Ionicons name="add-circle-outline" size={Layout.scale(32)} color={Colors.textMuted} />
        <Text style={styles.slotPlaceholderText}>未装备</Text>
      </View>
    </View>
  );

  return (
    <ScalableView>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={Layout.scale(24)} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>装备</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.infoSection}>
          <Ionicons name="construct" size={Layout.scale(60)} color={Colors.accent} />
          <Text style={styles.description}>为你的种族打造强力的装备，提升整体战力。每个种族有10个装备栏位。</Text>
        </View>

        {unlockedRaces.map((raceId) => {
          const race = getRaceById(raceId);
          if (!race) return null;

          return (
            <View key={raceId} style={styles.raceSection}>
              <View style={styles.raceHeader}>
                <View style={styles.raceIcon}>
                  <Ionicons name="people" size={Layout.scale(28)} color={Colors.accent} />
                </View>
                <View style={styles.raceInfo}>
                  <Text style={styles.raceName}>{race.name}</Text>
                  <Text style={styles.raceTier}>T{race.tier}</Text>
                </View>
              </View>

              <View style={styles.equipmentLayout}>
                <View style={styles.equipmentRow}>
                  <View style={styles.armSlot} />
                  {renderEquipmentSlot('head', '头', 'ribbon')}
                  <View style={styles.armSlot} />
                </View>

                <View style={styles.equipmentRow}>
                  {renderEquipmentSlot('arm', '臂', 'hand-right', 0)}
                  {renderEquipmentSlot('body', '身', 'shirt')}
                  {renderEquipmentSlot('arm', '臂', 'hand-right', 1)}
                </View>

                <View style={styles.equipmentRow}>
                  {renderEquipmentSlot('hand', '手', 'hand-left', 0)}
                  <View style={styles.armSlot} />
                  {renderEquipmentSlot('hand', '手', 'hand-left', 1)}
                </View>

                <View style={styles.equipmentRow}>
                  {renderEquipmentSlot('leg', '腿', 'walk', 0)}
                  <View style={styles.armSlot} />
                  {renderEquipmentSlot('leg', '腿', 'walk', 1)}
                </View>

                <View style={styles.equipmentRow}>
                  {renderEquipmentSlot('foot', '足', 'footsteps', 0)}
                  <View style={styles.armSlot} />
                  {renderEquipmentSlot('foot', '足', 'footsteps', 1)}
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </ScalableView>
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
    paddingTop: Layout.scale(10),
  },
  backButton: {
    padding: Layout.scale(8),
  },
  title: {
    color: Colors.accent,
    fontSize: Layout.fontScale(24),
    fontWeight: 'bold',
  },
  placeholder: {
    width: Layout.scale(40),
  },
  content: {
    flex: 1,
    padding: Layout.padding,
  },
  infoSection: {
    alignItems: 'center',
    marginBottom: Layout.scale(32),
    padding: Layout.scale(24),
    backgroundColor: Colors.card,
    borderRadius: Layout.borderRadius,
    ...Layout.shadow,
  },
  description: {
    color: Colors.text,
    fontSize: Layout.fontScale(16),
    textAlign: 'center',
    marginTop: Layout.scale(16),
    lineHeight: Layout.fontScale(24),
  },
  lockedNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Layout.scale(16),
    gap: Layout.scale(8),
  },
  lockedText: {
    color: Colors.textMuted,
    fontSize: Layout.fontScale(14),
  },
  itemsSection: {
    flex: 1,
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: Layout.fontScale(20),
    fontWeight: 'bold',
    marginBottom: Layout.scale(16),
  },
  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Layout.scale(12),
  },
  itemCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.card,
    padding: Layout.scale(20),
    borderRadius: Layout.borderRadius,
    alignItems: 'center',
    ...Layout.shadow,
  },
  itemLocked: {
    opacity: 0.5,
  },
  itemName: {
    color: Colors.text,
    fontSize: Layout.fontScale(14),
    fontWeight: '600',
    marginTop: Layout.scale(12),
    textAlign: 'center',
  },
  itemNameLocked: {
    color: Colors.textMuted,
  },
  equipmentSlot: {
    backgroundColor: Colors.card,
    borderRadius: Layout.borderRadius,
    padding: Layout.scale(12),
    alignItems: 'center',
    width: Layout.scale(100),
    marginBottom: Layout.scale(8),
    borderWidth: Layout.scale(1),
    borderColor: Colors.border.subtle,
  },
  slotIcon: {
    width: Layout.scale(50),
    height: Layout.scale(50),
    borderRadius: Layout.borderRadiusLarge,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Layout.scale(8),
  },
  slotName: {
    color: Colors.text,
    fontSize: Layout.fontScale(14),
    fontWeight: 'bold',
    marginBottom: Layout.scale(8),
  },
  slotPlaceholder: {
    alignItems: 'center',
    padding: Layout.scale(8),
  },
  slotPlaceholderText: {
    color: Colors.textMuted,
    fontSize: Layout.fontScale(12),
    marginTop: Layout.scale(4),
  },
  raceSection: {
    backgroundColor: Colors.card,
    borderRadius: Layout.borderRadius,
    padding: Layout.scale(16),
    marginBottom: Layout.scale(16),
    ...Layout.shadow,
  },
  raceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.scale(16),
    paddingBottom: Layout.scale(12),
    borderBottomWidth: Layout.scale(1),
    borderBottomColor: Colors.border.subtle,
  },
  raceIcon: {
    width: Layout.scale(56),
    height: Layout.scale(56),
    borderRadius: Layout.borderRadiusLarge,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Layout.scale(12),
  },
  raceInfo: {
    flex: 1,
  },
  raceName: {
    color: Colors.text,
    fontSize: Layout.fontScale(20),
    fontWeight: 'bold',
    marginBottom: Layout.scale(4),
  },
  raceTier: {
    color: Colors.accent,
    fontSize: Layout.fontScale(14),
    fontWeight: '600',
  },
  equipmentLayout: {
    alignItems: 'center',
    paddingVertical: Layout.scale(8),
  },
  equipmentRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Layout.scale(12),
    marginBottom: Layout.scale(12),
  },
  armSlot: {
    width: Layout.scale(100),
  },
});
