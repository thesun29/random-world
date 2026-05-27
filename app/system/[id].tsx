import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Modal, Pressable } from 'react-native';
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
  { id: 'head', name: '头', icon: 'ribbon' },
  { id: 'body', name: '身', icon: 'shirt' },
  { id: 'arm_left', name: '左臂', icon: 'hand-right' },
  { id: 'arm_right', name: '右臂', icon: 'hand-right' },
  { id: 'hand_left', name: '左手', icon: 'hand-left' },
  { id: 'hand_right', name: '右手', icon: 'hand-left' },
  { id: 'leg_left', name: '左腿', icon: 'walk' },
  { id: 'leg_right', name: '右腿', icon: 'walk' },
  { id: 'foot_left', name: '左足', icon: 'footsteps' },
  { id: 'foot_right', name: '右足', icon: 'footsteps' },
];

const EQUIPMENT_ITEMS = [
  { id: 'head_1', slot: 'head', name: '精铁头盔', rarity: 'common', icon: 'ribbon' },
  { id: 'head_2', slot: 'head', name: '灵木冠', rarity: 'rare', icon: 'ribbon' },
  { id: 'body_1', slot: 'body', name: '皮甲', rarity: 'common', icon: 'shirt' },
  { id: 'body_2', slot: 'body', name: '锁子甲', rarity: 'rare', icon: 'shirt' },
  { id: 'arm_left_1', slot: 'arm_left', name: '木盾', rarity: 'common', icon: 'hand-right' },
  { id: 'hand_left_1', slot: 'hand_left', name: '铁拳套', rarity: 'common', icon: 'hand-left' },
  { id: 'leg_1', slot: 'leg_left', name: '护腿', rarity: 'common', icon: 'walk' },
  { id: 'foot_1', slot: 'foot_left', name: '布鞋', rarity: 'common', icon: 'footsteps' },
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
  const [equippedItems, setEquippedItems] = useState<Record<string, string>>({});
  const [showEquipmentModal, setShowEquipmentModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const handleSlotPress = (slotId: string) => {
    setSelectedSlot(slotId);
    setShowEquipmentModal(true);
  };

  const handleEquipItem = (itemId: string) => {
    if (selectedSlot) {
      setEquippedItems(prev => ({
        ...prev,
        [selectedSlot]: itemId
      }));
      setShowEquipmentModal(false);
      setSelectedSlot(null);
    }
  };

  const handleUnequip = () => {
    if (selectedSlot) {
      setEquippedItems(prev => {
        const newItems = { ...prev };
        delete newItems[selectedSlot];
        return newItems;
      });
      setShowEquipmentModal(false);
      setSelectedSlot(null);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'rare': return '#FFD700';
      case 'epic': return '#9400D3';
      case 'legendary': return '#FF4500';
      default: return Colors.accent;
    }
  };

  const renderEquipmentSlot = (slot: typeof EQUIPMENT_SLOTS[0]) => {
    const equippedItemId = equippedItems[slot.id];
    const equippedItem = equippedItemId ? EQUIPMENT_ITEMS.find(item => item.id === equippedItemId) : null;
    
    return (
      <TouchableOpacity 
        key={slot.id} 
        style={styles.equipmentSlot}
        onPress={() => handleSlotPress(slot.id)}
      >
        <View style={styles.slotIcon}>
          <Ionicons 
            name={slot.icon as any} 
            size={Layout.scale(32)} 
            color={Colors.accent} 
          />
        </View>
        <Text style={styles.slotName}>{slot.name}</Text>
        
        {equippedItem ? (
          <View style={[styles.equippedBadge, { backgroundColor: getRarityColor(equippedItem.rarity) }]}>
            <Ionicons name={equippedItem.icon as any} size={Layout.scale(20)} color="#FFFFFF" />
          </View>
        ) : (
          <View style={styles.emptySlotOverlay}>
            <Ionicons name={slot.icon as any} size={Layout.scale(24)} color="rgba(255,255,255,0.2)" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <ScalableView>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={Layout.scale(24)} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>装备</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <View style={styles.infoSection}>
          <Ionicons name="construct" size={Layout.scale(32)} color={Colors.accent} />
          <Text style={styles.description}>打造强力装备，提升种族战力</Text>
        </View>

        {unlockedRaces.map((raceId) => {
          const race = getRaceById(raceId);
          if (!race) return null;

          return (
            <View key={raceId} style={styles.raceSection}>
              <View style={styles.raceHeader}>
                <View style={styles.raceIcon}>
                  <Ionicons name="people" size={Layout.scale(24)} color={Colors.accent} />
                </View>
                <View style={styles.raceInfo}>
                  <Text style={styles.raceName}>{race.name}</Text>
                  <Text style={styles.raceTier}>T{race.tier}</Text>
                </View>
              </View>

              <View style={styles.equipmentGrid}>
                {EQUIPMENT_SLOTS.map(renderEquipmentSlot)}
              </View>
            </View>
          );
        })}
      </View>

      {/* 装备选择弹窗 */}
      <Modal
        visible={showEquipmentModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowEquipmentModal(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowEquipmentModal(false)}>
          <Pressable style={styles.modalContent} onPress={() => {}}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                选择装备 - {selectedSlot ? EQUIPMENT_SLOTS.find(s => s.id === selectedSlot)?.name : ''}
              </Text>
              <TouchableOpacity onPress={() => setShowEquipmentModal(false)}>
                <Ionicons name="close" size={Layout.scale(24)} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.equipmentList}>
              {EQUIPMENT_ITEMS
                .filter(item => item.slot === selectedSlot?.replace('_left', '').replace('_right', ''))
                .map((item) => (
                  <TouchableOpacity 
                    key={item.id} 
                    style={styles.equipmentItem}
                    onPress={() => handleEquipItem(item.id)}
                  >
                    <View style={[styles.itemIcon, { backgroundColor: getRarityColor(item.rarity) }]}>
                      <Ionicons name={item.icon as any} size={Layout.scale(24)} color="#FFFFFF" />
                    </View>
                    <View style={styles.itemInfo}>
                      <Text style={[styles.itemName, { color: getRarityColor(item.rarity) }]}>
                        {item.name}
                      </Text>
                      <Text style={styles.itemRarity}>
                        {item.rarity === 'common' ? '普通' : item.rarity === 'rare' ? '稀有' : item.rarity === 'epic' ? '史诗' : '传说'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              
              {equippedItems[selectedSlot || ''] && (
                <TouchableOpacity 
                  style={styles.unequipButton}
                  onPress={handleUnequip}
                >
                  <Ionicons name="trash-outline" size={Layout.scale(24)} color="#FF4D4D" />
                  <Text style={styles.unequipText}>卸下装备</Text>
                </TouchableOpacity>
              )}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
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
    paddingVertical: Layout.scale(8),
  },
  backButton: {
    padding: Layout.scale(8),
  },
  title: {
    color: Colors.accent,
    fontSize: Layout.fontScale(20),
    fontWeight: 'bold',
  },
  placeholder: {
    width: Layout.scale(40),
  },
  content: {
    flex: 1,
    paddingHorizontal: Layout.padding,
  },
  infoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.scale(12),
    padding: Layout.scale(12),
    backgroundColor: Colors.card,
    borderRadius: Layout.borderRadius,
    gap: Layout.scale(12),
  },
  description: {
    color: Colors.text,
    fontSize: Layout.fontScale(14),
    flex: 1,
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
    fontSize: Layout.fontScale(18),
    fontWeight: 'bold',
    marginBottom: Layout.scale(12),
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
  
  // 装备页面样式
  raceSection: {
    backgroundColor: Colors.card,
    borderRadius: Layout.borderRadius,
    padding: Layout.scale(12),
    marginBottom: Layout.scale(12),
    ...Layout.shadow,
  },
  raceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.scale(12),
    paddingBottom: Layout.scale(8),
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.subtle,
  },
  raceIcon: {
    width: Layout.scale(44),
    height: Layout.scale(44),
    borderRadius: Layout.borderRadiusLarge,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Layout.scale(10),
  },
  raceInfo: {
    flex: 1,
  },
  raceName: {
    color: Colors.text,
    fontSize: Layout.fontScale(16),
    fontWeight: 'bold',
    marginBottom: Layout.scale(2),
  },
  raceTier: {
    color: Colors.accent,
    fontSize: Layout.fontScale(12),
    fontWeight: '600',
  },
  equipmentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: Layout.scale(8),
  },
  equipmentSlot: {
    width: Layout.scale(80),
    height: Layout.scale(80),
    backgroundColor: Colors.primaryLight,
    borderRadius: Layout.borderRadius,
    padding: Layout.scale(6),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.border.subtle,
    position: 'relative',
  },
  slotIcon: {
    width: Layout.scale(36),
    height: Layout.scale(36),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Layout.scale(2),
  },
  slotName: {
    color: Colors.text,
    fontSize: Layout.fontScale(11),
    fontWeight: '600',
    position: 'absolute',
    bottom: Layout.scale(4),
  },
  emptySlotOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: Layout.borderRadius,
    justifyContent: 'center',
    alignItems: 'center',
  },
  equippedBadge: {
    position: 'absolute',
    top: -Layout.scale(6),
    right: -Layout.scale(6),
    width: Layout.scale(24),
    height: Layout.scale(24),
    borderRadius: Layout.scale(12),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.background,
  },
  slotPlaceholder: {
    alignItems: 'center',
    padding: Layout.scale(8),
  },
  slotPlaceholderText: {
    color: Colors.textMuted,
    fontSize: Layout.fontScale(11),
    marginTop: Layout.scale(4),
  },
  armSlot: {
    width: Layout.scale(80),
  },
  
  // 弹窗样式
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.backgroundLight,
    borderTopLeftRadius: Layout.borderRadiusXLarge,
    borderTopRightRadius: Layout.borderRadiusXLarge,
    padding: Layout.scale(20),
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.scale(16),
    paddingBottom: Layout.scale(12),
    borderBottomWidth: 2,
    borderBottomColor: Colors.accent,
  },
  modalTitle: {
    color: Colors.accent,
    fontSize: Layout.fontScale(18),
    fontWeight: 'bold',
  },
  equipmentList: {
    gap: Layout.scale(8),
  },
  equipmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: Layout.borderRadius,
    padding: Layout.scale(12),
    gap: Layout.scale(12),
    borderWidth: 1,
    borderColor: Colors.border.subtle,
  },
  itemIcon: {
    width: Layout.scale(48),
    height: Layout.scale(48),
    borderRadius: Layout.borderRadius,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: Layout.fontScale(16),
    fontWeight: 'bold',
    marginBottom: Layout.scale(4),
  },
  itemRarity: {
    color: Colors.textSecondary,
    fontSize: Layout.fontScale(12),
  },
  unequipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.card,
    borderRadius: Layout.borderRadius,
    padding: Layout.scale(14),
    gap: Layout.scale(8),
    marginTop: Layout.scale(8),
    borderWidth: 1,
    borderColor: '#FF4D4D',
  },
  unequipText: {
    color: '#FF4D4D',
    fontSize: Layout.fontScale(14),
    fontWeight: '600',
  },
});
