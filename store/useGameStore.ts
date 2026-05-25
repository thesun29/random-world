import { create } from 'zustand';
import { Player, RunData, GameEvent, EventHistoryItem, TribeData } from '@/types';
import { loadPlayer, savePlayer } from '@/utils/storage';
import { calculateStrength } from '@/utils/races';

const TRIBE_NAMES = [
  '焰翼部落', '石拳氏族', '月影战士', '雷电猎手', '风暴守护',
  '森林守卫', '沙漠行者', '冰霜之子', '火焰使者', '暗影猎手',
  '光明骑士', '暗夜刺客', '暴风战士', '大地守卫', '海洋守护者',
  '火焰之怒', '雷霆之锤', '冰雪之王', '森林之灵', '沙漠之狐',
  '山脉之鹰', '深渊之蛇', '天空之龙', '地狱之犬', '天使之翼',
  '恶魔之爪', '精灵之歌', '矮人之力', '兽人之战', '人类之勇'
];

const TRIBE_ICONS = [
  'flame', 'hammer', 'moon', 'flash', 'cloudy',
  'leaf', 'sunny', 'snow', 'fire', 'eye',
  'shield', 'skull', 'thunderstorm', 'globe', 'water',
  'bonfire', 'flashlight', 'snow', 'flower', 'paw',
  'rocket', 'fish', 'cloud', 'heart', 'star',
  'bug', 'rose', 'cube', 'paw', 'people'
];

const generateRandomTribes = (count: number, playerTribe: TribeData): TribeData[] => {
  const tribes: TribeData[] = [playerTribe];
  
  // 先生成所有部落
  for (let i = 0; i < count; i++) {
    const nameIndex = i % TRIBE_NAMES.length;
    const iconIndex = i % TRIBE_ICONS.length;
    const population = Math.floor(Math.random() * 100) + 10;
    const strength = Math.floor(Math.random() * 500) + 50;
    
    tribes.push({
      id: `tribe_${i}`,
      name: TRIBE_NAMES[nameIndex],
      icon: TRIBE_ICONS[iconIndex],
      population,
      strength,
      status: 'unknown',
      discovered: false,
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

interface GameState {
  player: Player | null;
  currentRun: RunData | null;
  eventHistory: EventHistoryItem[];
  currentEvent: GameEvent | null;
  isBattleActive: boolean;
  setPlayer: (player: Player | null) => void;
  loadSavedPlayer: () => Promise<void>;
  startNewRun: () => void;
  makeChoice: (choiceId: string, event: GameEvent) => void;
  endRun: () => void;
  addEventToHistory: (historyItem: EventHistoryItem) => void;
  setCurrentEvent: (event: GameEvent | null) => void;
  setIsBattleActive: (active: boolean) => void;
}

const initialPlayer: Player = {
  id: 'player1',
  name: '造物主',
  worldData: {
    resources: {
      food: 0,
      water: 0,
      wood: 0,
      stone: 0,
    },
    unlockedRaces: ['ape'],
    racePopulations: {
      ape: 10,
    },
    unlockedTribes: [],
  },
  unlockedSystems: [],
};

export const useGameStore = create<GameState>((set, get) => ({
  player: null,
  currentRun: null,
  eventHistory: [],
  currentEvent: null,
  isBattleActive: false,

  setPlayer: (player) => set({ player }),

  loadSavedPlayer: async () => {
    const saved = await loadPlayer();
    if (saved && saved.worldData && saved.worldData.racePopulations && Object.keys(saved.worldData.racePopulations).length > 0) {
      set({ player: saved });
    } else {
      set({ player: initialPlayer });
      await savePlayer(initialPlayer);
    }
  },

  startNewRun: () => {
    const { player } = get();
    if (!player) return;

    const lastRace = player.worldData.unlockedRaces[player.worldData.unlockedRaces.length - 1] || 'ape';
    
    const totalPopulation = Object.values(player.worldData.racePopulations ?? {}).reduce((sum, pop) => sum + pop, 0);
    const initialStrength = calculateStrength(lastRace, totalPopulation);
    
    // 创建玩家自己的部落
    const playerTribe: TribeData = {
      id: 'player_tribe',
      name: '我的部落',
      icon: 'people',
      population: Math.max(totalPopulation, 10),
      strength: initialStrength,
      status: 'neutral',
      discovered: true,
    };
    
    // 随机生成15-20个部落
    const tribeCount = Math.floor(Math.random() * 6) + 15; // 15-20
    const allTribes = generateRandomTribes(tribeCount, playerTribe);

    const newRun: RunData = {
      progress: 0,
      currentRace: lastRace,
      inventory: {
        food: 0,
        water: 0,
        wood: 0,
        stone: 0,
      },
      events: [],
      unlockedSystems: [...player.unlockedSystems],
      population: Math.max(totalPopulation, 10),
      totalStrength: initialStrength,
      encounteredTribes: [],
      defeatedTribes: [],
      allTribes,
    };

    set({ currentRun: newRun, eventHistory: [] });
  },

  makeChoice: (choiceId, event) => {
    const { currentRun } = get();
    if (!currentRun) return;

    const choice = event.choices.find(c => c.id === choiceId);
    if (!choice) return;

    const effect = choice.effect(currentRun);
    set({
      currentRun: {
        ...currentRun,
        ...effect,
      },
    });
  },

  endRun: () => {
    const { player, currentRun } = get();
    if (player && currentRun) {
      const isExtinction = currentRun.population <= 0;
      
      if (!isExtinction) {
        // 累加资源
        const accumulatedResources = { ...player.worldData.resources };
        
        Object.entries(currentRun.inventory).forEach(([key, value]) => {
          if (typeof value === 'number' && key in accumulatedResources) {
            accumulatedResources[key as keyof typeof accumulatedResources] += value;
          }
        });

        const finalPopulation = Math.max(0, currentRun.population);
        
        // 获取之前的最后一个种族
        const previousLastRace = player.worldData.unlockedRaces[player.worldData.unlockedRaces.length - 1] || 'ape';
        
        // 更新种族人口
        const updatedRacePopulations = { ...player.worldData.racePopulations };
        
        if (currentRun.currentRace !== previousLastRace) {
          // 种族进化了，将最终人口分配给新种族
          updatedRacePopulations[currentRun.currentRace] = finalPopulation;
        } else {
          // 种族没变，更新该种族的人口
          updatedRacePopulations[currentRun.currentRace] = finalPopulation;
        }

        // 更新解锁种族列表
        const newUnlockedRaces = [...player.worldData.unlockedRaces];
        if (currentRun.currentRace !== previousLastRace) {
          newUnlockedRaces.push(currentRun.currentRace);
        }

        const updatedPlayer: Player = {
          ...player,
          worldData: {
            ...player.worldData,
            resources: accumulatedResources,
            unlockedRaces: newUnlockedRaces,
            racePopulations: updatedRacePopulations,
            unlockedTribes: [...(player.worldData.unlockedTribes ?? []), ...(currentRun.defeatedTribes ?? [])],
          },
          unlockedSystems: [...new Set([...player.unlockedSystems, ...(currentRun.unlockedSystems ?? [])])],
        };
        savePlayer(updatedPlayer);
        set({ player: updatedPlayer, currentRun: null, eventHistory: [] });
      } else {
        set({ currentRun: null, eventHistory: [] });
      }
    }
  },

  addEventToHistory: (historyItem) => 
    set((state) => ({
      eventHistory: [...state.eventHistory, historyItem],
    })),

  setCurrentEvent: (event) => 
    set({ currentEvent: event }),

  setIsBattleActive: (active) => 
    set({ isBattleActive: active }),
}));
