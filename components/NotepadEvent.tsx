import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GameEvent, EventHistoryItem } from '@/types';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';

interface NotepadEventProps {
  event: GameEvent;
  isCurrent: boolean;
  historyItem?: EventHistoryItem;
  onChoice?: (choiceId: string) => void;
}

const NotepadEvent: React.FC<NotepadEventProps> = ({
  event,
  isCurrent,
  historyItem,
  onChoice,
}) => {
  const getTypeColor = () => {
    switch (event.type) {
      case 'epic':
        return Colors.accent;
      case 'rare':
        return Colors.info;
      default:
        return Colors.textSecondary;
    }
  };

  const getTypeLabel = () => {
    switch (event.type) {
      case 'epic':
        return '✦ 史诗';
      case 'rare':
        return '◆ 稀有';
      default:
        return '● 普通';
    }
  };

  const hasSingleChoice = event.choices.length === 1;

  return (
    <View style={[styles.container, historyItem && styles.historyContainer]}>
      {/* 事件标题栏 */}
      <View style={styles.header}>
        <View style={[styles.typeBadge, { backgroundColor: getTypeColor() + '20', borderColor: getTypeColor() }]}>
          <Text style={[styles.typeLabel, { color: getTypeColor() }]}>
            {getTypeLabel()}
          </Text>
        </View>
        {!isCurrent && historyItem && (
          <View style={styles.completedBadge}>
            <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
          </View>
        )}
      </View>
      <Text style={styles.title}>{event.title}</Text>

      {/* 事件描述 */}
      <Text style={styles.description}>{event.description}</Text>

      {/* 如果是历史事件，显示选择和结果 */}
      {historyItem ? (
        <View style={styles.historyContent}>
          <View style={styles.choiceSelected}>
            <View style={styles.choiceArrow}>
              <Ionicons name="arrow-forward" size={16} color={Colors.accent} />
            </View>
            <Text style={styles.choiceText}>你选择了: {historyItem.selectedChoiceText}</Text>
          </View>
          <View style={styles.resultBox}>
            <View style={styles.resultIcon}>
              <Ionicons name="chatbubble-ellipses" size={16} color={Colors.accent} />
            </View>
            <Text style={styles.resultText}>{historyItem.resultText}</Text>
          </View>
          
          {/* 获得的资源 */}
          {Object.keys(historyItem.resourcesGained).length > 0 && (
            <View style={styles.gainedResourcesContainer}>
              <View style={styles.gainedResourcesHeader}>
                <Ionicons name="gift" size={16} color={Colors.accent} />
                <Text style={styles.gainedResourcesTitle}>获得资源</Text>
              </View>
              <View style={styles.gainedResourcesList}>
                {Object.entries(historyItem.resourcesGained).map(([key, value]) => (
                  <View key={key} style={styles.gainedResourceItem}>
                    <Ionicons 
                      name={getResourceIcon(key)} 
                      size={16} 
                      color={Colors.accent} 
                    />
                    <Text style={styles.gainedResourceText}>
                      +{value} {getFriendlyResourceName(key)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* 获得的进度 */}
          {historyItem.progressGained > 0 && (
            <View style={styles.progressGainedContainer}>
              <Ionicons name="trending-up" size={16} color={Colors.info} />
              <Text style={styles.progressGainedText}>
                探索进度 +{historyItem.progressGained}%
              </Text>
            </View>
          )}

          {/* 解锁的系统 */}
          {historyItem.systemUnlocked && historyItem.systemUnlocked.length > 0 && (
            <View style={styles.systemUnlockedContainer}>
              <Ionicons name="key" size={16} color={Colors.success} />
              <Text style={styles.systemUnlockedText}>
                解锁系统: {historyItem.systemUnlocked.map(sys => getFriendlySystemName(sys)).join(', ')}
              </Text>
            </View>
          )}

          {/* 种族进化 */}
          {historyItem.raceEvolved && (
            <View style={styles.raceEvolvedContainer}>
              <Ionicons name="trophy" size={16} color={Colors.accent} />
              <Text style={styles.raceEvolvedText}>
                种族进化: {getFriendlyRaceName(historyItem.raceEvolved)}
              </Text>
            </View>
          )}

          {/* 人口变化 */}
          {historyItem.populationChange !== undefined && historyItem.populationChange !== 0 && (
            <View style={styles.populationChangeContainer}>
              <Ionicons 
                name="people" 
                size={16} 
                color={(historyItem.populationChange ?? 0) > 0 ? Colors.success : Colors.error} 
              />
              <Text style={[
                styles.populationChangeText, 
                { color: (historyItem.populationChange ?? 0) > 0 ? Colors.success : Colors.error }
              ]}>
                {(historyItem.populationChange ?? 0) > 0 ? '+' : ''}{historyItem.populationChange} 人口
              </Text>
            </View>
          )}

          {/* 战力变化 */}
          {historyItem.strengthChange !== undefined && historyItem.strengthChange !== 0 && (
            <View style={styles.strengthChangeContainer}>
              <Ionicons 
                name="shield-checkmark" 
                size={16} 
                color={(historyItem.strengthChange ?? 0) > 0 ? Colors.success : Colors.error} 
              />
              <Text style={[
                styles.strengthChangeText, 
                { color: (historyItem.strengthChange ?? 0) > 0 ? Colors.success : Colors.error }
              ]}>
                {(historyItem.strengthChange ?? 0) > 0 ? '+' : ''}{historyItem.strengthChange} 战力
              </Text>
            </View>
          )}
        </View>
      ) : (
        /* 如果是当前事件且有选项，显示选项 */
        isCurrent && onChoice && (
          <View style={styles.choicesContainer}>
            {event.choices.map((choice) => (
              <TouchableOpacity
                key={choice.id}
                style={[
                  styles.choiceButton,
                  hasSingleChoice && styles.singleChoiceButton,
                ]}
                onPress={() => onChoice(choice.id)}
                activeOpacity={0.7}
              >
                <View style={styles.choiceIconContainer}>
                  <Ionicons 
                    name={hasSingleChoice ? "arrow-forward-circle" : "radio-button-off"} 
                    size={20} 
                    color={Colors.accent} 
                  />
                </View>
                <Text style={styles.choiceButtonText}>{choice.text}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )
      )}
    </View>
  );
};

// 辅助函数：获取资源图标
const getResourceIcon = (key: string): keyof typeof Ionicons.glyphMap => {
  const iconMap: { [key: string]: keyof typeof Ionicons.glyphMap } = {
    food: 'restaurant',
    water: 'water',
    wood: 'leaf',
    stone: 'cube',
  };
  return iconMap[key] || 'ellipse';
};

// 辅助函数：友好的资源名称
const getFriendlyResourceName = (key: string): string => {
  const nameMap: { [key: string]: string } = {
    food: '食物',
    water: '水',
    wood: '木材',
    stone: '石材',
  };
  return nameMap[key] || key;
};

// 辅助函数：友好的系统名称
const getFriendlySystemName = (key: string): string => {
  const nameMap: { [key: string]: string } = {
    dishes: '菜品',
    secrets: '秘术',
    beasts: '异兽',
    weapons: '神兵',
    building: '修建',
    arrays: '阵界',
    empire: '皇朝',
  };
  return nameMap[key] || key;
};

// 辅助函数：友好的种族名称
const getFriendlyRaceName = (key: string): string => {
  const nameMap: { [key: string]: string } = {
    ape: '未开化猿人',
    tribe: '部落居民',
    civilization: '文明国度',
  };
  return nameMap[key] || key;
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderRadius: Layout.borderRadiusLarge,
    padding: 18,
    marginVertical: 10,
    borderLeftWidth: 4,
    borderLeftColor: Colors.accent,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    ...Colors.shadow.card,
  },
  historyContainer: {
    opacity: 0.95,
    borderLeftColor: Colors.textMuted,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Layout.borderRadiusSmall,
    borderWidth: 1,
  },
  typeLabel: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  completedBadge: {
    marginLeft: 'auto',
  },
  title: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    color: Colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 14,
  },
  historyContent: {
    marginTop: 6,
  },
  choiceSelected: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  choiceArrow: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  choiceText: {
    color: Colors.accent,
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  resultBox: {
    backgroundColor: Colors.primaryDark,
    padding: 14,
    borderRadius: Layout.borderRadiusSmall,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  resultIcon: {
    marginTop: 2,
  },
  resultText: {
    color: Colors.text,
    fontSize: 15,
    lineHeight: 22,
    fontStyle: 'italic',
    flex: 1,
  },
  gainedResourcesContainer: {
    marginBottom: 12,
    backgroundColor: Colors.primaryLight,
    padding: 12,
    borderRadius: Layout.borderRadiusSmall,
  },
  gainedResourcesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  gainedResourcesTitle: {
    color: Colors.accent,
    fontSize: 14,
    fontWeight: 'bold',
  },
  gainedResourcesList: {
    gap: 6,
  },
  gainedResourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  gainedResourceText: {
    color: Colors.text,
    fontSize: 14,
  },
  progressGainedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
    backgroundColor: Colors.info + '15',
    padding: 10,
    borderRadius: Layout.borderRadiusSmall,
  },
  progressGainedText: {
    color: Colors.info,
    fontSize: 14,
    fontWeight: '600',
  },
  systemUnlockedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
    backgroundColor: Colors.success + '15',
    padding: 10,
    borderRadius: Layout.borderRadiusSmall,
  },
  systemUnlockedText: {
    color: Colors.success,
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  raceEvolvedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
    backgroundColor: Colors.accent + '15',
    padding: 10,
    borderRadius: Layout.borderRadiusSmall,
  },
  raceEvolvedText: {
    color: Colors.accent,
    fontSize: 14,
    fontWeight: 'bold',
    flex: 1,
  },
  populationChangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
    backgroundColor: Colors.primaryLight,
    padding: 10,
    borderRadius: Layout.borderRadiusSmall,
  },
  populationChangeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  strengthChangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primaryLight,
    padding: 10,
    borderRadius: Layout.borderRadiusSmall,
  },
  strengthChangeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  choicesContainer: {
    marginTop: 8,
    gap: 10,
  },
  choiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: Layout.borderRadius,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
  },
  choiceIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primaryDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  singleChoiceButton: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accent + '20',
    ...Colors.shadow.accent,
  },
  choiceButtonText: {
    flex: 1,
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
});

export default NotepadEvent;
