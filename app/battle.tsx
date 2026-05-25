import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useGameStore } from '@/store/useGameStore';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import { EnemyTribe, BattleResult, TribeData } from '@/types';
import { generateEnemyTribe, calculateVictoryChance, simulateBattle } from '@/utils/races';

export default function BattleScreen() {
  const { 
    currentRun, 
    setCurrentEvent,
    addEventToHistory,
    setIsBattleActive,
    makeChoice
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
    
    // 模拟战斗动画
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
      // 胜利处理
      switch (choice) {
        case 'merge':
          // 合并部落，大幅增加人口和战力
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
          // 收为附庸，获得持续收益
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
          // 灭族，获得大量资源
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
      // 失败处理
      if (choice === 'end') {
        // 结束本轮
        setIsBattleActive(false);
        router.push('/settlement');
        return;
      }
    }
    
    // 更新当前运行状态
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
    
    // 添加历史记录
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
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>加载中...</Text>
      </SafeAreaView>
    );
  }

  const victoryChance = calculateVictoryChance(currentRun.totalStrength, enemyTribe.strength);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>⚔️ 部落遭遇战 ⚔️</Text>
          <View style={styles.titleDecoration} />
        </View>
        
        {/* 双方战力对比 */}
        <View style={styles.combatantsContainer}>
          {/* 我方 */}
          <View style={styles.combatantBox}>
            <View style={styles.combatantHeader}>
              <View style={styles.combatantIcon}>
                <Ionicons name="people" size={24} color={Colors.accent} />
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
          
          {/* 敌方 */}
          <View style={[styles.combatantBox, styles.enemyBox]}>
            <View style={styles.combatantHeader}>
              <View style={[styles.combatantIcon, styles.enemyIcon]}>
                <Ionicons name="people" size={24} color={Colors.error} />
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
        
        {/* 战斗阶段 */}
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
                <View style={styles.buttonIcon}>
                  <Ionicons name="arrow-back" size={20} color={Colors.text} />
                </View>
                <Text style={styles.battleButtonText}>撤退</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.battleButton, styles.primaryButton]}
                onPress={startBattle}
              >
                <View style={styles.buttonIcon}>
                  <Ionicons name="flame" size={20} color={Colors.primaryDark} />
                </View>
                <Text style={[styles.battleButtonText, styles.primaryButtonText]}>开战！</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        
        {battlePhase === 'fighting' && (
          <View style={styles.phaseContainer}>
            <View style={styles.fightingIconContainer}>
              <Ionicons name="flash" size={64} color={Colors.accent} />
            </View>
            <Text style={styles.fightingText}>⚔️ 战斗中... ⚔️</Text>
            <View style={styles.fightingAnimation}>
              <Ionicons name="hourglass" size={40} color={Colors.accent} />
            </View>
          </View>
        )}
        
        {battlePhase === 'result' && battleResult && (
          <View style={styles.phaseContainer}>
            <View style={[styles.resultIconContainer, battleResult.victory ? styles.victoryIcon : styles.defeatIcon]}>
              <Ionicons 
                name={battleResult.victory ? "trophy" : "skull"} 
                size={64} 
                color={battleResult.victory ? Colors.accent : Colors.error} 
              />
            </View>
            <Text style={battleResult.victory ? styles.victoryText : styles.defeatText}>
              {battleResult.victory ? '🎉 胜利！' : '💀 战败...'}
            </Text>
            
            <View style={styles.resultDetails}>
              <View style={styles.resultDetail}>
                <Text style={styles.resultDetailLabel}>实际胜率</Text>
                <Text style={styles.resultDetailValue}>{Math.round(battleResult.victoryChance * 100)}%</Text>
              </View>
              <View style={styles.resultDetail}>
                <Text style={styles.resultDetailLabel}>阵亡人数</Text>
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
                    <Text style={styles.choiceButtonText}>合并部落</Text>
                    <Text style={styles.choiceSubtext}>人口+50%</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.choiceButton}
                    onPress={() => handleResult('vassal')}
                  >
                    <Text style={styles.choiceButtonText}>收为附庸</Text>
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
                    <Text style={styles.choiceButtonText}>继续探索</Text>
                    <Text style={styles.choiceSubtext}>休养生息</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.choiceButton, styles.dangerButton]}
                    onPress={() => handleResult('end')}
                  >
                    <Text style={styles.choiceButtonText}>结束本轮</Text>
                    <Text style={styles.choiceSubtext}>保存实力</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Layout.padding,
    paddingBottom: 100,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
  },
  titleDecoration: {
    width: 100,
    height: 3,
    backgroundColor: Colors.accent,
    marginTop: 12,
    borderRadius: 2,
  },
  combatantsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
    gap: 12,
  },
  combatantBox: {
    backgroundColor: Colors.card,
    padding: 20,
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
    marginBottom: 16,
    gap: 8,
  },
  combatantIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  combatantStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 8,
  },
  combatantStat: {
    alignItems: 'center',
    flex: 1,
  },
  combatantStatValue: {
    color: Colors.accent,
    fontSize: 24,
    fontWeight: 'bold',
  },
  combatantStatLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
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
    width: 60,
  },
  vsLine: {
    width: 2,
    height: 20,
    backgroundColor: Colors.border.subtle,
  },
  vsBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryDark,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.accent,
  },
  vsText: {
    color: Colors.accent,
    fontSize: 18,
    fontWeight: 'bold',
  },
  phaseContainer: {
    backgroundColor: Colors.card,
    padding: 28,
    borderRadius: Layout.borderRadiusLarge,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    ...Colors.shadow.card,
  },
  chanceContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
  },
  chanceLabel: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginBottom: 8,
  },
  chanceValue: {
    color: Colors.accent,
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  chanceBar: {
    width: '100%',
    height: 8,
    backgroundColor: Colors.primaryDark,
    borderRadius: 4,
    overflow: 'hidden',
  },
  chanceProgress: {
    height: '100%',
    backgroundColor: Colors.accent,
    borderRadius: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
  },
  battleButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: Layout.borderRadius,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
  },
  primaryButton: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
    ...Colors.shadow.accent,
  },
  buttonIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  battleButtonText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  primaryButtonText: {
    color: '#000',
  },
  fightingIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 3,
    borderColor: Colors.accent,
    ...Colors.shadow.glow,
  },
  fightingText: {
    color: Colors.accent,
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  fightingAnimation: {
    marginTop: 12,
  },
  resultIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 4,
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
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  defeatText: {
    color: Colors.error,
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  resultDetails: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 24,
  },
  resultDetail: {
    alignItems: 'center',
    backgroundColor: Colors.primaryDark,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: Layout.borderRadius,
  },
  resultDetailLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginBottom: 4,
  },
  resultDetailValue: {
    color: Colors.accent,
    fontSize: 20,
    fontWeight: 'bold',
  },
  resultButtons: {
    gap: 12,
    width: '100%',
    marginTop: 8,
  },
  choiceButton: {
    backgroundColor: Colors.primary,
    padding: 18,
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
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  choiceSubtext: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
  loadingText: {
    color: Colors.text,
    fontSize: 18,
    textAlign: 'center',
    marginTop: 100,
  },
});
