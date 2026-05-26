import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useGameStore } from '@/store/useGameStore';
import ProgressBar from '@/components/ProgressBar';
import NotepadEvent from '@/components/NotepadEvent';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import ScalableView from '@/components/ScalableView';
import { generateEventByProgress } from '@/utils/events';
import { getRaceById } from '@/utils/races';
import { GameEvent, EventHistoryItem } from '@/types';

export default function ExploreScreen() {
  const { 
    currentRun, 
    makeChoice, 
    endRun, 
    eventHistory, 
    addEventToHistory,
    setIsBattleActive
  } = useGameStore();
  const [currentEvent, setCurrentEvent] = useState<GameEvent | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // 初始化第一个事件
  useEffect(() => {
    if (!currentRun) {
      router.replace('/home');
      return;
    }

    // 检查人口是否为0，游戏结束
    if (currentRun.population <= 0 && !isComplete) {
      setIsComplete(true);
      return;
    }

    if (currentRun.progress >= 100 && !isComplete) {
      setIsComplete(true);
      return;
    }

    // 只有当没有当前事件且没有历史记录或历史记录最后一个已处理时才生成新事件
    if (!currentEvent && eventHistory.length === 0) {
      const event = generateEventByProgress(currentRun.progress, eventHistory);
      setCurrentEvent(event);
    }
  }, [currentRun, currentRun?.population]);

  // 监听历史记录变化，生成下一个事件
  useEffect(() => {
    if (currentRun && currentRun.progress < 100 && !currentEvent) {
      const timer = setTimeout(() => {
        const event = generateEventByProgress(currentRun.progress, eventHistory);
        setCurrentEvent(event);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [eventHistory.length, currentRun]);

  // 滚动到底部
  useEffect(() => {
    if (scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [eventHistory.length, currentEvent]);

  // 检查探索是否完成
  useEffect(() => {
    if (currentRun && currentRun.progress >= 100 && !isComplete) {
      setIsComplete(true);
    }
  }, [currentRun?.progress]);

  const handleChoice = (choiceId: string) => {
    if (!currentEvent || !currentRun) return;

    // 找到选择的选项
    const choice = currentEvent.choices.find(c => c.id === choiceId);
    console.log('Choice found:', choice);
    if (!choice) return;
    
    // 检查是否是战斗选项
    if (choice.isBattle) {
      setIsBattleActive(true);
      router.push('/battle');
      return;
    }

    // 直接从 choice 中获取固定资源和系统
    const resourcesGained = { ...choice.resources };
    console.log('Resources gained:', resourcesGained);
    
    // 计算进度（这里得调用一次 effect 来获取进度）
    const effect = choice.effect(currentRun);
    const progressGained = (effect.progress || currentRun.progress) - currentRun.progress;
    console.log('Progress gained:', progressGained);
    
    // 获取系统解锁和种族进化
    const systemUnlocked = choice.systemToUnlock ? [...choice.systemToUnlock] : undefined;
    const raceEvolved = choice.raceToEvolve;

    // 创建历史记录项
    const historyItem: EventHistoryItem = {
      id: `${Date.now()}-${currentEvent.id}`,
      event: currentEvent,
      selectedChoiceId: choiceId,
      selectedChoiceText: choice.text,
      resultText: choice.resultText,
      resourcesGained,
      progressGained,
      systemUnlocked,
      raceEvolved,
      populationChange: choice.populationChange,
      strengthChange: choice.strengthChange,
      timestamp: Date.now(),
    };
    console.log('HistoryItem created:', historyItem);

    // 添加到历史记录
    addEventToHistory(historyItem);

    // 应用效果
    makeChoice(choiceId, currentEvent);

    // 清空当前事件
    setCurrentEvent(null);
  };

  const handleComplete = () => {
    endRun();
    router.replace('/settlement');
  };

  if (!currentRun) {
    return null;
  }

  const currentRace = getRaceById(currentRun.currentRace);

  return (
    <ScalableView style={styles.container} scrollable scrollViewProps={{ ref: scrollViewRef }}>
      {/* 顶部状态栏 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <View style={styles.backButtonIcon}>
            <Ionicons name="arrow-back" size={Layout.scale(22)} color={Colors.text} />
          </View>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.title}>探索中</Text>
          <View style={styles.raceStatusBadge}>
            <Ionicons name="people" size={Layout.scale(12)} color={Colors.accent} />
            <Text style={styles.raceStatus}>
              {currentRace?.name || '未开化猿人'}
            </Text>
          </View>
        </View>
        <View style={styles.placeholder} />
      </View>

      {/* 进度条 */}
      <View style={styles.progressSection}>
        <ProgressBar progress={currentRun.progress ?? 0} showText={true} />
      </View>

      {/* 资源显示 */}
      <View style={styles.resourcesBar}>
        {/* 人口 */}
        <View key="population" style={styles.resourceItem}>
          <View style={styles.resourceIconContainer}>
            <Ionicons name="people" size={Layout.scale(18)} color={Colors.accent} />
          </View>
          <Text style={styles.resourceValue}>{currentRun.population ?? 0}</Text>
          <Text style={styles.resourceKey}>人口</Text>
        </View>
        {/* 战力 */}
        <View key="strength" style={styles.resourceItem}>
          <View style={styles.resourceIconContainer}>
            <Ionicons name="shield-checkmark" size={Layout.scale(18)} color={Colors.accent} />
          </View>
          <Text style={styles.resourceValue}>{currentRun.totalStrength ?? 0}</Text>
          <Text style={styles.resourceKey}>战力</Text>
        </View>
        {Object.entries(currentRun.inventory ?? {}).map(([key, value]) => (
          <View key={key} style={styles.resourceItem}>
            <View style={styles.resourceIconContainer}>
              <Ionicons 
                name={key === 'food' ? 'restaurant' : key === 'water' ? 'water' : key === 'wood' ? 'leaf' : 'cube'} 
                size={Layout.scale(18)} 
                color={Colors.accent} 
              />
            </View>
            <Text style={styles.resourceValue}>
              {typeof value === 'number' ? value : '✓'}
            </Text>
            <Text style={styles.resourceKey}>{key}</Text>
          </View>
        ))}
      </View>

      {/* 记事本内容区域 */}
      <View style={styles.notepad}>
        {/* 开始标记 */}
        <View style={styles.startMarker}>
          <View style={styles.startMarkerIcon}>
            <Ionicons name="play-circle" size={Layout.scale(28)} color={Colors.accent} />
          </View>
          <Text style={styles.startText}>探索开始</Text>
          <View style={styles.startMarkerLine} />
        </View>

        {/* 历史事件 */}
        {eventHistory.map((item) => (
          <NotepadEvent
            key={item.id}
            event={item.event}
            isCurrent={false}
            historyItem={item}
          />
        ))}

        {/* 当前事件 */}
        {currentEvent && !isComplete && (
          <NotepadEvent
            event={currentEvent}
            isCurrent={true}
            onChoice={handleChoice}
          />
        )}

        {/* 探索完成 */}
        {isComplete && (
          <View style={styles.completeSection}>
            {currentRun?.population <= 0 ? (
              <>
                <View style={styles.completeIconContainer}>
                  <Ionicons name="skull" size={Layout.scale(56)} color={Colors.error} />
                </View>
                <Text style={[styles.completeTitle, { color: Colors.error }]}>族群灭亡！</Text>
                <Text style={styles.completeSubtitle}>所有族人都已死亡...</Text>
              </>
            ) : (
              <>
                <View style={styles.completeIconContainer}>
                  <Ionicons name="trophy" size={Layout.scale(56)} color={Colors.accent} />
                </View>
                <Text style={styles.completeTitle}>探索完成！</Text>
                <Text style={styles.completeSubtitle}>恭喜你完成了本次探索</Text>
              </>
            )}
            <TouchableOpacity style={styles.completeButton} onPress={handleComplete}>
              <Text style={styles.completeButtonText}>查看结果</Text>
              <Ionicons name="arrow-forward" size={Layout.scale(20)} color={Colors.primaryDark} />
            </TouchableOpacity>
          </View>
        )}

        {/* 底部留白 */}
        <View style={styles.bottomPadding} />
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
    paddingBottom: Layout.scale(10),
  },
  backButton: {
    padding: Layout.scale(4),
  },
  backButtonIcon: {
    width: Layout.scale(40),
    height: Layout.scale(40),
    borderRadius: Layout.borderRadiusXLarge,
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    ...Colors.shadow.card,
  },
  headerCenter: {
    alignItems: 'center',
    gap: Layout.scale(4),
  },
  title: {
    color: Colors.accent,
    fontSize: Layout.fontScale(22),
    fontWeight: 'bold',
  },
  raceStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Layout.scale(10),
    paddingVertical: Layout.scale(4),
    borderRadius: Layout.borderRadius,
    gap: Layout.scale(4),
  },
  raceStatus: {
    color: Colors.accent,
    fontSize: Layout.fontScale(12),
    fontWeight: '600',
  },
  placeholder: {
    width: Layout.scale(40),
  },
  progressSection: {
    paddingHorizontal: Layout.padding,
    marginBottom: Layout.scale(12),
  },
  resourcesBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Layout.padding,
    gap: Layout.scale(8),
    marginBottom: Layout.scale(12),
  },
  resourceItem: {
    alignItems: 'center',
    backgroundColor: Colors.card,
    paddingHorizontal: Layout.scale(14),
    paddingVertical: Layout.scale(8),
    borderRadius: Layout.borderRadius,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    gap: Layout.scale(4),
  },
  resourceIconContainer: {
    marginBottom: Layout.scale(2),
  },
  resourceValue: {
    color: Colors.accent,
    fontSize: Layout.fontScale(16),
    fontWeight: 'bold',
  },
  resourceKey: {
    color: Colors.textSecondary,
    fontSize: Layout.fontScale(11),
  },
  notepad: {
    flex: 1,
  },
  notepadContent: {
    paddingHorizontal: Layout.padding,
    paddingTop: Layout.scale(10),
  },
  startMarker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Layout.scale(24),
    gap: Layout.scale(12),
  },
  startMarkerIcon: {
    width: Layout.scale(48),
    height: Layout.scale(48),
    borderRadius: Layout.borderRadiusXLarge,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: Layout.scale(2),
    borderColor: Colors.accent,
  },
  startText: {
    color: Colors.textSecondary,
    fontSize: Layout.fontScale(18),
    fontWeight: '600',
  },
  startMarkerLine: {
    width: Layout.scale(40),
    height: Layout.scale(2),
    backgroundColor: Colors.border.subtle,
  },
  completeSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Layout.scale(48),
    gap: Layout.scale(20),
  },
  completeIconContainer: {
    width: Layout.scale(100),
    height: Layout.scale(100),
    borderRadius: Layout.scale(50),
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: Layout.scale(3),
    borderColor: Colors.accent,
    ...Colors.shadow.glow,
  },
  completeTitle: {
    color: Colors.accent,
    fontSize: Layout.fontScale(28),
    fontWeight: 'bold',
  },
  completeSubtitle: {
    color: Colors.textMuted,
    fontSize: Layout.fontScale(16),
    marginTop: Layout.scale(8),
  },
  completeButton: {
    flexDirection: 'row',
    backgroundColor: Colors.accent,
    paddingVertical: Layout.scale(16),
    paddingHorizontal: Layout.scale(32),
    borderRadius: Layout.borderRadiusLarge,
    alignItems: 'center',
    gap: Layout.scale(10),
    marginTop: Layout.scale(16),
    ...Colors.shadow.accent,
  },
  completeButtonText: {
    color: Colors.primaryDark,
    fontSize: Layout.fontScale(18),
    fontWeight: 'bold',
  },
  bottomPadding: {
    height: Layout.scale(48),
  },
});
