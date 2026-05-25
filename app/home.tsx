import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, SafeAreaView, Modal, Pressable, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useGameStore } from '@/store/useGameStore';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import { getRaceById, RACES } from '@/utils/races';

// 左侧系统菜单
const leftMenuItems = [
  { id: 'materials', name: '材料', icon: 'nutrition' },
  { id: 'essence', name: '精华', icon: 'flame' },
  { id: 'dishes', name: '菜品', icon: 'restaurant' },
  { id: 'secrets', name: '秘术', icon: 'sparkles' },
  { id: 'beasts', name: '异兽', icon: 'paw' },
  { id: 'weapons', name: '神兵', icon: 'shield' },
  { id: 'building', name: '修建', icon: 'construct' },
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
    if (itemId === 'race') {
      router.push(`/race/${player?.worldData.unlockedRaces[player.worldData.unlockedRaces.length - 1]}`);
    } else if (['dishes', 'secrets', 'beasts', 'weapons', 'building', 'empire'].includes(itemId)) {
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
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.accent} />
          <Text style={styles.loadingText}>加载中...</Text>
        </View>
      </SafeAreaView>
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
    <SafeAreaView style={styles.container}>
      {/* 背景层 */}
      <View style={styles.backgroundLayer} />
      
      {/* 顶部横向资源栏 */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.topBarItem}>
          <View style={[styles.topBarIcon, { backgroundColor: '#8D6E63' }]}>
            <Ionicons name="cube" size={18} color="#FFFFFF" />
          </View>
          <View style={styles.topBarInfo}>
            <Text style={styles.topBarValue}>{player.worldData.resources?.stone || 0}</Text>
            <Text style={styles.topBarLabel}>石头</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.topBarItem}>
          <View style={[styles.topBarIcon, { backgroundColor: '#795548' }]}>
            <Ionicons name="leaf" size={18} color="#FFFFFF" />
          </View>
          <View style={styles.topBarInfo}>
            <Text style={styles.topBarValue}>{player.worldData.resources?.wood || 0}</Text>
            <Text style={styles.topBarLabel}>木材</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.topBarItem}>
          <View style={[styles.topBarIcon, { backgroundColor: '#4CAF50' }]}>
            <Ionicons name="flask" size={18} color="#FFFFFF" />
          </View>
          <View style={styles.topBarInfo}>
            <Text style={styles.topBarValue}>0</Text>
            <Text style={styles.topBarLabel}>草药</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.topBarItem}>
          <View style={[styles.topBarIcon, { backgroundColor: '#2196F3' }]}>
            <Ionicons name="water" size={18} color="#FFFFFF" />
          </View>
          <View style={styles.topBarInfo}>
            <Text style={styles.topBarValue}>{player.worldData.resources?.water || 0}</Text>
            <Text style={styles.topBarLabel}>水</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.topBarItem}>
          <View style={[styles.topBarIcon, { backgroundColor: '#FF9800' }]}>
            <Ionicons name="restaurant" size={18} color="#FFFFFF" />
          </View>
          <View style={styles.topBarInfo}>
            <Text style={styles.topBarValue}>{player.worldData.resources?.food || 0}</Text>
            <Text style={styles.topBarLabel}>食物</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.topBarItem} onPress={() => setShowPopulationModal(true)}>
          <View style={[styles.topBarIcon, { backgroundColor: '#9C27B0' }]}>
            <Ionicons name="people" size={18} color="#FFFFFF" />
          </View>
          <View style={styles.topBarInfo}>
            <Text style={styles.topBarValue}>{totalPopulation}</Text>
            <Text style={styles.topBarLabel}>人口</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.topBarItem} onPress={() => setShowStrengthModal(true)}>
          <View style={[styles.topBarIcon, { backgroundColor: '#F44336' }]}>
            <Ionicons name="shield" size={18} color="#FFFFFF" />
          </View>
          <View style={styles.topBarInfo}>
            <Text style={styles.topBarValue}>{totalStrength}</Text>
            <Text style={styles.topBarLabel}>战力</Text>
          </View>
        </TouchableOpacity>

        {/* 快捷按钮 */}
        <View style={styles.topBarQuickButtons}>
          <TouchableOpacity style={styles.topBarQuickButton}>
            <Ionicons name="settings-outline" size={20} color={Colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.topBarQuickButton}>
            <Ionicons name="mail-outline" size={20} color={Colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.topBarQuickButton}>
            <Ionicons name="book-outline" size={20} color={Colors.text} />
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
              {leftMenuItems.map((item, index) => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.subMenuItem, selectedMenu === item.id && styles.subMenuItemSelected]}
                  onPress={() => handleLeftMenuPress(item.id)}
                >
                  <Ionicons name={item.icon as any} size={18} color={selectedMenu === item.id ? Colors.primaryDark : Colors.accent} />
                  <Text style={[styles.subMenuText, selectedMenu === item.id && styles.subMenuTextSelected]}>
                    {item.name}
                  </Text>
                  {(item.id === 'materials' || item.id === 'weapons' || item.id === 'building') && (
                    <View style={styles.subMenuNotification} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
          
          {/* 从下到上的主按钮 */}
          <View style={styles.leftButtonsContainer}>
            {/* 副本按钮 */}
            <TouchableOpacity style={styles.leftButton}>
              <View style={styles.leftButtonIcon}>
                <Ionicons name="game-controller" size={24} color={Colors.text} />
              </View>
              <Text style={styles.leftButtonText}>副本</Text>
            </TouchableOpacity>
            
            {/* 种族按钮 */}
            <TouchableOpacity 
              style={styles.leftButton} 
              onPress={() => router.push(`/race/${player.worldData.unlockedRaces[player.worldData.unlockedRaces.length - 1]}`)}
            >
              <View style={styles.leftButtonIcon}>
                <Ionicons name="people" size={24} color={Colors.text} />
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
                <Ionicons name="book" size={24} color={Colors.text} />
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
              <Ionicons name={item.icon as any} size={28} color={Colors.accent} />
            </View>
            {item.badge && (
              <Text style={styles.bottomMenuBadge}>{item.badge}</Text>
            )}
            <Text style={styles.bottomMenuText}>{item.name}</Text>
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
                <Ionicons name="close" size={24} color={Colors.text} />
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
                    <Ionicons name="people" size={16} color={Colors.accent} />
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
                <Ionicons name="close" size={24} color={Colors.text} />
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a0a2e',
    position: 'relative',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    color: Colors.text,
    fontSize: 16,
  },
  backgroundLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#1a0a2e',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(74, 44, 145, 0.8)',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 2,
    borderBottomColor: Colors.accent,
  },
  topBarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  topBarIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  topBarInfo: {
    alignItems: 'center',
  },
  topBarValue: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: 'bold',
  },
  topBarLabel: {
    color: Colors.textSecondary,
    fontSize: 10,
  },
  topBarQuickButtons: {
    flexDirection: 'row',
    marginLeft: 'auto',
    gap: 8,
  },
  topBarQuickButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(74, 44, 145, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4A2C91',
  },
  mainContent: {
    flex: 1,
    flexDirection: 'row',
    marginTop: 8,
  },
  leftMenu: {
    width: '35%',
    paddingLeft: 8,
    justifyContent: 'flex-end',
  },
  subMenuContainer: {
    backgroundColor: 'rgba(74, 44, 145, 0.8)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: Colors.accent,
  },
  subMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    marginVertical: 2,
    borderRadius: 8,
    position: 'relative',
  },
  subMenuItemSelected: {
    backgroundColor: Colors.accent,
  },
  subMenuText: {
    color: Colors.accent,
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 6,
    flex: 1,
  },
  subMenuTextSelected: {
    color: Colors.primaryDark,
  },
  subMenuNotification: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF4D4D',
    position: 'absolute',
    top: 6,
    right: 6,
  },
  leftButtonsContainer: {
    gap: 8,
  },
  leftButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(74, 44, 145, 0.7)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 2,
    borderColor: '#4A2C91',
    position: 'relative',
  },
  leftButtonIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  leftButtonText: {
    color: Colors.accent,
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  leftButtonNotification: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF4D4D',
    position: 'absolute',
    top: 10,
    right: 10,
  },
  centerArea: {
    flex: 1,
    paddingHorizontal: 8,
    position: 'relative',
  },
  mapArea: {
    flex: 1,
    backgroundColor: 'rgba(30, 15, 60, 0.5)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#4A2C91',
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPlaceholderText: {
    color: Colors.textSecondary,
    fontSize: 16,
  },
  collectButtonArea: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    alignItems: 'center',
  },
  collectButton: {
    backgroundColor: 'rgba(74, 44, 145, 0.9)',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 2,
    borderColor: Colors.accent,
  },
  collectButtonText: {
    color: Colors.accent,
    fontSize: 18,
    fontWeight: 'bold',
  },
  collectInfo: {
    color: Colors.text,
    fontSize: 14,
    marginTop: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },

  bottomMenu: {
    flexDirection: 'row',
    backgroundColor: 'rgba(74, 44, 145, 0.9)',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderTopWidth: 2,
    borderTopColor: Colors.accent,
  },
  bottomMenuItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
    position: 'relative',
  },
  bottomMenuIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    borderWidth: 2,
    borderColor: '#4A2C91',
  },
  bottomMenuBadge: {
    position: 'absolute',
    top: 0,
    color: Colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  bottomMenuText: {
    color: Colors.accent,
    fontSize: 12,
    fontWeight: 'bold',
  },
  bottomNotification: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF4D4D',
    position: 'absolute',
    top: 0,
    right: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: Colors.backgroundLight,
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxHeight: '80%',
    borderWidth: 2,
    borderColor: Colors.accent,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    color: Colors.accent,
    fontSize: 24,
    fontWeight: 'bold',
  },
  totalPopulationContainer: {
    alignItems: 'center',
    marginBottom: 20,
    padding: 20,
    backgroundColor: Colors.card,
    borderRadius: 12,
  },
  totalPopulationLabel: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginBottom: 8,
  },
  totalPopulationValue: {
    color: Colors.accent,
    fontSize: 36,
    fontWeight: 'bold',
  },
  modalList: {
    maxHeight: 300,
  },
  modalListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: Colors.accent,
  },
  modalListItemInfo: {
    flex: 1,
  },
  modalListItemName: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  modalListItemValue: {
    alignItems: 'center',
    marginLeft: 15,
  },
  modalListItemNumber: {
    color: Colors.accent,
    fontSize: 24,
    fontWeight: 'bold',
  },
  modalListItemUnit: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  tierBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  tierText: {
    color: Colors.accent,
    fontSize: 12,
    fontWeight: 'bold',
  },
  tribeStatusBadge: {
    backgroundColor: Colors.card,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  tribeStatusText: {
    color: Colors.accent,
    fontSize: 11,
    fontWeight: '600',
  },
  strengthBreakdown: {
    marginTop: 6,
  },
  strengthBreakdownText: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  tribesSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border.subtle,
  },
  tribesSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  tribesSectionTitle: {
    color: Colors.accent,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
