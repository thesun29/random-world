export interface Player {
  id: string;
  tapTapId?: string;
  name: string;
  worldData: WorldData;
  unlockedSystems: string[];
}

export interface WorldData {
  resources: {
    [key: string]: number;
  };
  unlockedRaces: string[];
  racePopulations: {
    [raceId: string]: number;
  };
  unlockedTribes: TribeData[];
}

export interface TribeData {
  id: string;
  name: string;
  icon: string;
  population: number;
  strength: number;
  status: 'unknown' | 'friendly' | 'neutral' | 'enemy' | 'defeated' | 'vassal' | 'merged';
  discovered?: boolean;
  vassals?: string[]; // 附庸部落的ID数组
  overlord?: string; // 宗主部落的ID
  tier?: number; // 氏族层级，用于拓扑图显示
  parentId?: string; // 父氏族ID
  childrenIds?: string[]; // 子氏族ID数组
  isMainClan?: boolean; // 是否为主氏族
}

export interface RunData {
  progress: number;
  currentRace: string;
  inventory: {
    [key: string]: any;
  };
  events: GameEvent[];
  unlockedSystems: string[];
  population: number;
  totalStrength: number;
  encounteredTribes: TribeData[];
  defeatedTribes: TribeData[];
  allTribes: TribeData[];
}

export interface GameEvent {
  id: string;
  type: 'normal' | 'rare' | 'epic' | 'negative' | 'encounter';
  title: string;
  description: string;
  choices: EventChoice[];
}

export interface EventChoice {
  id: string;
  text: string;
  resultText: string;
  resources: { [key: string]: number };
  systemToUnlock?: string[];
  raceToEvolve?: string;
  isBattle?: boolean;
  populationChange: number;
  strengthChange: number;
  effect: (state: RunData) => Partial<RunData>;
}

export interface EventHistoryItem {
  id: string;
  event: GameEvent;
  selectedChoiceId: string;
  selectedChoiceText: string;
  resultText: string;
  resourcesGained: { [key: string]: number };
  progressGained: number;
  systemUnlocked?: string[];
  raceEvolved?: string;
  populationChange?: number;
  strengthChange?: number;
  timestamp: number;
}

export interface SystemItem {
  id: string;
  name: string;
  icon: string;
  description: string;
  unlocked: boolean;
}

export interface Race {
  id: string;
  name: string;
  tier: number;
  description: string;
  evolutionRequirements?: {
    [key: string]: any;
  };
  evolutions?: string[];
  baseStrength: number;
  strengthMultiplier: number;
  equipmentSlots: EquipmentSlot[];
}

export interface EquipmentSlot {
  id: string;
  name: string;
  unlocked: boolean;
  strengthBonus: number;
}

export interface EnemyTribe {
  id: string;
  name: string;
  race: string;
  population: number;
  strength: number;
  description: string;
}

export interface BattleResult {
  victory: boolean;
  victoryChance: number;
  casualties: number;
  spoils?: {
    [key: string]: number;
  };
}
