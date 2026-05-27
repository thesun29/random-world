import React, { useState, useMemo } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Modal, Pressable, ScrollView } from 'react-native';
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

const EQUIPMENT_LAYOUT = [
   ['head'],
   ['arm_left', 'body', 'arm_right'],
   ['hand_left', '', 'hand_right'],
   ['leg_left', '', 'leg_right'],
   ['foot_left', '', 'foot_right'],
];

const EQUIPMENT_SLOT_INFO: Record<string, { name: string; icon: string }> = {
   head: { name: '头', icon: 'ribbon' },
   body: { name: '身', icon: 'shirt' },
   arm_left: { name: '左臂', icon: 'hand-right' },
   arm_right: { name: '右臂', icon: 'hand-right' },
   hand_left: { name: '左手', icon: 'hand-left' },
   hand_right: { name: '右手', icon: 'hand-left' },
   leg_left: { name: '左腿', icon: 'walk' },
   leg_right: { name: '右腿', icon: 'walk' },
   foot_left: { name: '左足', icon: 'footsteps' },
   foot_right: { name: '右足', icon: 'footsteps' },
};

const EQUIPMENT_ITEMS = [
  // 未开化猿人（ape）装备
  { id: 'ape_head_1', slot: 'head', name: '骨饰头环', rarity: 'common', icon: 'ribbon', race: 'ape' },
  { id: 'ape_head_2', slot: 'head', name: '羽毛冠', rarity: 'rare', icon: 'ribbon', race: 'ape' },
  { id: 'ape_body_1', slot: 'body', name: '兽皮裹身', rarity: 'common', icon: 'shirt', race: 'ape' },
  { id: 'ape_arm_1', slot: 'arm', name: '木盾', rarity: 'common', icon: 'shield', race: 'ape' },
  { id: 'ape_hand_1', slot: 'hand', name: '石制拳套', rarity: 'common', icon: 'hand-left', race: 'ape' },
  { id: 'ape_leg_1', slot: 'leg', name: '皮绳护腿', rarity: 'common', icon: 'walk', race: 'ape' },
  { id: 'ape_foot_1', slot: 'foot', name: '树皮护足', rarity: 'common', icon: 'footsteps', race: 'ape' },
  
  // 部落居民（tribe）装备
  { id: 'tribe_head_1', slot: 'head', name: '精铁头盔', rarity: 'common', icon: 'ribbon', race: 'tribe' },
  { id: 'tribe_head_2', slot: 'head', name: '兽牙冠', rarity: 'rare', icon: 'ribbon', race: 'tribe' },
  { id: 'tribe_body_1', slot: 'body', name: '皮甲', rarity: 'common', icon: 'shirt', race: 'tribe' },
  { id: 'tribe_body_2', slot: 'body', name: '锁子甲', rarity: 'rare', icon: 'shirt', race: 'tribe' },
  { id: 'tribe_arm_1', slot: 'arm', name: '木盾', rarity: 'common', icon: 'shield', race: 'tribe' },
  { id: 'tribe_arm_2', slot: 'arm', name: '铁盾', rarity: 'rare', icon: 'shield', race: 'tribe' },
  { id: 'tribe_hand_1', slot: 'hand', name: '铁拳套', rarity: 'common', icon: 'hand-left', race: 'tribe' },
  { id: 'tribe_hand_2', slot: 'hand', name: '精钢拳套', rarity: 'rare', icon: 'hand-left', race: 'tribe' },
  { id: 'tribe_leg_1', slot: 'leg', name: '护腿', rarity: 'common', icon: 'walk', race: 'tribe' },
  { id: 'tribe_leg_2', slot: 'leg', name: '铁甲护腿', rarity: 'rare', icon: 'walk', race: 'tribe' },
  { id: 'tribe_foot_1', slot: 'foot', name: '布鞋', rarity: 'common', icon: 'footsteps', race: 'tribe' },
  { id: 'tribe_foot_2', slot: 'foot', name: '皮靴', rarity: 'rare', icon: 'footsteps', race: 'tribe' },
  
  // 文明国度（civilization）装备
  { id: 'civ_head_1', slot: 'head', name: '精铁头盔', rarity: 'common', icon: 'ribbon', race: 'civilization' },
  { id: 'civ_head_2', slot: 'head', name: '灵木冠', rarity: 'rare', icon: 'ribbon', race: 'civilization' },
  { id: 'civ_body_1', slot: 'body', name: '皮甲', rarity: 'common', icon: 'shirt', race: 'civilization' },
  { id: 'civ_body_2', slot: 'body', name: '锁子甲', rarity: 'rare', icon: 'shirt', race: 'civilization' },
  { id: 'civ_arm_1', slot: 'arm', name: '木盾', rarity: 'common', icon: 'shield', race: 'civilization' },
  { id: 'civ_arm_2', slot: 'arm', name: '铁盾', rarity: 'rare', icon: 'shield', race: 'civilization' },
  { id: 'civ_hand_1', slot: 'hand', name: '铁拳套', rarity: 'common', icon: 'hand-left', race: 'civilization' },
  { id: 'civ_hand_2', slot: 'hand', name: '精钢拳套', rarity: 'rare', icon: 'hand-left', race: 'civilization' },
  { id: 'civ_leg_1', slot: 'leg', name: '护腿', rarity: 'common', icon: 'walk', race: 'civilization' },
  { id: 'civ_leg_2', slot: 'leg', name: '铁甲护腿', rarity: 'rare', icon: 'walk', race: 'civilization' },
  { id: 'civ_foot_1', slot: 'foot', name: '布鞋', rarity: 'common', icon: 'footsteps', race: 'civilization' },
  { id: 'civ_foot_2', slot: 'foot', name: '皮靴', rarity: 'rare', icon: 'footsteps', race: 'civilization' },
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
          <Ionicons name={info.icon as any} size={Layout.scale(28)} color={Colors.accent} />
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
  const [equippedItems, setEquippedItems] = useState<Record<string, Record<string, string>>>({
    ape: {},
    tribe: {},
    civilization: {},
  });
  const [discoveredEquipment, setDiscoveredEquipment] = useState<Set<string>>(new Set([
    'ape_head_1', 'ape_body_1', 'ape_arm_1', 'ape_hand_1', 'ape_leg_1', 'ape_foot_1',
  ]));
  const [showEquipmentModal, setShowEquipmentModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedRace, setSelectedRace] = useState<string | null>(null);

  const getNewEquipmentCount = (raceId: string, slotBase: string): number => {
    const raceEquipment = EQUIPMENT_ITEMS.filter(item => item.race === raceId && item.slot === slotBase);
    const undiscovered = raceEquipment.filter(item => !discoveredEquipment.has(item.id));
    return undiscovered.length;
  };

  const handleSlotPress = (slotId: string, raceId: string) => {
    setSelectedSlot(slotId);
    setSelectedRace(raceId);
    setShowEquipmentModal(true);
  };

  const handleEquipItem = (itemId: string) => {
    if (!selectedSlot || !selectedRace) return;

    const item = EQUIPMENT_ITEMS.find(i => i.id === itemId);
    if (!item) return;

    // 标记为已发现
    setDiscoveredEquipment(prev => new Set([...prev, itemId]));

    // 找到所有匹配的槽位（包括左右）
    const slotBase = item.slot;
    const matchingSlots = Object.keys(EQUIPMENT_SLOT_INFO).filter(slot => {
      if (slot === slotBase) return true;
      if (slot.startsWith(slotBase + '_')) return true;
      return false;
    });

    const slotsToEquip = matchingSlots.length > 0 ? matchingSlots : [selectedSlot];

    setEquippedItems(prev => {
      const newItems = { ...prev };
      if (!newItems[selectedRace]) {
        newItems[selectedRace] = {};
      }
      slotsToEquip.forEach(slot => {
        newItems[selectedRace][slot] = itemId;
      });
      return newItems;
    });

    setShowEquipmentModal(false);
    setSelectedSlot(null);
    setSelectedRace(null);
  };

  const handleUnequip = () => {
    if (!selectedSlot || !selectedRace) return;

    const equippedItemId = equippedItems[selectedRace]?.[selectedSlot];
    if (equippedItemId) {
      const item = EQUIPMENT_ITEMS.find(i => i.id === equippedItemId);
      if (item) {
        const slotBase = item.slot;
        const matchingSlots = Object.keys(EQUIPMENT_SLOT_INFO).filter(slot => {
          if (slot === slotBase) return true;
          if (slot.startsWith(slotBase + '_')) return true;
          return false;
        });

        setEquippedItems(prev => {
          const newItems = { ...prev };
          if (!newItems[selectedRace]) {
            newItems[selectedRace] = {};
          }
          const slotsToUnequip = matchingSlots.length > 0 ? matchingSlots : [selectedSlot];
          slotsToUnequip.forEach(slot => {
            delete newItems[selectedRace][slot];
          });
          return newItems;
        });
      }
    }

    setShowEquipmentModal(false);
    setSelectedSlot(null);
    setSelectedRace(null);
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'rare': return '#FFD700';
      case 'epic': return '#9400D3';
      case 'legendary': return '#FF4500';
      default: return Colors.accent;
    }
  };

  const renderEquipmentSlot = (slotId: string, raceId: string, isEmpty: boolean = false) => {
    if (isEmpty) {
      return <View key={`${raceId}-${slotId}-empty`} style={styles.emptySlot} />;
    }
    
    const slotInfo = EQUIPMENT_SLOT_INFO[slotId];
    if (!slotInfo) return null;
    
    let slotBase = slotId;
    if (slotId.includes('_left')) {
      slotBase = slotId.replace('_left', '');
    } else if (slotId.includes('_right')) {
      slotBase = slotId.replace('_right', '');
    }
    
    const equippedItemId = equippedItems[raceId]?.[slotId];
    const equippedItem = equippedItemId ? EQUIPMENT_ITEMS.find(item => item.id === equippedItemId) : null;
    const newEquipmentCount = getNewEquipmentCount(raceId, slotBase);
    
    return (
      <TouchableOpacity 
        key={`${raceId}-${slotId}`} 
        style={styles.equipmentSlot}
        onPress={() => handleSlotPress(slotId, raceId)}
      >
        <View style={styles.slotIcon}>
          <Ionicons 
            name={(equippedItem ? equippedItem.icon : slotInfo.icon) as any} 
            size={Layout.scale(18)} 
            color={equippedItem ? getRarityColor(equippedItem.rarity) : Colors.accent} 
          />
        </View>
        <Text style={[styles.slotName, equippedItem && { color: getRarityColor(equippedItem.rarity) }]}>
          {equippedItem ? equippedItem.name : slotInfo.name}
        </Text>
        
        {!equippedItem && (
          <View style={styles.emptySlotOverlay}>
            <Ionicons name={slotInfo.icon as any} size={Layout.scale(14)} color="rgba(255,255,255,0.15)" />
          </View>
        )}
        
        {newEquipmentCount > 0 && (
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>{newEquipmentCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderEquipmentRow = (row: string[], rowIndex: number, raceId: string) => {
    return (
      <View key={`${raceId}-row-${rowIndex}`} style={styles.equipmentRow}>
        {row.map((slotId, index) => renderEquipmentSlot(slotId, raceId, !slotId))}
      </View>
    );
  };

  const availableEquipment = useMemo(() => {
    if (!selectedSlot || !selectedRace) return [];

    let selectedSlotBase = selectedSlot;
    if (selectedSlot.includes('_left')) {
      selectedSlotBase = selectedSlot.replace('_left', '');
    } else if (selectedSlot.includes('_right')) {
      selectedSlotBase = selectedSlot.replace('_right', '');
    }

    return EQUIPMENT_ITEMS.filter(item => {
      return item.race === selectedRace && 
             (item.slot === selectedSlotBase || item.slot === selectedSlot);
    });
  }, [selectedSlot, selectedRace]);

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
          <Ionicons name="construct" size={Layout.scale(28)} color={Colors.accent} />
          <Text style={styles.description}>打造强力装备，提升种族战力</Text>
        </View>

        {unlockedRaces.map((raceId) => {
          const race = getRaceById(raceId);
          if (!race) return null;

          return (
            <View key={raceId} style={styles.raceSection}>
              <View style={styles.raceHeader}>
                <View style={styles.raceIcon}>
                  <Ionicons name="people" size={Layout.scale(22)} color={Colors.accent} />
                </View>
                <View style={styles.raceInfo}>
                  <Text style={styles.raceName}>{race.name}</Text>
                  <Text style={styles.raceTier}>T{race.tier}</Text>
                </View>
              </View>

              <View style={styles.equipmentLayout}>
                {EQUIPMENT_LAYOUT.map((row, index) => renderEquipmentRow(row, index, raceId))}
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
                选择装备 - {selectedRace ? getRaceById(selectedRace)?.name : ''} {selectedSlot ? EQUIPMENT_SLOT_INFO[selectedSlot]?.name : ''}
              </Text>
              <TouchableOpacity onPress={() => setShowEquipmentModal(false)}>
                <Ionicons name="close" size={Layout.scale(24)} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.equipmentList}>
              {availableEquipment.length > 0 ? (
                availableEquipment.map((item) => {
                  const isNew = !discoveredEquipment.has(item.id);
                  return (
                    <TouchableOpacity 
                      key={item.id} 
                      style={styles.equipmentItem}
                      onPress={() => handleEquipItem(item.id)}
                    >
                      <View style={[styles.itemIcon, { backgroundColor: getRarityColor(item.rarity) }]}>
                        <Ionicons name={item.icon as any} size={Layout.scale(24)} color="#FFFFFF" />
                        {isNew && (
                          <View style={styles.itemNewBadge}>
                            <Text style={styles.itemNewBadgeText}>!</Text>
                          </View>
                        )}
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
                  );
                })
              ) : (
                <Text style={styles.noEquipmentText}>暂无可装备物品</Text>
              )}
              
              {selectedRace && selectedSlot && equippedItems[selectedRace]?.[selectedSlot] && (
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
    paddingVertical: Layout.scale(6),
  },
  backButton: {
    padding: Layout.scale(6),
  },
  title: {
    color: Colors.accent,
    fontSize: Layout.fontScale(18),
    fontWeight: 'bold',
  },
  placeholder: {
    width: Layout.scale(36),
  },
  content: {
    flex: 1,
    paddingHorizontal: Layout.padding,
  },
  infoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.scale(10),
    padding: Layout.scale(10),
    backgroundColor: Colors.card,
    borderRadius: Layout.borderRadius,
    gap: Layout.scale(10),
  },
  description: {
    color: Colors.text,
    fontSize: Layout.fontScale(13),
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
    padding: Layout.scale(6),
    marginBottom: Layout.scale(6),
    ...Layout.shadow,
  },
  raceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.scale(6),
    paddingBottom: Layout.scale(4),
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.subtle,
  },
  raceIcon: {
    width: Layout.scale(28),
    height: Layout.scale(28),
    borderRadius: Layout.borderRadiusLarge,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Layout.scale(6),
  },
  raceInfo: {
    flex: 1,
  },
  raceName: {
    color: Colors.text,
    fontSize: Layout.fontScale(12),
    fontWeight: 'bold',
    marginBottom: Layout.scale(1),
  },
  raceTier: {
    color: Colors.accent,
    fontSize: Layout.fontScale(10),
    fontWeight: '600',
  },
  equipmentLayout: {
    alignItems: 'center',
    paddingVertical: Layout.scale(2),
  },
  equipmentRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Layout.scale(2),
  },
  equipmentSlot: {
    width: Layout.scale(48),
    height: Layout.scale(48),
    backgroundColor: Colors.primaryLight,
    borderRadius: Layout.borderRadius,
    padding: Layout.scale(2),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    position: 'relative',
    marginHorizontal: Layout.scale(1),
  },
  emptySlot: {
    width: Layout.scale(48),
    height: Layout.scale(48),
    marginHorizontal: Layout.scale(1),
  },
  slotIcon: {
    width: Layout.scale(20),
    height: Layout.scale(20),
    justifyContent: 'center',
    alignItems: 'center',
  },
  slotName: {
    color: Colors.text,
    fontSize: Layout.fontScale(7),
    fontWeight: '600',
    position: 'absolute',
    bottom: Layout.scale(1),
  },
  emptySlotOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: Layout.borderRadius,
    justifyContent: 'center',
    alignItems: 'center',
  },
  newBadge: {
    position: 'absolute',
    top: -Layout.scale(4),
    right: -Layout.scale(4),
    width: Layout.scale(18),
    height: Layout.scale(18),
    borderRadius: Layout.scale(9),
    backgroundColor: '#FF4D4D',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.background,
  },
  newBadgeText: {
    color: '#FFFFFF',
    fontSize: Layout.fontScale(10),
    fontWeight: 'bold',
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
    fontSize: Layout.fontScale(16),
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
    position: 'relative',
  },
  itemNewBadge: {
    position: 'absolute',
    top: -Layout.scale(2),
    right: -Layout.scale(2),
    width: Layout.scale(14),
    height: Layout.scale(14),
    borderRadius: Layout.scale(7),
    backgroundColor: '#FF4D4D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemNewBadgeText: {
    color: '#FFFFFF',
    fontSize: Layout.fontScale(10),
    fontWeight: 'bold',
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
  noEquipmentText: {
    color: Colors.textMuted,
    fontSize: Layout.fontScale(14),
    textAlign: 'center',
    paddingVertical: Layout.scale(20),
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
