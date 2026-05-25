import { Race } from '@/types';

export const RACES: Record<string, Race> = {
  ape: {
    id: 'ape',
    name: '未开化猿人',
    tier: 1,
    description: '刚从丛林中走出来的原始人类，使用最基础的工具',
    baseStrength: 5,
    strengthMultiplier: 1.0,
    evolutions: ['tribe'],
    equipmentSlots: [
      { id: 'weapon1', name: '原始投石索', unlocked: true, strengthBonus: 3 },
      { id: 'weapon2', name: '石斧', unlocked: false, strengthBonus: 5 },
    ],
  },
  tribe: {
    id: 'tribe',
    name: '部落居民',
    tier: 2,
    description: '形成了初步社会组织的部落，懂得协作狩猎',
    baseStrength: 15,
    strengthMultiplier: 1.5,
    evolutions: ['civilization'],
    equipmentSlots: [
      { id: 'weapon1', name: '石斧', unlocked: true, strengthBonus: 5 },
      { id: 'weapon2', name: '骨矛', unlocked: false, strengthBonus: 8 },
      { id: 'armor1', name: '皮甲', unlocked: false, strengthBonus: 5 },
    ],
  },
  civilization: {
    id: 'civilization',
    name: '文明国度',
    tier: 3,
    description: '发展出完整文明，拥有精良武器和军队',
    baseStrength: 35,
    strengthMultiplier: 2.0,
    evolutions: ['empire'],
    equipmentSlots: [
      { id: 'weapon1', name: '青铜剑', unlocked: true, strengthBonus: 15 },
      { id: 'weapon2', name: '长矛方阵', unlocked: false, strengthBonus: 25 },
      { id: 'armor1', name: '青铜甲', unlocked: true, strengthBonus: 10 },
      { id: 'siege1', name: '攻城塔', unlocked: false, strengthBonus: 30 },
    ],
  },
};

export const getRaceById = (raceId: string): Race => {
  return RACES[raceId] || RACES.ape;
};

export const calculateStrength = (raceId: string, population: number): number => {
  const race = getRaceById(raceId);
  
  // 基础战力 = 种族基础战力 * 人口
  let totalStrength = race.baseStrength * population;
  
  // 加上装备的战力加成
  race.equipmentSlots.forEach(slot => {
    if (slot.unlocked) {
      totalStrength += slot.strengthBonus * population;
    }
  });
  
  // 乘以种族战力乘数
  totalStrength *= race.strengthMultiplier;
  
  return Math.floor(totalStrength);
};

export const generateEnemyTribe = (progress: number) => {
  const raceIds = Object.keys(RACES);
  const randomIndex = Math.min(
    Math.floor(Math.random() * (progress / 50 + 1)), 
    raceIds.length - 1
  );
  const race = RACES[raceIds[randomIndex]];
  
  const minPopulation = Math.floor(progress / 2 + 5);
  const maxPopulation = Math.floor(progress + 20);
  const population = minPopulation + Math.floor(Math.random() * (maxPopulation - minPopulation));
  
  const strength = calculateStrength(race.id, population);
  
  return {
    id: 'enemy-' + Date.now(),
    name: generateTribeName(),
    race: race.id,
    population,
    strength,
    description: `${race.name}组成的部落，看起来不太好惹`,
  };
};

const generateTribeName = (): string => {
  const prefixes = ['黑石', '狂狼', '风语', '雷霆', '暗影', '黄金', '翡翠', '钢铁'];
  const suffixes = ['部落', '氏族', '部族', '联盟', '王朝', '王国'];
  
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  
  return prefix + suffix;
};

export const calculateVictoryChance = (playerStrength: number, enemyStrength: number): number => {
  // 战力比例决定胜率
  const ratio = playerStrength / (playerStrength + enemyStrength);
  
  // 基础胜率最低 10%，最高 90%
  const baseChance = Math.max(0.1, Math.min(0.9, ratio));
  
  // 加入随机性，±15%波动
  const randomFactor = 0.85 + Math.random() * 0.3;
  
  return Math.max(0.05, Math.min(0.95, baseChance * randomFactor));
};

export const simulateBattle = (playerStrength: number, enemyStrength: number, playerPopulation: number) => {
  const victoryChance = calculateVictoryChance(playerStrength, enemyStrength);
  const victory = Math.random() < victoryChance;
  
  // 计算伤亡人数
  let casualties = 0;
  if (victory) {
    // 胜利时，伤亡较少（敌人的10%-30%）
    const baseCasualties = Math.floor(enemyStrength / 10 * (0.1 + Math.random() * 0.2));
    casualties = Math.min(playerPopulation - 1, baseCasualties);
  } else {
    // 失败时，伤亡惨重（20%-60%）
    const baseCasualties = Math.floor(playerPopulation * (0.2 + Math.random() * 0.4));
    casualties = Math.min(playerPopulation, baseCasualties);
  }
  
  return {
    victory,
    victoryChance,
    casualties,
  };
};
