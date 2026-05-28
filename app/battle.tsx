import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useGameStore } from '@/store/useGameStore';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import ScalableView from '@/components/ScalableView';
import { EnemyTribe, BattleResult } from '@/types';
import { generateEnemyTribe, calculateVictoryChance, simulateBattle } from '@/utils/races';

export default function BattleScreen() {
  const { 
    currentRun, 
    addEventToHistory,
    setIsBattleActive,
  } = useGameStore();

  const [enemyTribe, setEnemyTribe] = useState<EnemyTribe | null>(null);
  const [battlePhase, setBattlePhase] = useState<'pre' | 'fighting' | 'result'>('pre');
  const [battleResult, setBattleResult] = useState<BattleResult | null>(null);

  useEffect(() => {
    if (currentRun) {
      setEnemyTribe(generateEnemyTribe(currentRun.progress));
    }
  }, [currentRun]);

  const startBattle = () => {
    if (!currentRun || !enemyTribe) return;
    
    setBattlePhase('fighting');
    
    setTimeout(() => {
      const result = simulateBattle(
        currentRun.totalStrength, 
        enemyTribe.strength,
        currentRun.population
      );
      setBattleResult(result);
      setBattlePhase('result');
    }, 1500);
  };

  const handleResult = (choice: 'merge' | 'vassal' | 'exterminate' | 'continue' | 'end') => {
    if (!currentRun || !enemyTribe || !battleResult) return;
    
    const finalPopulation = Math.max(1, currentRun.population - battleResult.casualties);
    
    let newStrength = currentRun.totalStrength;
    let newDefeatedTribes = [...currentRun.defeatedTribes];
    let additionalResources = { food: 0, water: 0, wood: 0, stone: 0 };
    
    if (battleResult.victory) {
      switch (choice) {
        case 'merge':
          additionalResources = {
            food: 50 + Math.floor(Math.random() * 50),
            water: 40 + Math.floor(Math.random() * 40),
            wood: 30 + Math.floor(Math.random() * 30),
            stone: 20 + Math.floor(Math.random() * 30),
          };
          newStrength += Math.floor(enemyTribe.strength * 0.5);
          newDefeatedTribes.push({
            id: enemyTribe.id,
            name: enemyTribe.name,
            population: enemyTribe.population,
            strength: enemyTribe.strength,
            status: 'merged',
          });
          break;
        case 'vassal':
          additionalResources = {
            food: 30 + Math.floor(Math.random() * 30),
            water: 25 + Math.floor(Math.random() * 25),
            wood: 20 + Math.floor(Math.random() * 20),
            stone: 15 + Math.floor(Math.random() * 15),
          };
          newStrength += Math.floor(enemyTribe.strength * 0.2);
          newDefeatedTribes.push({
            id: enemyTribe.id,
            name: enemyTribe.name,
            population: enemyTribe.population,
            strength: enemyTribe.strength,
            status: 'vassal',
          });
          break;
        case 'exterminate':
          additionalResources = {
            food: 100 + Math.floor(Math.random() * 100),
            water: 80 + Math.floor(Math.random() * 80),
            wood: 60 + Math.floor(Math.random() * 60),
            stone: 50 + Math.floor(Math.random() * 50),
          };
          newDefeatedTribes.push({
            id: enemyTribe.id,
            name: enemyTribe.name,
            population: 0,
            strength: 0,
            status: 'enemy',
          });
          break;
      }
    } else {
      if (choice === 'end') {
        setIsBattleActive(false);
        router.push('/settlement');
        return;
      }
    }
    
    useGameStore.setState((state) => {
      if (!state.currentRun) return state;
      
      const newInventory = { ...state.currentRun.inventory };
      Object.entries(additionalResources).forEach(([key, value]) => {
        newInventory[key] = (newInventory[key] || 0) + value;
      });
      
      return {
        ...state,
        currentRun: {
          ...state.currentRun,
          population: finalPopulation,
          totalStrength: newStrength,
          inventory: newInventory,
          defeatedTribes: newDefeatedTribes,
        },
      };
    });
    
    const historyItem = {
      id: Date.now() + '',
      event: {
        id: 'battle-event',
        type: 'encounter' as const,
        title: '部落遭遇战',
        description: `与${enemyTribe.name}发生了一场遭遇战`,
        choices: [],
      },
      selectedChoiceId: 'battle-choice',
      selectedChoiceText: '发起攻击',
      resultText: battleResult.victory ? '我们获得了胜利！' : '我们失败了...',
      resourcesGained: additionalResources,
      progressGained: 10,
      populationChange: -battleResult.casualties,
      strengthChange: newStrength - currentRun.totalStrength,
      timestamp: Date.now(),
    };
    
    addEventToHistory(historyItem);
    setIsBattleActive(false);
    router.push('/explore');
  };

  if (!currentRun || !enemyTribe) {
    return (
      <ScalableView style={styles.container}>
        <Text style={styles.loadingText}>加载中...</Text>
      </ScalableView>
    );
  }

  const victoryChance = calculateVictoryChance(currentRun.totalStrength, enemyTribe.strength);

  return (
    <ScalableView 
      style={styles.container} 
      scrollable={false}
    >
      <View style={styles.content}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>⚔️ 部落遭遇战 ⚔️</Text>
      </View>
      
      <View style={styles.combatantsContainer}>
        <View style={styles.combatantBox}>
          <View style={styles.combatantHeader}>
            <View style={styles.combatantIcon}>
              <Ionicons name="people" size={Layout.scale(18)} color={Colors.accent} />
            </View>
            <Text style={styles.combatantTitle}>我方部落</Text>
          </View>
          <View style={styles.combatantStats}>
            <View style={styles.combatantStat}>
              <Text style={styles.combatantStatValue}>{currentRun.population}</Text>
              <Text style={styles.combatantStatLabel}>人口</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.combatantStat}>
              <Text style={styles.combatantStatValue}>{currentRun.totalStrength}</Text>
              <Text style={styles.combatantStatLabel}>战力</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.vsContainer}>
          <View style={styles.vsLine} />
          <View style={styles.vsBadge}>
            <Text style={styles.vsText}>VS</Text>
          </View>
          <View style={styles.vsLine} />
        </View>
        
        <View style={[styles.combatantBox, styles.enemyBox]}>
          <View style={styles.combatantHeader}>
            <View style={[styles.combatantIcon, styles.enemyIcon]}>
              <Ionicons name="people" size={Layout.scale(18)} color={Colors.error} />
            </View>
            <Text style={styles.combatantTitle}>{enemyTribe.name}</Text>
          </View>
          <View style={styles.combatantStats}>
            <View style={styles.combatantStat}>
              <Text style={styles.combatantStatValue}>{enemyTribe.population}</Text>
              <Text style={styles.combatantStatLabel}>人口</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.combatantStat}>
              <Text style={styles.combatantStatValue}>{enemyTribe.strength}</Text>
              <Text style={styles.combatantStatLabel}>战力</Text>
            </View>
          </View>
        </View>
      </View>
      
      {battlePhase === 'pre' && (
        <View style={styles.phaseContainer}>
          <View style={styles.chanceContainer}>
            <Text style={styles.chanceLabel}>预估胜率</Text>
            <Text style={styles.chanceValue}>{Math.round(victoryChance * 100)}%</Text>
            <View style={styles.chanceBar}>
              <View style={[styles.chanceProgress, { width: `${victoryChance * 100}%` }]} />
            </View>
          </View>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.battleButton}
              onPress={() => {
                setIsBattleActive(false);
                router.back();
              }}
            >
              <Ionicons name="arrow-back" size={Layout.scale(14)} color={Colors.text} />
              <Text style={styles.battleButtonText}>撤退</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.battleButton, styles.primaryButton]}
              onPress={startBattle}
            >
              <Ionicons name="flame" size={Layout.scale(14)} color={Colors.primaryDark} />
              <Text style={[styles.battleButtonText, styles.primaryButtonText]}>开战！</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      
      {battlePhase === 'fighting' && (
        <View style={styles.phaseContainer}>
          <View style={styles.fightingIconContainer}>
            <Ionicons name="flash" size={Layout.scale(48)} color={Colors.accent} />
          </View>
          <Text style={styles.fightingText}>⚔️ 战斗中... ⚔️</Text>
          <Ionicons name="hourglass" size={Layout.scale(28)} color={Colors.accent} />
        </View>
      )}
      
      {battlePhase === 'result' && battleResult && (
        <View style={styles.phaseContainer}>
          <View style={[styles.resultIconContainer, battleResult.victory ? styles.victoryIcon : styles.defeatIcon]}>
            <Ionicons 
              name={battleResult.victory ? "trophy" : "skull"} 
              size={Layout.scale(48)} 
              color={battleResult.victory ? Colors.accent : Colors.error} 
            />
          </View>
          <Text style={battleResult.victory ? styles.victoryText : styles.defeatText}>
            {battleResult.victory ? '🎉 胜利！' : '💀 战败...'}
          </Text>
          
          <View style={styles.resultDetails}>
            <View style={styles.resultDetail}>
              <Text style={styles.resultDetailLabel}>胜率</Text>
              <Text style={styles.resultDetailValue}>{Math.round(battleResult.victoryChance * 100)}%</Text>
            </View>
            <View style={styles.resultDetail}>
              <Text style={styles.resultDetailLabel}>阵亡</Text>
              <Text style={[styles.resultDetailValue, { color: Colors.error }]}>
                -{battleResult.casualties}
              </Text>
            </View>
          </View>
          
          <View style={styles.resultButtons}>
            {battleResult.victory ? (
              <>
                <TouchableOpacity
                  style={styles.choiceButton}
                  onPress={() => handleResult('merge')}
                >
                  <Text style={styles.choiceButtonText}>合并</Text>
                  <Text style={styles.choiceSubtext}>人口+50%</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.choiceButton}
                  onPress={() => handleResult('vassal')}
                >
                  <Text style={styles.choiceButtonText}>附庸</Text>
                  <Text style={styles.choiceSubtext}>持续收益</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.choiceButton, styles.dangerButton]}
                  onPress={() => handleResult('exterminate')}
                >
                  <Text style={styles.choiceButtonText}>灭族</Text>
                  <Text style={styles.choiceSubtext}>资源翻倍</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity
                  style={styles.choiceButton}
                  onPress={() => handleResult('continue')}
                >
                  <Text style={styles.choiceButtonText}>继续</Text>
                  <Text style={styles.choiceSubtext}>休养生息</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.choiceButton, styles.dangerButton]}
                  onPress={() => handleResult('end')}
                >
                  <Text style={styles.choiceButtonText}>结束</Text>
                  <Text style={styles.choiceSubtext}>保存实力</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      )}
      </View>
    </ScalableView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Layout.padding,
    flex: 1,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: Layout.scale(20),
  },
  title: {
    fontSize: Layout.fontScale(24),
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
  },
  combatantsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.scale(20),
    gap: Layout.scale(8),
  },
  combatantBox: {
    backgroundColor: Colors.card,
    padding: Layout.scale(14),
    borderRadius: Layout.borderRadiusLarge,
    width: '42%',
    borderWidth: 2,
    borderColor: Colors.accent,
    ...Colors.shadow.card,
  },
  enemyBox: {
    borderColor: Colors.error,
  },
  combatantHeader: {
    alignItems: 'center',
    marginBottom: Layout.scale(10),
    gap: Layout.scale(6),
  },
  combatantIcon: {
    width: Layout.scale(36),
    height: Layout.scale(36),
    borderRadius: Layout.scale(18),
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.accent,
  },
  enemyIcon: {
    backgroundColor: Colors.error + '30',
    borderColor: Colors.error,
  },
  combatantTitle: {
    color: Colors.text,
    fontSize: Layout.fontScale(12),
    fontWeight: 'bold',
    textAlign: 'center',
  },
  combatantStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: Layout.scale(6),
  },
  combatantStat: {
    alignItems: 'center',
    flex: 1,
  },
  combatantStatValue: {
    color: Colors.accent,
    fontSize: Layout.fontScale(18),
    fontWeight: 'bold',
  },
  combatantStatLabel: {
    color: Colors.textSecondary,
    fontSize: Layout.fontScale(10),
    marginTop: Layout.scale(2),
  },
  statDivider: {
    width: 1,
    height: '100%',
    backgroundColor: Colors.border.subtle,
  },
  vsContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: Layout.scale(48),
  },
  vsLine: {
    width: Layout.scale(2),
    height: Layout.scale(16),
    backgroundColor: Colors.border.subtle,
  },
  vsBadge: {
    width: Layout.scale(40),
    height: Layout.scale(40),
    borderRadius: Layout.scale(20),
    backgroundColor: Colors.primaryDark,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.accent,
  },
  vsText: {
    color: Colors.accent,
    fontSize: Layout.fontScale(14),
    fontWeight: 'bold',
  },
  phaseContainer: {
    backgroundColor: Colors.card,
    padding: Layout.scale(20),
    borderRadius: Layout.borderRadiusLarge,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    ...Colors.shadow.card,
  },
  chanceContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: Layout.scale(16),
  },
  chanceLabel: {
    color: Colors.textSecondary,
    fontSize: Layout.fontScale(12),
    marginBottom: Layout.scale(6),
  },
  chanceValue: {
    color: Colors.accent,
    fontSize: Layout.fontScale(36),
    fontWeight: 'bold',
    marginBottom: Layout.scale(8),
  },
  chanceBar: {
    width: '100%',
    height: Layout.scale(6),
    backgroundColor: Colors.primaryDark,
    borderRadius: Layout.borderRadiusSmall,
    overflow: 'hidden',
  },
  chanceProgress: {
    height: '100%',
    backgroundColor: Colors.accent,
    borderRadius: Layout.borderRadiusSmall,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: Layout.scale(12),
    width: '100%',
  },
  battleButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Layout.scale(12),
    paddingHorizontal: Layout.scale(16),
    borderRadius: Layout.borderRadius,
    gap: Layout.scale(6),
    borderWidth: 1,
    borderColor: Colors.border.subtle,
  },
  primaryButton: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
    ...Colors.shadow.accent,
  },
  battleButtonText: {
    color: Colors.text,
    fontSize: Layout.fontScale(14),
    fontWeight: 'bold',
  },
  primaryButtonText: {
    color: '#000',
  },
  fightingIconContainer: {
    width: Layout.scale(80),
    height: Layout.scale(80),
    borderRadius: Layout.scale(40),
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Layout.scale(12),
    borderWidth: 2,
    borderColor: Colors.accent,
    ...Colors.shadow.glow,
  },
  fightingText: {
    color: Colors.accent,
    fontSize: Layout.fontScale(20),
    fontWeight: 'bold',
    marginBottom: Layout.scale(8),
  },
  resultIconContainer: {
    width: Layout.scale(80),
    height: Layout.scale(80),
    borderRadius: Layout.scale(40),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Layout.scale(12),
    borderWidth: 3,
    ...Colors.shadow.glow,
  },
  victoryIcon: {
    backgroundColor: Colors.accent + '30',
    borderColor: Colors.accent,
  },
  defeatIcon: {
    backgroundColor: Colors.error + '30',
    borderColor: Colors.error,
  },
  victoryText: {
    color: Colors.success,
    fontSize: Layout.fontScale(28),
    fontWeight: 'bold',
    marginBottom: Layout.scale(16),
  },
  defeatText: {
    color: Colors.error,
    fontSize: Layout.fontScale(28),
    fontWeight: 'bold',
    marginBottom: Layout.scale(16),
  },
  resultDetails: {
    flexDirection: 'row',
    gap: Layout.scale(16),
    marginBottom: Layout.scale(16),
  },
  resultDetail: {
    alignItems: 'center',
    backgroundColor: Colors.primaryDark,
    paddingVertical: Layout.scale(10),
    paddingHorizontal: Layout.scale(16),
    borderRadius: Layout.borderRadius,
  },
  resultDetailLabel: {
    color: Colors.textSecondary,
    fontSize: Layout.fontScale(10),
    marginBottom: Layout.scale(2),
  },
  resultDetailValue: {
    color: Colors.accent,
    fontSize: Layout.fontScale(16),
    fontWeight: 'bold',
  },
  resultButtons: {
    gap: Layout.scale(10),
    width: '100%',
  },
  choiceButton: {
    backgroundColor: Colors.primary,
    padding: Layout.scale(14),
    borderRadius: Layout.borderRadius,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border.subtle,
  },
  dangerButton: {
    backgroundColor: Colors.error + '80',
    borderColor: Colors.error,
  },
  choiceButtonText: {
    color: Colors.text,
    fontSize: Layout.fontScale(14),
    fontWeight: 'bold',
    marginBottom: Layout.scale(2),
  },
  choiceSubtext: {
    color: Colors.textSecondary,
    fontSize: Layout.fontScale(11),
  },
  loadingText: {
    color: Colors.text,
    fontSize: Layout.fontScale(18),
    textAlign: 'center',
    marginTop: Layout.scale(100),
  },
});
