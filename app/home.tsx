import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Modal, Pressable, ActivityIndicator, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useGameStore } from '@/store/useGameStore';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import ScalableView from '@/components/ScalableView';
import GufengIcon from '@/components/GufengIcons';
import { getRaceById, RACES } from '@/utils/races';

// 左侧系统菜单
const leftMenuItems = [
  { id: 'essence', name: '精华', icon: 'flame' },
  { id: 'dishes', name: '菜品', icon: 'restaurant' },
  { id: 'secrets', name: '秘术', icon: 'sparkles' },
  { id: 'beasts', name: '异兽', icon: 'paw' },
  { id: 'equipment', name: '装备', icon: 'construct' },
  { id: 'building', name: '修建', icon: 'hammer' },
  { id: 'empire', name: '帝名', icon: 'crown' },
];

// 底部功能菜单
const bottomMenuItems = [
  { id: 'explore', name: '探索世界', icon: 'map', badge: '2/2' },
  { id: 'race', name: '人族', icon: 'people', hasNotification: true },
  { id: 'mother', name: '母神', icon: 'flower' },
  { id: 'treasure', name: '宝物', icon: 'cube' },
  { id: 'fate', name: '命运推演', icon: 'compass', badge: '第29次' },
];

export default function HomeScreen() {
  const { player, loadSavedPlayer } = useGameStore();
  const [showPopulationModal, setShowPopulationModal] = useState(false);
  const [showStrengthModal, setShowStrengthModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMenu, setSelectedMenu] = useState<string | null>(null);
  const [showSubMenu, setShowSubMenu] = useState(false);

  useEffect(() => {
    const initPlayer = async () => {
      if (!player) {
        await loadSavedPlayer();
      }
      setIsLoading(false);
    };
    initPlayer();
  }, []);

  const handleStartExploration = () => {
    useGameStore.getState().startNewRun();
    router.push('/explore');
  };

  const handleLeftMenuPress = (itemId: string) => {
    setSelectedMenu(itemId);
    if (['essence', 'dishes', 'secrets', 'beasts', 'equipment', 'building', 'empire'].includes(itemId)) {
      router.push(`/system/${itemId}`);
    }
  };

  const handleBottomMenuPress = (itemId: string) => {
    if (itemId === 'explore') {
      handleStartExploration();
    } else if (itemId === 'race' && player) {
      router.push(`/race/${player.worldData.unlockedRaces[player.worldData.unlockedRaces.length - 1]}`);
    }
  };

  if (isLoading || !player) {
    return (
      <ScalableView>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.accent} />
          <Text style={styles.loadingText}>加载中...</Text>
        </View>
      </ScalableView>
    );
  }

  const currentRace = getRaceById(player.worldData.unlockedRaces[player.worldData.unlockedRaces.length - 1]);

  const getAllRacesWithPopulation = () => {
    return Object.entries(player.worldData.racePopulations ?? {}).map(([raceId, population]) => {
      const race = RACES[raceId];
      return {
        id: raceId,
        name: race?.name || '未知种族',
        tier: race?.tier || 0,
        population: population,
      };
    }).sort((a, b) => a.tier - b.tier);
  };

  const allRaces = getAllRacesWithPopulation();
  const totalPopulation = Object.values(player.worldData.racePopulations ?? {}).reduce((sum, pop) => sum + pop, 0);

  const calculateRaceStrength = (raceId: string, population: number): number => {
    const race = RACES[raceId];
    if (!race) return 0;
    let strength = race.baseStrength * population;
    race.equipmentSlots.forEach(slot => {
      if (slot.unlocked) {
        strength += slot.strengthBonus * population;
      }
    });
    strength *= race.strengthMultiplier;
    return Math.floor(strength);
  };

  const getAllRacesWithStrength = () => {
    return allRaces.map(race => {
      const strength = calculateRaceStrength(race.id, race.population);
      return {
        ...race,
        strength,
      };
    });
  };

  const totalStrength = getAllRacesWithStrength().reduce((sum, race) => sum + race.strength, 0);

  return (
    <ScalableView centered={false}>
      {/* 背景层 */}
      <View style={styles.backgroundLayer} />
      
      {/* 顶部横向资源栏 */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.topBarItem}>
          <View style={[styles.topBarIcon, { backgroundColor: '#8B7355' }]}>
            <GufengIcon name="stone" size={Layout.scale(14)} />
          </View>
          <Text style={styles.topBarLabel}>石头</Text>
          <Text style={styles.topBarValue}>{player.worldData.resources?.stone || 0}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.topBarItem}>
          <View style={[styles.topBarIcon, { backgroundColor: '#A0522D' }]}>
            <GufengIcon name="wood" size={Layout.scale(14)} />
          </View>
          <Text style={styles.topBarLabel}>木材</Text>
          <Text style={styles.topBarValue}>{player.worldData.resources?.wood || 0}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.topBarItem}>
          <View style={[styles.topBarIcon, { backgroundColor: '#228B22' }]}>
            <GufengIcon name="herb" size={Layout.scale(14)} />
          </View>
          <Text style={styles.topBarLabel}>草药</Text>
          <Text style={styles.topBarValue}>0</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.topBarItem}>
          <View style={[styles.topBarIcon, { backgroundColor: '#4682B4' }]}>
            <GufengIcon name="water" size={Layout.scale(14)} />
          </View>
          <Text style={styles.topBarLabel}>水</Text>
          <Text style={styles.topBarValue}>{player.worldData.resources?.water || 0}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.topBarItem}>
          <View style={[styles.topBarIcon, { backgroundColor: '#DAA520' }]}>
            <GufengIcon name="food" size={Layout.scale(14)} />
          </View>
          <Text style={styles.topBarLabel}>食物</Text>
          <Text style={styles.topBarValue}>{player.worldData.resources?.food || 0}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.topBarItem} onPress={() => setShowPopulationModal(true)}>
          <View style={[styles.topBarIcon, { backgroundColor: '#8B0000' }]}>
            <GufengIcon name="people" size={Layout.scale(14)} />
          </View>
          <Text style={styles.topBarLabel}>人口</Text>
          <Text style={styles.topBarValue}>{totalPopulation}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.topBarItem} onPress={() => setShowStrengthModal(true)}>
          <View style={[styles.topBarIcon, { backgroundColor: '#CD5C5C' }]}>
            <GufengIcon name="shield" size={Layout.scale(14)} />
          </View>
          <Text style={styles.topBarLabel}>战力</Text>
          <Text style={styles.topBarValue}>{totalStrength}</Text>
        </TouchableOpacity>

        {/* 快捷按钮 */}
        <View style={styles.topBarQuickButtons}>
          <TouchableOpacity style={styles.topBarQuickButton}>
            <GufengIcon name="settings" size={Layout.scale(16)} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.topBarQuickButton}>
            <GufengIcon name="mail" size={Layout.scale(16)} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.topBarQuickButton}>
            <GufengIcon name="book" size={Layout.scale(16)} />
          </TouchableOpacity>
        </View>
      </View>

      {/* 主内容区域 */}
      <View style={styles.mainContent}>
        {/* 左侧菜单 */}
        <View style={styles.leftMenu}>
          {/* 子菜单 - 点击志录后显示 */}
          {showSubMenu && (
            <View style={styles.subMenuContainer}>
              <ScrollView style={styles.subMenuScroll} showsVerticalScrollIndicator={false}>
                {leftMenuItems.map((item, index) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.subMenuItem, selectedMenu === item.id && styles.subMenuItemSelected]}
                    onPress={() => handleLeftMenuPress(item.id)}
                  >
                    <GufengIcon name={item.icon as any} size={Layout.scale(16)} />
                    <Text style={[styles.subMenuText, selectedMenu === item.id && styles.subMenuTextSelected]}>
                      {item.name}
                    </Text>
                    {(item.id === 'equipment' || item.id === 'building') && (
                      <View style={styles.subMenuNotification} />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
          
          {/* 从下到上的主按钮 */}
          <View style={styles.leftButtonsContainer}>
            {/* 副本按钮 */}
            <TouchableOpacity style={styles.leftButton}>
              <View style={styles.leftButtonIcon}>
                <GufengIcon name="sword" size={Layout.scale(20)} />
              </View>
              <Text style={styles.leftButtonText}>副本</Text>
            </TouchableOpacity>
            
            {/* 种族按钮 */}
            <TouchableOpacity 
              style={styles.leftButton} 
              onPress={() => router.push(`/race/${player.worldData.unlockedRaces[player.worldData.unlockedRaces.length - 1]}`)}
            >
              <View style={styles.leftButtonIcon}>
                <GufengIcon name="people" size={Layout.scale(20)} />
              </View>
              <Text style={styles.leftButtonText}>种族</Text>
              <View style={styles.leftButtonNotification} />
            </TouchableOpacity>
            
            {/* 志录按钮 */}
            <TouchableOpacity 
              style={styles.leftButton} 
              onPress={() => setShowSubMenu(!showSubMenu)}
            >
              <View style={styles.leftButtonIcon}>
                <GufengIcon name="book" size={Layout.scale(20)} />
              </View>
              <Text style={styles.leftButtonText}>志录</Text>
              <View style={styles.leftButtonNotification} />
            </TouchableOpacity>
          </View>
        </View>

        {/* 中央区域 */}
        <View style={styles.centerArea}>
          {/* 地图/场景区域 */}
          <View style={styles.mapArea}>
            <View style={styles.mapPlaceholder}>
              <Text style={styles.mapPlaceholderText}>世界地图</Text>
            </View>
          </View>
          
          {/* 右下角一键收集 */}
          <View style={styles.collectButtonArea}>
            <TouchableOpacity style={styles.collectButton}>
              <Text style={styles.collectButtonText}>一键收集</Text>
            </TouchableOpacity>
            <Text style={styles.collectInfo}>剩余0次</Text>
          </View>
        </View>
      </View>

      {/* 底部菜单 */}
      <View style={styles.bottomMenu}>
        {bottomMenuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.bottomMenuItem}
            onPress={() => handleBottomMenuPress(item.id)}
          >
            <View style={styles.bottomMenuIcon}>
              <GufengIcon name={item.icon as any} size={Layout.scale(22)} />
            </View>
            <Text style={styles.bottomMenuText}>{item.name}</Text>
            {item.badge && (
              <Text style={styles.bottomMenuBadge}>{item.badge}</Text>
            )}
            {item.hasNotification && (
              <View style={styles.bottomNotification} />
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* 人口模态框 */}
      <Modal
        visible={showPopulationModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowPopulationModal(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowPopulationModal(false)}>
          <Pressable style={styles.modalContent} onPress={() => {}}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>人口分布</Text>
              <TouchableOpacity onPress={() => setShowPopulationModal(false)}>
                <Text style={{ fontSize: Layout.scale(20), color: Colors.text, fontWeight: 'bold' }}>×</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.totalPopulationContainer}>
              <Text style={styles.totalPopulationLabel}>总人口</Text>
              <Text style={styles.totalPopulationValue}>{totalPopulation}</Text>
            </View>
            <View style={styles.modalList}>
              {allRaces.map((race) => (
                <View key={race.id} style={styles.modalListItem}>
                  <View style={styles.modalListItemInfo}>
                    <Text style={styles.modalListItemName}>{race.name}</Text>
                    <View style={styles.tierBadge}>
                      <Text style={styles.tierText}>T{race.tier}</Text>
                    </View>
                  </View>
                  <View style={styles.modalListItemValue}>
                    <Text style={styles.modalListItemNumber}>{race.population}</Text>
                    <Text style={styles.modalListItemUnit}>人</Text>
                  </View>
                </View>
              ))}
              {(player.worldData.unlockedTribes ?? []).length > 0 && (
                <View style={styles.tribesSection}>
                  <View style={styles.tribesSectionHeader}>
                    <GufengIcon name="people" size={Layout.scale(14)} />
                    <Text style={styles.tribesSectionTitle}>附属部落</Text>
                  </View>
                  {(player.worldData.unlockedTribes ?? []).map((tribe, index) => (
                    <View key={tribe.id || index} style={styles.modalListItem}>
                      <View style={styles.modalListItemInfo}>
                        <Text style={styles.modalListItemName}>{tribe.name}</Text>
                        <View style={styles.tribeStatusBadge}>
                          <Text style={styles.tribeStatusText}>
                            {tribe.status === 'merged' ? '合并' : tribe.status === 'vassal' ? '附庸' : '敌对'}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.modalListItemValue}>
                        <Text style={styles.modalListItemNumber}>{tribe.population}</Text>
                        <Text style={styles.modalListItemUnit}>人</Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* 战力模态框 */}
      <Modal
        visible={showStrengthModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowStrengthModal(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowStrengthModal(false)}>
          <Pressable style={styles.modalContent} onPress={() => {}}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>战力构成</Text>
              <TouchableOpacity onPress={() => setShowStrengthModal(false)}>
                <Text style={{ fontSize: Layout.scale(20), color: Colors.text, fontWeight: 'bold' }}>×</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.totalPopulationContainer}>
              <Text style={styles.totalPopulationLabel}>总战力</Text>
              <Text style={styles.totalPopulationValue}>{totalStrength}</Text>
            </View>
            <View style={styles.modalList}>
              {getAllRacesWithStrength().map((race) => {
                const raceInfo = RACES[race.id];
                return (
                  <View key={race.id} style={styles.modalListItem}>
                    <View style={styles.modalListItemInfo}>
                      <Text style={styles.modalListItemName}>{race.name}</Text>
                      <View style={styles.tierBadge}>
                        <Text style={styles.tierText}>T{race.tier}</Text>
                      </View>
                      <View style={styles.strengthBreakdown}>
                        <Text style={styles.strengthBreakdownText}>
                          {race.population}人 × {raceInfo?.baseStrength ?? 0}基础
                          {raceInfo?.equipmentSlots.filter((s: any) => s.unlocked).reduce((sum: number, s: any) => sum + s.strengthBonus, 0) > 0 && 
                            ` + ${raceInfo?.equipmentSlots.filter((s: any) => s.unlocked).reduce((sum: number, s: any) => sum + s.strengthBonus, 0)}装备`
                          } 
                          × {raceInfo?.strengthMultiplier ?? 1}乘数
                        </Text>
                      </View>
                    </View>
                    <View style={styles.modalListItemValue}>
                      <Text style={styles.modalListItemNumber}>{race.strength}</Text>
                      <Text style={styles.modalListItemUnit}>战力</Text>
                    </View>
                  </View>
                );
              })}
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
    position: 'relative',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Layout.scale(16),
  },
  loadingText: {
    color: Colors.text,
    fontSize: Layout.scale(16),
  },
  backgroundLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundLight,
    paddingVertical: Layout.scale(6),
    borderBottomWidth: 3,
    borderBottomColor: Colors.accent,
  },
  topBarItem: {
    flex: 1,
    alignItems: 'center',
    minWidth: 0,
  },
  topBarIcon: {
    width: Layout.scale(24),
    height: Layout.scale(24),
    borderRadius: Layout.scale(4),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Layout.scale(2),
    borderWidth: 1,
    borderColor: Colors.border.subtle,
  },
  topBarLabel: {
    color: Colors.textSecondary,
    fontSize: Layout.scale(8),
    textAlign: 'center',
    marginBottom: Layout.scale(1),
  },
  topBarValue: {
    color: Colors.text,
    fontSize: Layout.scale(10),
    fontWeight: 'bold',
    textAlign: 'center',
  },
  topBarQuickButtons: {
    flexDirection: 'row',
    marginLeft: 'auto',
    gap: Layout.scale(4),
    paddingRight: Layout.scale(4),
  },
  topBarQuickButton: {
    width: Layout.scale(30),
    height: Layout.scale(30),
    borderRadius: Layout.scale(4),
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border.subtle,
  },
  mainContent: {
    flex: 1,
    flexDirection: 'row',
    marginBottom: Layout.scale(4),
  },
  leftMenu: {
    width: '30%',
    justifyContent: 'flex-end',
    paddingRight: Layout.scale(6),
  },
  subMenuContainer: {
    backgroundColor: Colors.card,
    borderRadius: Layout.borderRadius,
    paddingHorizontal: Layout.scale(6),
    paddingVertical: Layout.scale(4),
    marginBottom: Layout.scale(6),
    marginRight: Layout.scale(6),
    borderWidth: 2,
    borderColor: Colors.accent,
    maxHeight: Layout.scale(280),
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  subMenuScroll: {
    maxHeight: Layout.scale(270),
  },
  subMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Layout.scale(6),
    paddingHorizontal: Layout.scale(6),
    marginVertical: Layout.scale(2),
    borderRadius: Layout.borderRadiusSmall,
    position: 'relative',
  },
  subMenuItemSelected: {
    backgroundColor: Colors.accent,
  },
  subMenuText: {
    color: Colors.accent,
    fontSize: Layout.scale(11),
    fontWeight: 'bold',
    marginLeft: Layout.scale(6),
    flex: 1,
  },
  subMenuTextSelected: {
    color: Colors.primaryDark,
  },
  subMenuNotification: {
    width: Layout.scale(6),
    height: Layout.scale(6),
    borderRadius: Layout.scale(1),
    backgroundColor: Colors.danger,
    position: 'absolute',
    top: Layout.scale(4),
    right: Layout.scale(4),
  },
  leftButtonsContainer: {
    gap: Layout.scale(6),
  },
  leftButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: Layout.borderRadius,
    paddingVertical: Layout.scale(10),
    paddingHorizontal: Layout.scale(12),
    borderWidth: 2,
    borderColor: Colors.border.subtle,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  leftButtonIcon: {
    width: Layout.scale(34),
    height: Layout.scale(34),
    borderRadius: Layout.scale(4),
    backgroundColor: Colors.backgroundLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Layout.scale(8),
    borderWidth: 1,
    borderColor: Colors.border.subtle,
  },
  leftButtonText: {
    color: Colors.accent,
    fontSize: Layout.scale(14),
    fontWeight: 'bold',
    flex: 1,
  },
  leftButtonNotification: {
    width: Layout.scale(8),
    height: Layout.scale(8),
    borderRadius: Layout.scale(1),
    backgroundColor: Colors.danger,
    position: 'absolute',
    top: Layout.scale(6),
    right: Layout.scale(6),
  },
  centerArea: {
    flex: 1,
    position: 'relative',
  },
  mapArea: {
    flex: 1,
    backgroundColor: Colors.backgroundLight,
    borderRadius: Layout.borderRadiusLarge,
    borderWidth: 3,
    borderColor: Colors.border.subtle,
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPlaceholderText: {
    color: Colors.textSecondary,
    fontSize: Layout.scale(16),
  },
  collectButtonArea: {
    position: 'absolute',
    bottom: Layout.scale(12),
    right: Layout.scale(12),
    alignItems: 'center',
  },
  collectButton: {
    backgroundColor: Colors.card,
    borderRadius: Layout.borderRadius,
    paddingVertical: Layout.scale(10),
    paddingHorizontal: Layout.scale(16),
    borderWidth: 2,
    borderColor: Colors.accent,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  collectButtonText: {
    color: Colors.accent,
    fontSize: Layout.scale(14),
    fontWeight: 'bold',
  },
  collectInfo: {
    color: Colors.text,
    fontSize: Layout.scale(10),
    marginTop: Layout.scale(4),
    backgroundColor: Colors.overlay.medium,
    paddingHorizontal: Layout.scale(8),
    paddingVertical: Layout.scale(2),
    borderRadius: Layout.borderRadiusSmall,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
  },

  bottomMenu: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundLight,
    paddingVertical: Layout.scale(6),
    paddingHorizontal: Layout.scale(4),
    borderTopWidth: 3,
    borderTopColor: Colors.accent,
  },
  bottomMenuItem: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
  },
  bottomMenuIcon: {
    width: Layout.scale(32),
    height: Layout.scale(32),
    borderRadius: Layout.scale(4),
    backgroundColor: Colors.backgroundLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Layout.scale(2),
    borderWidth: 1,
    borderColor: Colors.border.subtle,
  },
  bottomMenuBadge: {
    position: 'absolute',
    top: 0,
    color: Colors.text,
    fontSize: Layout.scale(9),
    fontWeight: '600',
  },
  bottomMenuText: {
    color: Colors.accent,
    fontSize: Layout.scale(10),
    fontWeight: 'bold',
    textAlign: 'center',
  },
  bottomNotification: {
    width: Layout.scale(8),
    height: Layout.scale(8),
    borderRadius: Layout.scale(1),
    backgroundColor: Colors.danger,
    position: 'absolute',
    top: 0,
    right: Layout.scale(5),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay.medium,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Layout.scale(16),
  },
  modalContent: {
    backgroundColor: Colors.card,
    borderRadius: Layout.borderRadiusLarge,
    padding: Layout.scale(20),
    width: '100%',
    maxHeight: '75%',
    borderWidth: 3,
    borderColor: Colors.accent,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.scale(16),
    paddingBottom: Layout.scale(8),
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.subtle,
  },
  modalTitle: {
    color: Colors.accent,
    fontSize: Layout.scale(20),
    fontWeight: 'bold',
  },
  totalPopulationContainer: {
    alignItems: 'center',
    marginBottom: Layout.scale(16),
    padding: Layout.scale(16),
    backgroundColor: Colors.backgroundLight,
    borderRadius: Layout.borderRadius,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
  },
  totalPopulationLabel: {
    color: Colors.textSecondary,
    fontSize: Layout.scale(12),
    marginBottom: Layout.scale(6),
  },
  totalPopulationValue: {
    color: Colors.accent,
    fontSize: Layout.scale(28),
    fontWeight: 'bold',
  },
  modalList: {
    maxHeight: Layout.scale(240),
  },
  modalListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.card,
    padding: Layout.scale(12),
    borderRadius: Layout.borderRadius,
    marginBottom: Layout.scale(8),
    borderLeftWidth: 3,
    borderLeftColor: Colors.accent,
  },
  modalListItemInfo: {
    flex: 1,
  },
  modalListItemName: {
    color: Colors.text,
    fontSize: Layout.scale(14),
    fontWeight: '600',
    marginBottom: Layout.scale(2),
  },
  modalListItemValue: {
    alignItems: 'center',
    marginLeft: Layout.scale(12),
  },
  modalListItemNumber: {
    color: Colors.accent,
    fontSize: Layout.scale(20),
    fontWeight: 'bold',
  },
  modalListItemUnit: {
    color: Colors.textSecondary,
    fontSize: Layout.scale(12),
  },
  tierBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Layout.scale(8),
    paddingVertical: Layout.scale(1),
    borderRadius: Layout.borderRadiusSmall,
    alignSelf: 'flex-start',
  },
  tierText: {
    color: Colors.accent,
    fontSize: Layout.scale(10),
    fontWeight: 'bold',
  },
  tribeStatusBadge: {
    backgroundColor: Colors.card,
    paddingHorizontal: Layout.scale(6),
    paddingVertical: Layout.scale(1),
    borderRadius: Layout.borderRadiusSmall,
    alignSelf: 'flex-start',
    marginTop: Layout.scale(2),
  },
  tribeStatusText: {
    color: Colors.accent,
    fontSize: Layout.scale(9),
    fontWeight: '600',
  },
  strengthBreakdown: {
    marginTop: Layout.scale(4),
  },
  strengthBreakdownText: {
    color: Colors.textSecondary,
    fontSize: Layout.scale(10),
  },
  tribesSection: {
    marginTop: Layout.scale(12),
    paddingTop: Layout.scale(12),
    borderTopWidth: 1,
    borderTopColor: Colors.border.subtle,
  },
  tribesSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.scale(6),
    marginBottom: Layout.scale(10),
  },
  tribesSectionTitle: {
    color: Colors.accent,
    fontSize: Layout.scale(14),
    fontWeight: 'bold',
  },
});
