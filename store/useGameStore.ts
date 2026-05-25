import { create } from 'zustand';
import { Player, RunData, GameEvent, EventHistoryItem } from '@/types';
import { loadPlayer, savePlayer } from '@/utils/storage';
import { calculateStrength } from '@/utils/races';

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
