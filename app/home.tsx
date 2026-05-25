import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, SafeAreaView, Modal, Pressable, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useGameStore } from '@/store/useGameStore';
import SystemCard from '@/components/SystemCard';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import { getRaceById, RACES } from '@/utils/races';

const systems = [
  { id: 'dishes', name: '菜品', icon: 'restaurant', description: '收集食谱' },
  { id: 'secrets', name: '秘术', icon: 'sparkles', description: '学习秘术' },
  { id: 'beasts', name: '异兽', icon: 'paw', description: '驯养异兽' },
  { id: 'weapons', name: '神兵', icon: 'shield', description: '打造神兵' },
  { id: 'building', name: '修建', icon: 'construct', description: '建造建筑' },
  { id: 'arrays', name: '阵界', icon: 'grid', description: '布置阵法' },
  { id: 'empire', name: '皇朝', icon: 'crown', description: '建立皇朝' },
];

export default function HomeScreen() {
  const { player, loadSavedPlayer } = useGameStore();
  const [showPopulationModal, setShowPopulationModal] = useState(false);
  const [showStrengthModal, setShowStrengthModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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

  const handleSystemPress = (systemId: string) => {
    router.push(`/system/${systemId}`);
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
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={24} color={Colors.accent} />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.welcomeText}>欢迎回来</Text>
            <Text style={styles.playerName}>{player.name}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.settingsButton}>
          <View style={styles.settingsIconContainer}>
            <Ionicons name="settings-outline" size={22} color={Colors.text} />
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.subtitleContainer}>
        <Text style={styles.subtitle}>引导你的种族走向繁荣</Text>
        <View style={styles.subtitleDecoration}>
          <Ionicons name="sparkles" size={16} color={Colors.accent} />
        </View>
      </View>

      <View style={styles.topBar}>
        <TouchableOpacity style={styles.topBarItem} onPress={() => setShowPopulationModal(true)}>
          <View style={styles.topBarIconContainer}>
            <Ionicons name="people" size={18} color={Colors.accent} />
          </View>
          <View style={styles.topBarInfo}>
            <Text style={styles.topBarValue}>{totalPopulation.toLocaleString()}</Text>
            <Text style={styles.topBarLabel}>人口</Text>
          </View>
        </TouchableOpacity>
        
        <View style={styles.topBarDivider} />
        
        <TouchableOpacity style={styles.topBarItem} onPress={() => setShowStrengthModal(true)}>
          <View style={styles.topBarIconContainer}>
            <Ionicons name="shield-checkmark" size={18} color={Colors.accent} />
          </View>
          <View style={styles.topBarInfo}>
            <Text style={styles.topBarValue}>{totalStrength.toLocaleString()}</Text>
            <Text style={styles.topBarLabel}>战力</Text>
          </View>
        </TouchableOpacity>
        
        <View style={styles.topBarDivider} />
        
        <View style={styles.topBarResources}>
          {Object.entries(player.worldData.resources ?? {}).map(([key, value]) => (
            <View key={key} style={styles.topBarResourceItem}>
              <Ionicons 
                name={key === 'food' ? 'restaurant' : key === 'water' ? 'water' : key === 'wood' ? 'leaf' : 'cube'} 
                size={14} 
                color={Colors.accent} 
              />
              <Text style={styles.topBarResourceValue}>{value.toLocaleString()}</Text>
            </View>
          ))}
        </View>
      </View>

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
            <ScrollView style={styles.raceList}>
              {allRaces.map((race) => (
                <View key={race.id} style={styles.raceItem}>
                  <View style={styles.raceInfo}>
                    <View style={styles.raceHeader}>
                      <Text style={styles.raceName}>{race.name}</Text>
                      <View style={styles.tierBadge}>
                        <Text style={styles.tierText}>T{race.tier}</Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.raceCountContainer}>
                    <Text style={styles.raceCount}>{race.population}</Text>
                    <Text style={styles.raceCountLabel}>人</Text>
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
                    <View key={tribe.id || index} style={styles.tribeItem}>
                      <View style={styles.tribeInfo}>
                        <Text style={styles.tribeName}>{tribe.name}</Text>
                        <View style={styles.tribeStatusBadge}>
                          <Text style={styles.tribeStatusText}>
                            {tribe.status === 'merged' ? '合并' : tribe.status === 'vassal' ? '附庸' : '敌对'}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.tribePopulationContainer}>
                        <Text style={styles.tribePopulation}>{tribe.population}</Text>
                        <Text style={styles.tribePopulationLabel}>人</Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

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
            <ScrollView style={styles.raceList}>
              {getAllRacesWithStrength().map((race) => {
                const raceInfo = RACES[race.id];
                return (
                  <View key={race.id} style={styles.strengthItem}>
                    <View style={styles.strengthInfo}>
                      <View style={styles.raceHeader}>
                        <Text style={styles.raceName}>{race.name}</Text>
                        <View style={styles.tierBadge}>
                          <Text style={styles.tierText}>T{race.tier}</Text>
                        </View>
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
                    <View style={styles.strengthValueContainer}>
                      <Text style={styles.strengthValue}>{race.strength}</Text>
                      <Text style={styles.strengthValueLabel}>战力</Text>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      <ScrollView style={styles.content}>
        <View style={styles.raceSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>当前种族</Text>
            <View style={styles.sectionDecoration} />
          </View>
          <TouchableOpacity 
            style={styles.raceCard}
            onPress={() => router.push(`/race/${player.worldData.unlockedRaces[player.worldData.unlockedRaces.length - 1]}`)}
          >
            <View style={styles.raceCardHeader}>
              <View style={styles.raceIconContainer}>
                <Ionicons name="people-circle" size={32} color={Colors.accent} />
              </View>
              <View style={styles.raceCardInfo}>
                <Text style={styles.raceCardName}>{currentRace?.name || '未开化猿人'}</Text>
                <View style={styles.raceTier}>
                  <Ionicons name="star" size={12} color={Colors.accent} />
                  <Text style={styles.raceTierText}>等级 {currentRace?.tier || 1}</Text>
                </View>
              </View>
              <View style={styles.raceArrow}>
                <Ionicons name="chevron-forward" size={24} color={Colors.accent} />
              </View>
            </View>
            <Text style={styles.raceDesc}>{currentRace?.description}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.startButton} onPress={handleStartExploration}>
          <View style={styles.startButtonIcon}>
            <Ionicons name="play" size={28} color={Colors.primaryDark} />
          </View>
          <Text style={styles.startButtonText}>开始探索</Text>
          <View style={styles.startButtonDecoration}>
            <Ionicons name="arrow-forward" size={20} color={Colors.primaryDark} />
          </View>
        </TouchableOpacity>

        <View style={styles.systemsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>游戏系统</Text>
            <View style={styles.sectionDecoration} />
          </View>
          <View style={styles.systemsGrid}>
            {systems.map((system) => (
              <SystemCard
                key={system.id}
                id={system.id}
                name={system.name}
                icon={system.icon}
                description={system.description}
                unlocked={player.unlockedSystems.includes(system.id)}
                onPress={() => handleSystemPress(system.id)}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Layout.padding,
    paddingTop: 10,
    paddingBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryLight,
    borderWidth: 2,
    borderColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    ...Colors.shadow.glow,
  },
  headerTextContainer: {
    gap: 2,
  },
  welcomeText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  playerName: {
    color: Colors.accent,
    fontSize: 22,
    fontWeight: 'bold',
  },
  settingsButton: {
    padding: 4,
  },
  settingsIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    ...Colors.shadow.card,
  },
  subtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Layout.padding,
    marginBottom: 12,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    marginHorizontal: Layout.padding,
    marginBottom: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: Layout.borderRadiusLarge,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    ...Colors.shadow.card,
  },
  topBarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  topBarIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBarInfo: {
    gap: 2,
  },
  topBarValue: {
    color: Colors.accent,
    fontSize: 16,
    fontWeight: 'bold',
  },
  topBarLabel: {
    color: Colors.textSecondary,
    fontSize: 11,
  },
  topBarDivider: {
    width: 1,
    height: 32,
    backgroundColor: Colors.border.subtle,
    marginHorizontal: 12,
  },
  topBarResources: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  topBarResourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  topBarResourceValue: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontStyle: 'italic',
  },
  subtitleDecoration: {
    marginLeft: 8,
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
  raceList: {
    maxHeight: 400,
  },
  raceItem: {
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
  raceInfo: {
    flex: 1,
  },
  raceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  raceName: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '600',
  },
  tierBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 8,
  },
  tierText: {
    color: Colors.accent,
    fontSize: 12,
    fontWeight: 'bold',
  },
  raceCountContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginLeft: 15,
    gap: 4,
  },
  raceCount: {
    color: Colors.accent,
    fontSize: 24,
    fontWeight: 'bold',
  },
  raceCountLabel: {
    color: Colors.textSecondary,
    fontSize: 14,
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
  tribeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.primaryDark,
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  tribeInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  tribeName: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  tribeStatusBadge: {
    backgroundColor: Colors.card,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tribeStatusText: {
    color: Colors.accent,
    fontSize: 11,
    fontWeight: '600',
  },
  tribePopulationContainer: {
    alignItems: 'center',
  },
  tribePopulation: {
    color: Colors.info,
    fontSize: 20,
    fontWeight: 'bold',
  },
  tribePopulationLabel: {
    color: Colors.textSecondary,
    fontSize: 11,
  },
  strengthItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: Colors.info,
  },
  strengthInfo: {
    flex: 1,
  },
  strengthBreakdown: {
    marginTop: 6,
  },
  strengthBreakdownText: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  strengthValueContainer: {
    alignItems: 'center',
  },
  strengthValue: {
    color: Colors.info,
    fontSize: 24,
    fontWeight: 'bold',
  },
  strengthValueLabel: {
    color: Colors.textSecondary,
    fontSize: 11,
  },
  content: {
    flex: 1,
    padding: Layout.padding,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  sectionDecoration: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border.subtle,
  },
  resourcesSection: {
    marginBottom: 24,
  },
  resourcesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  resourceItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: Layout.borderRadius,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    ...Colors.shadow.card,
  },
  resourceIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  resourceValue: {
    color: Colors.accent,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  resourceName: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  raceSection: {
    marginBottom: 24,
  },
  raceCard: {
    backgroundColor: Colors.card,
    padding: 20,
    borderRadius: Layout.borderRadiusLarge,
    borderWidth: 1,
    borderColor: Colors.border.accent,
    ...Colors.shadow.card,
  },
  raceCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  raceIconContainer: {
    marginRight: 12,
  },
  raceCardInfo: {
    flex: 1,
    gap: 4,
  },
  raceCardName: {
    color: Colors.accent,
    fontSize: 20,
    fontWeight: 'bold',
  },
  raceTier: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  raceTierText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  raceArrow: {
    marginLeft: 12,
  },
  raceDesc: {
    color: Colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  startButton: {
    flexDirection: 'row',
    backgroundColor: Colors.accent,
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: Layout.borderRadiusLarge,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 24,
    ...Colors.shadow.accent,
  },
  startButtonIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.accentLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  startButtonText: {
    color: Colors.primaryDark,
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  startButtonDecoration: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.accentDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  systemsSection: {
    marginBottom: 40,
  },
  systemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
});