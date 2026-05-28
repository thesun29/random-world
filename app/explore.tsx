import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useGameStore } from '@/store/useGameStore';
import ProgressBar from '@/components/ProgressBar';
import NotepadEvent from '@/components/NotepadEvent';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import ScalableView from '@/components/ScalableView';
import GufengIcon from '@/components/GufengIcons';
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
    <ScalableView style={styles.container} disableSafeArea={true}>
      {/* 吸顶状态栏 - 更紧凑 */}
      <View style={styles.stickyHeader}>
        {/* 顶部状态栏 */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <View style={styles.backButtonIcon}>
              <GufengIcon name="arrow-back" size={Layout.scale(14)} />
            </View>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.title}>探索中</Text>
            <View style={styles.raceStatusBadge}>
              <GufengIcon name="people" size={Layout.scale(9)} />
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

        {/* 资源显示 - 更紧凑 */}
        <View style={styles.resourcesBar}>
          {/* 人口 */}
          <View key="population" style={styles.resourceItem}>
            <GufengIcon name="people" size={Layout.scale(11)} />
            <Text style={styles.resourceValue}>{currentRun.population ?? 0}</Text>
          </View>
          {/* 战力 */}
          <View key="strength" style={styles.resourceItem}>
            <GufengIcon name="shield" size={Layout.scale(11)} />
            <Text style={styles.resourceValue}>{currentRun.totalStrength ?? 0}</Text>
          </View>
          {Object.entries(currentRun.inventory ?? {}).map(([key, value]) => (
            <View key={key} style={styles.resourceItem}>
              <GufengIcon 
                name={key === 'food' ? 'food' : key === 'water' ? 'water' : key === 'wood' ? 'wood' : 'stone'} 
                size={Layout.scale(11)} 
              />
              <Text style={styles.resourceValue}>
                {typeof value === 'number' ? value : '✓'}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* 记事本内容区域 */}
      <ScrollView 
        style={styles.notepadScrollView} 
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.notepadScrollContent}
      >
        <View style={styles.notepad}>
        {/* 开始标记 */}
        <View style={styles.startMarker}>
          <View style={styles.startMarkerIcon}>
            <GufengIcon name="play-circle" size={Layout.scale(30)} />
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
                  <GufengIcon name="skull" size={Layout.scale(40)} />
                </View>
                <Text style={[styles.completeTitle, { color: Colors.error }]}>族群灭亡！</Text>
                <Text style={styles.completeSubtitle}>所有族人都已死亡...</Text>
              </>
            ) : (
              <>
                <View style={styles.completeIconContainer}>
                  <GufengIcon name="trophy" size={Layout.scale(40)} />
                </View>
                <Text style={styles.completeTitle}>探索完成！</Text>
                <Text style={styles.completeSubtitle}>恭喜你完成了本次探索</Text>
              </>
            )}
            <TouchableOpacity style={styles.completeButton} onPress={handleComplete}>
              <Text style={styles.completeButtonText}>查看结果</Text>
              <GufengIcon name="arrow-forward" size={Layout.scale(16)} />
            </TouchableOpacity>
          </View>
        )}

        {/* 底部留白 */}
        <View style={styles.bottomPadding} />
        </View>
      </ScrollView>
    </ScalableView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  stickyHeader: {
    backgroundColor: Colors.backgroundLight,
    borderBottomWidth: 1,
    borderBottomColor: Colors.accent,
    zIndex: 10,
    paddingHorizontal: Layout.scale(16),
    paddingTop: Layout.scale(24),
    paddingBottom: Layout.scale(8),
    marginHorizontal: -Layout.scale(24),
    marginTop: -Layout.scale(24),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 0,
  },
  backButton: {
    padding: Layout.scale(1),
  },
  backButtonIcon: {
    width: Layout.scale(26),
    height: Layout.scale(26),
    borderRadius: Layout.borderRadiusSmall,
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border.subtle,
  },
  headerCenter: {
    alignItems: 'center',
    gap: Layout.scale(2),
  },
  title: {
    color: Colors.accent,
    fontSize: Layout.fontScale(14),
    fontWeight: 'bold',
  },
  raceStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    paddingHorizontal: Layout.scale(6),
    paddingVertical: Layout.scale(2),
    borderRadius: Layout.borderRadiusSmall,
    gap: Layout.scale(3),
    borderWidth: 1,
    borderColor: Colors.border.subtle,
  },
  raceStatus: {
    color: Colors.accent,
    fontSize: Layout.fontScale(9),
    fontWeight: '600',
  },
  placeholder: {
    width: Layout.scale(26),
  },
  progressSection: {
    paddingHorizontal: Layout.scale(8),
    paddingTop: 0,
    paddingBottom: 0,
  },
  resourcesBar: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    paddingHorizontal: Layout.scale(8),
    paddingBottom: 0,
    gap: Layout.scale(6),
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    paddingHorizontal: Layout.scale(8),
    paddingVertical: Layout.scale(4),
    borderRadius: Layout.borderRadiusSmall,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    gap: Layout.scale(3),
  },
  resourceValue: {
    color: Colors.accent,
    fontSize: Layout.fontScale(11),
    fontWeight: 'bold',
  },
  resourceKey: {
    color: Colors.textSecondary,
    fontSize: Layout.fontScale(9),
  },
  notepadScrollView: {
    flex: 1,
  },
  notepadScrollContent: {
    paddingRight: Layout.scale(8),
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
    paddingVertical: Layout.scale(20),
    gap: Layout.scale(12),
  },
  startMarkerIcon: {
    width: Layout.scale(40),
    height: Layout.scale(40),
    borderRadius: Layout.borderRadius,
    backgroundColor: Colors.backgroundLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.accent,
  },
  startText: {
    color: Colors.textSecondary,
    fontSize: Layout.fontScale(16),
    fontWeight: '600',
  },
  startMarkerLine: {
    width: Layout.scale(36),
    height: Layout.scale(2),
    backgroundColor: Colors.border.subtle,
  },
  completeSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Layout.scale(24),
    gap: Layout.scale(16),
  },
  completeIconContainer: {
    width: Layout.scale(80),
    height: Layout.scale(80),
    borderRadius: Layout.borderRadiusLarge,
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.accent,
    ...Colors.shadow.glow,
  },
  completeTitle: {
    color: Colors.accent,
    fontSize: Layout.fontScale(22),
    fontWeight: 'bold',
    textAlign: 'center',
  },
  completeSubtitle: {
    color: Colors.textMuted,
    fontSize: Layout.fontScale(14),
    textAlign: 'center',
  },
  completeButton: {
    flexDirection: 'row',
    backgroundColor: Colors.accent,
    paddingVertical: Layout.scale(14),
    paddingHorizontal: Layout.scale(28),
    borderRadius: Layout.borderRadiusLarge,
    alignItems: 'center',
    gap: Layout.scale(8),
    marginTop: Layout.scale(12),
    ...Colors.shadow.accent,
  },
  completeButtonText: {
    color: Colors.primaryDark,
    fontSize: Layout.fontScale(16),
    fontWeight: 'bold',
  },
  bottomPadding: {
    height: Layout.scale(24),
  },
});
