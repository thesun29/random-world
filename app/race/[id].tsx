import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useGameStore } from '@/store/useGameStore';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import ScalableView from '@/components/ScalableView';
import { getRaceById, RACES } from '@/utils/races';
import { TribeData } from '@/types';

// 临时部落数据，用于演示
const DEMO_TRIBE_NAMES = [
  '焰翼部落', '石拳氏族', '月影战士', '雷电猎手', '风暴守护',
  '森林守卫', '沙漠行者', '冰霜之子', '火焰使者', '暗影猎手',
  '光明骑士', '暗夜刺客', '暴风战士', '大地守卫', '海洋守护者',
  '火焰之怒', '雷霆之锤', '冰雪之王', '森林之灵', '沙漠之狐'
];

const DEMO_TRIBE_ICONS = [
  'flame', 'hammer', 'moon', 'flash', 'cloudy',
  'leaf', 'sunny', 'snow', 'fire', 'eye',
  'shield', 'skull', 'thunderstorm', 'globe', 'water',
  'bonfire', 'flashlight', 'snow', 'flower', 'paw'
];

const generateDemoTribes = (): TribeData[] => {
  const playerTribe: TribeData = {
    id: 'player_tribe',
    name: '我的部落',
    icon: 'people',
    population: 50,
    strength: 300,
    status: 'neutral',
    discovered: true,
    vassals: [],
  };

  const tribes: TribeData[] = [playerTribe];

  // 先生成所有部落
  const statuses: ('friendly' | 'neutral' | 'enemy' | 'unknown' | 'defeated' | 'vassal')[] = 
    ['unknown', 'neutral', 'enemy', 'friendly', 'defeated'];

  for (let i = 0; i < 15; i++) {
    const status = statuses[i % statuses.length];
    tribes.push({
      id: `tribe_${i}`,
      name: DEMO_TRIBE_NAMES[i % DEMO_TRIBE_NAMES.length],
      icon: DEMO_TRIBE_ICONS[i % DEMO_TRIBE_ICONS.length],
      population: Math.floor(Math.random() * 100) + 10,
      strength: Math.floor(Math.random() * 500) + 50,
      status,
      discovered: status !== 'unknown',
      vassals: [],
    });
  }

  // 随机生成附庸关系（大约30%的部落会有附庸）
  for (let i = 1; i < tribes.length; i++) {
    if (Math.random() < 0.3) {
      // 随机选择一个宗主（不能是自己）
      let overlordIndex;
      do {
        overlordIndex = Math.floor(Math.random() * tribes.length);
      } while (overlordIndex === i);
      
      const overlord = tribes[overlordIndex];
      const vassal = tribes[i];
      
      // 设置附庸关系
      if (!overlord.vassals) overlord.vassals = [];
      overlord.vassals.push(vassal.id);
      vassal.overlord = overlord.id;
      
      // 如果宗主被发现了，附庸的状态也显示为附庸
      if (overlord.discovered) {
        vassal.status = 'vassal';
        vassal.discovered = true;
      }
    }
  }

  return tribes;
};

export default function RaceDetailScreen() {
  const { id } = useLocalSearchParams();
  const { currentRun, player } = useGameStore();
  const [tribes, setTribes] = useState<TribeData[]>([]);
  const raceId = Array.isArray(id) ? id[0] : id;
  const race = getRaceById(raceId);

  useEffect(() => {
    if (currentRun?.allTribes && currentRun.allTribes.length > 0) {
      setTribes(currentRun.allTribes);
    } else {
      // 如果没有运行中的游戏，使用示例数据
      setTribes(generateDemoTribes());
    }
  }, [currentRun]);

  if (!race) {
    return (
      <ScalableView style={styles.container}>
        <Text style={styles.errorText}>种族不存在</Text>
      </ScalableView>
    );
  }

  const playerTribe = tribes[0];
  const otherTribes = tribes.slice(1);

  const getTribeStyle = (tribe: TribeData) => {
    if (!tribe.discovered || tribe.status === 'unknown') {
      return { nameColor: Colors.textMuted, opacity: 0.7 };
    }
    switch (tribe.status) {
      case 'friendly':
        return { nameColor: Colors.success, opacity: 1 };
      case 'neutral':
        return { nameColor: Colors.text, opacity: 1 };
      case 'enemy':
        return { nameColor: Colors.error, opacity: 1 };
      case 'defeated':
        return { nameColor: Colors.textMuted, opacity: 0.5 };
      case 'vassal':
        return { nameColor: Colors.accent, opacity: 1 };
      default:
        return { nameColor: Colors.text, opacity: 1 };
    }
  };

  const getTribeIcon = (tribe: TribeData) => {
    if (!tribe.discovered || tribe.status === 'unknown') {
      return 'help-circle';
    }
    if (tribe.status === 'vassal') {
      return 'checkmark-circle';
    }
    return tribe.icon;
  };

  const getTribeName = (tribe: TribeData) => {
    if (!tribe.discovered || tribe.status === 'unknown') {
      return '???';
    }
    return tribe.name;
  };

  const renderTribeItem = (tribe: TribeData, index: number, isPlayerTribe = false) => {
    const style = getTribeStyle(tribe);
    const isVassal = tribe.status === 'vassal';
    const overlord = tribe.overlord ? tribes.find(t => t.id === tribe.overlord) : null;
    
    return (
      <View key={tribe.id} style={[styles.tribeItem, { opacity: style.opacity }]}>
        <View style={styles.tribeLeft}>
          <View style={[styles.tribeIconContainer]}>
            <Ionicons 
              name={getTribeIcon(tribe) as any} 
              size={Layout.scale(24)} 
              color={isVassal ? Colors.success : Colors.accent} 
            />
          </View>
          <View style={styles.tribeInfo}>
            <Text style={[styles.tribeName, { color: style.nameColor }]}>
              {getTribeName(tribe)}
              {isPlayerTribe && <Text style={styles.playerTribeTag}> (自己)</Text>}
            </Text>
            
            {/* 显示宗主关系 */}
            {tribe.overlord && overlord && (
              <Text style={styles.overlordText}>
                臣服于: {overlord.discovered ? overlord.name : '???'}
              </Text>
            )}
            
            {tribe.discovered && tribe.status !== 'unknown' && (
              <View style={styles.tribeStats}>
                <Text style={styles.tribeStat}>
                  <Ionicons name="people" size={Layout.scale(14)} color={Colors.textMuted} />
                  {' '}{tribe.population}
                </Text>
                <Text style={styles.tribeStat}>
                  <Ionicons name="shield" size={Layout.scale(14)} color={Colors.textMuted} />
                  {' '}{tribe.strength}
                </Text>
              </View>
            )}
            
            {/* 显示附庸部落 */}
            {tribe.vassals && tribe.vassals.length > 0 && (
              <View style={styles.vassalsList}>
                <Text style={styles.vassalsLabel}>附庸: </Text>
                {tribe.vassals.map((vassalId, idx) => {
                  const vassal = tribes.find(t => t.id === vassalId);
                  if (!vassal) return null;
                  return (
                    <Text key={vassalId} style={styles.vassalTag}>
                      {vassal.discovered ? vassal.name : '???'}
                      {idx < tribe.vassals!.length - 1 ? ', ' : ''}
                    </Text>
                  );
                })}
              </View>
            )}
          </View>
        </View>
        {tribe.status !== 'unknown' && (
          <View style={[styles.statusBadge, styles[`statusBadge_${tribe.status}`]]}>
            <Text style={styles.statusText}>
              {tribe.status === 'friendly' && '友好'}
              {tribe.status === 'neutral' && '中立'}
              {tribe.status === 'enemy' && '敌对'}
              {tribe.status === 'defeated' && '已消灭'}
              {tribe.status === 'vassal' && '附庸'}
            </Text>
          </View>
        )}
      </View>
    );
  };

  if (tribes.length === 0) {
    return (
      <ScalableView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={Layout.scale(24)} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>部落列表</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.accent} />
          <Text style={styles.loadingText}>正在加载部落数据...</Text>
          <Text style={styles.subText}>开始新游戏即可生成部落</Text>
        </View>
      </ScalableView>
    );
  }

  return (
    <ScalableView style={styles.container} scrollable>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={Layout.scale(24)} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>部落列表 ({tribes.length})</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        {/* 玩家部落 */}
        {playerTribe && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>我的部落</Text>
            <View style={styles.tribeList}>
              {renderTribeItem(playerTribe, 0, true)}
            </View>
          </View>
        )}

        {/* 其他部落 */}
        {otherTribes.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>其他部落 ({otherTribes.length})</Text>
            <View style={styles.tribeList}>
              {otherTribes.map((tribe, index) => renderTribeItem(tribe, index))}
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
  errorText: {
    color: Colors.text,
    fontSize: Layout.fontScale(18),
    textAlign: 'center',
    marginTop: Layout.scale(100),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Layout.scale(20),
  },
  loadingText: {
    color: Colors.text,
    fontSize: Layout.fontScale(16),
    marginTop: Layout.scale(16),
    textAlign: 'center',
  },
  subText: {
    color: Colors.textMuted,
    fontSize: Layout.fontScale(14),
    marginTop: Layout.scale(8),
    textAlign: 'center',
  },
  section: {
    marginBottom: Layout.scale(24),
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: Layout.fontScale(18),
    fontWeight: 'bold',
    marginBottom: Layout.scale(12),
  },
  tribeList: {
    backgroundColor: Colors.card,
    borderRadius: Layout.borderRadius,
    ...Layout.shadow,
  },
  tribeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Layout.scale(16),
    borderBottomWidth: 1,
    borderBottomColor: Colors.primaryLight,
  },
  tribeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  tribeIconContainer: {
    width: Layout.scale(48),
    height: Layout.scale(48),
    backgroundColor: Colors.primaryLight,
    borderRadius: Layout.scale(24),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Layout.scale(12),
  },
  tribeInfo: {
    flex: 1,
  },
  tribeName: {
    fontSize: Layout.fontScale(16),
    fontWeight: 'bold',
    marginBottom: Layout.scale(4),
  },
  playerTribeTag: {
    color: Colors.accent,
    fontSize: Layout.fontScale(12),
  },
  tribeStats: {
    flexDirection: 'row',
    gap: Layout.scale(16),
  },
  tribeStat: {
    color: Colors.textMuted,
    fontSize: Layout.fontScale(14),
  },
  statusBadge: {
    paddingHorizontal: Layout.scale(10),
    paddingVertical: Layout.scale(4),
    borderRadius: Layout.scale(12),
    alignSelf: 'flex-start',
  },
  statusBadge_unknown: {
    backgroundColor: Colors.primaryLight,
  },
  statusBadge_friendly: {
    backgroundColor: Colors.success + '30',
  },
  statusBadge_neutral: {
    backgroundColor: Colors.primaryLight,
  },
  statusBadge_enemy: {
    backgroundColor: Colors.error + '30',
  },
  statusBadge_defeated: {
    backgroundColor: Colors.textMuted + '30',
  },
  statusBadge_vassal: {
    backgroundColor: Colors.success + '30',
  },
  statusText: {
    color: Colors.text,
    fontSize: Layout.fontScale(12),
    fontWeight: '600',
  },
  vassalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.scale(6),
    marginBottom: Layout.scale(8),
  },
  vassalTitle: {
    color: Colors.text,
    fontSize: Layout.fontScale(14),
  },
  vassalList: {
    backgroundColor: Colors.card,
    borderRadius: Layout.borderRadius,
    padding: Layout.scale(16),
    ...Layout.shadow,
  },
  vassalName: {
    color: Colors.success,
    fontSize: Layout.fontScale(14),
    marginBottom: Layout.scale(4),
  },
  overlordText: {
    color: Colors.textMuted,
    fontSize: Layout.fontScale(12),
    fontStyle: 'italic',
    marginBottom: Layout.scale(4),
  },
  vassalsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginTop: Layout.scale(4),
  },
  vassalsLabel: {
    color: Colors.textMuted,
    fontSize: Layout.fontScale(12),
  },
  vassalTag: {
    color: Colors.success,
    fontSize: Layout.fontScale(12),
  },
});
