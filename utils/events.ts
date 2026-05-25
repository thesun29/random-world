import { GameEvent, RunData } from '@/types';
import { generateEnemyTribe, calculateStrength } from './races';

// 辅助函数：生成随机进度值
const getRandomProgress = (eventCount: number) => {
  return Math.floor(5 + Math.random() * 15);
};

// 辅助函数：生成随机资源值
const getRandomResource = (min: number, max: number) => {
  return Math.floor(min + Math.random() * (max - min + 1));
};

// 创建单个事件模板数据
const getEventTemplates = () => [
  // ========== 普通事件 ==========
  {
    type: 'normal' as const,
    title: '发现清澈小溪',
    desc: '你的族群在山谷中发现一条清澈的小溪，溪水甘甜可口。',
    choices: [
      { 
        text: '在此建立营地', 
        res: { water: [12, 20], food: [5, 10] }, 
        popChange: [1, 3],
        result: '选择在溪边安营扎寨，获得充足水源！' 
      },
      { 
        text: '标记位置继续前进', 
        res: { water: [4, 8] }, 
        result: '记下水源位置，继续探索远方。' 
      },
    ],
  },
  {
    type: 'normal' as const,
    title: '野果树',
    desc: '发现一棵结满野果的大树，果实看起来很美味。',
    choices: [
      { 
        text: '采集野果', 
        res: { food: [15, 25] }, 
        result: '采集了满满一堆野果！' 
      },
      { 
        text: '让族人上树采摘', 
        res: { food: [20, 35] }, 
        popChange: [1, 2],
        result: '勇敢的族人爬上树，采了更多野果！' 
      },
    ],
  },
  {
    type: 'normal' as const,
    title: '倒下的古树',
    desc: '一棵巨大的古树被雷击中倒在地上，木材很粗壮。',
    choices: [
      { 
        text: '收集木材', 
        res: { wood: [20, 35] }, 
        result: '获得了大量优质木材！' 
      },
      { 
        text: '查看树洞', 
        res: { wood: [10, 18], food: [5, 12] }, 
        result: '在树洞里发现了蜂窝！' 
      },
    ],
  },
  
  // ========== 稀有事件 ==========
  {
    type: 'rare' as const,
    title: '神秘老者',
    desc: '遇到了一位神秘的老者，他似乎知道很多东西。',
    choices: [
      { 
        text: '虚心求教', 
        sys: ['secrets'], 
        res: { food: [15, 30], water: [10, 20] }, 
        strChange: [5, 10],
        result: '老者教授了你们秘术！' 
      },
      { 
        text: '赠送礼物', 
        res: { food: [20, 35], water: [15, 28] }, 
        result: '老者很高兴，回赠了更多东西！' 
      },
    ],
  },
  {
    type: 'rare' as const,
    title: '发现铁矿',
    desc: '发现了一处富含铁矿的矿脉，闪闪发光！',
    choices: [
      { 
        text: '大量开采', 
        res: { stone: [40, 65], wood: [10, 20] }, 
        strChange: [10, 20],
        result: '收获了大量铁矿石，战力提升！' 
      },
      { 
        text: '标记位置', 
        res: { stone: [20, 35] }, 
        result: '记下矿脉位置，以后再来。' 
      },
    ],
  },
  
  // ========== 史诗事件 ==========
  {
    type: 'epic' as const,
    title: '神迹显现',
    desc: '天空中有金光洒落，伴随着神圣的音乐！',
    choices: [
      { 
        text: '虔诚跪地祭拜', 
        race: 'tribe', 
        sys: ['empire'], 
        res: { food: [50, 85], water: [40, 70] }, 
        popChange: [10, 20],
        strChange: [20, 40],
        result: '种族进化为部落！' 
      },
      { 
        text: '记录这神圣时刻', 
        res: { food: [60, 100], water: [50, 85], wood: [40, 65], stone: [35, 60] }, 
        result: '神迹赐予你们丰厚的资源！' 
      },
    ],
  },
  
  // ========== 负面事件 ==========
  {
    type: 'negative' as const,
    title: '突发瘟疫',
    desc: '一场突如其来的瘟疫在族群中蔓延，很多人倒下了！',
    choices: [
      { 
        text: '隔离治疗', 
        popChange: [-5, -2],
        res: { food: [-10, -5], water: [-8, -3] },
        result: '控制住了瘟疫，但损失惨重。' 
      },
      { 
        text: '迁徙离开', 
        popChange: [-3, -1],
        result: '快速离开疫区，减少了损失。' 
      },
    ],
  },
  {
    type: 'negative' as const,
    title: '遭遇狼群',
    desc: '一群饥饿的野狼盯上了你们，它们看起来很危险！',
    choices: [
      { 
        text: '奋起反抗', 
        popChange: [-2, 0],
        res: { food: [5, 15] },
        result: '牺牲了一些族人，但获得了食物。' 
      },
      { 
        text: '快速逃跑', 
        popChange: [-1, 0],
        res: { food: [-5, -3] },
        result: '紧急逃跑，但丢失了一些物资。' 
      },
    ],
  },
  {
    type: 'negative' as const,
    title: '暴风雨突袭',
    desc: '一场罕见的暴风雨突然袭来，营地被冲毁了一部分！',
    choices: [
      { 
        text: '紧急修复', 
        res: { wood: [-20, -10], water: [5, 15] },
        result: '用木材修复了营地，但收集了雨水。' 
      },
      { 
        text: '转移到高地', 
        res: { food: [-10, -5], wood: [-5, -3] },
        result: '安全转移，但损失了一些物资。' 
      },
    ],
  },
  {
    type: 'negative' as const,
    title: '食物腐烂',
    desc: '储藏的食物因为潮湿开始腐烂了！',
    choices: [
      { 
        text: '赶快处理', 
        res: { food: [-30, -15] },
        result: '只抢救回了一部分。' 
      },
      { 
        text: '晒干剩余食物', 
        res: { food: [-20, -10], wood: [5, 10] },
        result: '用柴火烘干，减少了损失。' 
      },
    ],
  },
  {
    type: 'negative' as const,
    title: '部落内讧',
    desc: '族群内部因为分配问题产生了争执！',
    choices: [
      { 
        text: '公平分配', 
        popChange: [-1, 0],
        result: '解决了问题，但有族人离开了。' 
      },
      { 
        text: '强力压制', 
        popChange: [-2, -1],
        strChange: [2, 5],
        result: '压制了反对者，凝聚力反而提升了。' 
      },
    ],
  },
  {
    type: 'negative' as const,
    title: '野兽袭击',
    desc: '一只巨大的野兽袭击了营地，它力大无穷！',
    choices: [
      { 
        text: '正面迎战', 
        popChange: [-4, -2],
        strChange: [3, 8],
        result: '击败了野兽，但付出了惨痛代价。' 
      },
      { 
        text: '设陷阱引诱', 
        popChange: [-1, 0],
        res: { food: [10, 25] },
        result: '成功击杀了野兽，获得了大量食物。' 
      },
    ],
  },
  {
    type: 'negative' as const,
    title: '火灾爆发',
    desc: '营地突然起火了，火焰迅速蔓延！',
    choices: [
      { 
        text: '全力扑救', 
        popChange: [-1, 0],
        res: { wood: [-15, -8], water: [-20, -10] },
        result: '扑灭了大火，但损失了大量物资。' 
      },
      { 
        text: '优先抢救物资', 
        res: { wood: [-30, -20], food: [-10, -5] },
        result: '只抢救出了一部分物资。' 
      },
    ],
  },
  {
    type: 'negative' as const,
    title: '水源枯竭',
    desc: '部落赖以生存的水源突然干涸了！',
    choices: [
      { 
        text: '派人寻找新水源', 
        popChange: [-2, 0],
        res: { food: [-15, -8] },
        result: '找到了新水源，但路上折损了人手。' 
      },
      { 
        text: '尝试挖掘水井', 
        res: { wood: [-25, -15], stone: [-20, -10] },
        result: '成功挖到了地下水！' 
      },
    ],
  },
  {
    type: 'negative' as const,
    title: '旱灾来临',
    desc: '连续数月无雨，庄稼全部枯死了！',
    choices: [
      { 
        text: '打猎为生', 
        popChange: [-3, -1],
        res: { food: [-25, -15] },
        result: '艰难地熬过了旱灾。' 
      },
      { 
        text: '向其他部落借粮', 
        res: { food: [-40, -25], water: [-20, -10] },
        strChange: [-5, -2],
        result: '借到了粮食，但欠下了人情和资源。' 
      },
    ],
  },
  {
    type: 'negative' as const,
    title: '雪灾肆虐',
    desc: '一场前所未有的大雪覆盖了整个领地！',
    choices: [
      { 
        text: '窝在营地过冬', 
        popChange: [-4, -2],
        res: { wood: [-30, -15], food: [-40, -20] },
        result: '勉强熬过了寒冬。' 
      },
      { 
        text: '迁徙到温暖之地', 
        popChange: [-5, -2],
        res: { food: [-20, -10] },
        result: '到达了温暖的地方，但旅途艰辛。' 
      },
    ],
  },
  {
    type: 'negative' as const,
    title: '毒草误食',
    desc: '有族人误食了有毒的植物！',
    choices: [
      { 
        text: '寻找解药', 
        popChange: [-1, 0],
        res: { food: [-10, -5] },
        result: '找到了草药解毒，但有一人不幸身亡。' 
      },
      { 
        text: '隔离观察', 
        popChange: [-2, -1],
        result: '疫情没有扩散，但中毒者没能救回。' 
      },
    ],
  },
  {
    type: 'negative' as const,
    title: '陷阱受伤',
    desc: '有族人在打猎时掉入了其他部落的陷阱！',
    choices: [
      { 
        text: '前去救援', 
        popChange: [-1, 0],
        strChange: [-3, -1],
        result: '救回了族人，但有人受了重伤。' 
      },
      { 
        text: '谨慎行事', 
        res: { wood: [-10, -5], stone: [-5, -3] },
        result: '加强了部落防御，但这次没人去救。' 
      },
    ],
  },
  {
    type: 'negative' as const,
    title: '食物短缺',
    desc: '部落的食物储备快要耗尽了！',
    choices: [
      { 
        text: '冒险深入狩猎', 
        popChange: [-3, -1],
        res: { food: [20, 35] },
        result: '获得了大量食物，但付出了代价。' 
      },
      { 
        text: '减少每日配给', 
        popChange: [-5, -3],
        res: { food: [-50, -30] },
        result: '食物撑到了新的收获，但很多人饿死了。' 
      },
    ],
  },
  
  // ========== 遭遇战事件 ==========
  {
    type: 'encounter' as const,
    title: '发现敌对部落！',
    desc: '前方发现了一个敌对部落的踪迹，他们似乎也注意到你们了！',
    choices: [
      { 
        text: '发起攻击！', 
        isBattle: true,
        result: '与敌对部落正面遭遇！' 
      },
      { 
        text: '尝试谈判', 
        res: { food: [10, 20], water: [10, 15] },
        result: '用资源换取了和平。' 
      },
      { 
        text: '快速撤离', 
        res: { food: [-10, -5], wood: [-5, -3] },
        result: '成功撤退，但丢失了一些物资。' 
      },
    ],
  },
];

// 辅助函数：从模板创建单个事件，每次都重新计算随机值
const createEventFromTemplate = (template: any, id: string) => {
  return {
    id,
    type: template.type,
    title: template.title,
    description: template.desc,
    choices: template.choices.map((choice: any, cIdx: number) => {
      const choiceId = `${id}-choice-${cIdx + 1}`;
      
      // 每次都重新计算固定的资源值
      const fixedResources: { [key: string]: number } = {};
      if (choice.res) {
        Object.entries(choice.res).forEach(([key, range]: any) => {
          if (Array.isArray(range)) {
            fixedResources[key] = getRandomResource(range[0], range[1]);
          }
        });
      }
      
      // 收集要解锁的系统
      const systemsToUnlock: string[] = choice.sys || [];
      
      // 计算人口变化
      let populationChange = 0;
      if (choice.popChange) {
        populationChange = getRandomResource(choice.popChange[0], choice.popChange[1]);
      }
      
      return {
        id: choiceId,
        text: choice.text,
        resultText: choice.result,
        resources: fixedResources,
        systemToUnlock: systemsToUnlock.length > 0 ? systemsToUnlock : undefined,
        raceToEvolve: choice.race,
        isBattle: choice.isBattle,
        populationChange,
        strengthChange: 0,
        effect: (state: RunData) => {
          const currentProgress = typeof state.progress === 'number' && !isNaN(state.progress) ? state.progress : 0;
          const eventCount = state.events.length + 1;
          let progress = getRandomProgress(eventCount);
          if (template.type === 'rare') progress += 3;
          if (template.type === 'epic') progress += 8;
          
          const newInventory = { ...state.inventory };
          Object.entries(fixedResources).forEach(([key, value]) => {
            newInventory[key] = (newInventory[key] || 0) + value;
            if (newInventory[key] < 0) newInventory[key] = 0;
          });
          
          const currentPopulation = typeof state.population === 'number' && !isNaN(state.population) ? state.population : 10;
          let newPopulation = currentPopulation + populationChange;
          if (newPopulation < 0) newPopulation = 0;
          
          let newUnlockedSystems = [...state.unlockedSystems];
          if (systemsToUnlock.length > 0) {
            systemsToUnlock.forEach(sys => {
              if (!newUnlockedSystems.includes(sys)) {
                newUnlockedSystems.push(sys);
              }
            });
          }
          
          let newRace = state.currentRace;
          if (choice.race) {
            newRace = choice.race;
          }
          
          const newStrength = calculateStrength(newRace, newPopulation);
          
          const effect: Partial<RunData> = {
            progress: currentProgress + progress,
            events: [...state.events, {} as any],
            inventory: newInventory,
            population: newPopulation,
            totalStrength: newStrength,
            unlockedSystems: newUnlockedSystems,
            currentRace: newRace,
          };
          
          return effect;
        },
      };
    }),
  };
};

// 生成随机事件（每次调用都重新创建，确保随机数新鲜！）
export const generateEventByProgress = (progress: number, eventHistory: any[] = []): GameEvent => {
  const templates = getEventTemplates();
  
  // 根据进度选择事件类型的概率
  let availableTemplates = templates.filter(template => {
    if (template.type === 'epic') return Math.random() < (0.05 + progress / 500);
    if (template.type === 'rare') return Math.random() < (0.1 + progress / 200);
    if (template.type === 'negative') return Math.random() < (0.15 + progress / 300);
    if (template.type === 'encounter') return Math.random() < (0.1 + progress / 200);
    return true;
  });
  
  // 如果筛选后为空，就用全部
  if (availableTemplates.length === 0) availableTemplates = templates;
  
  const randomIndex = Math.floor(Math.random() * availableTemplates.length);
  const randomTemplate = availableTemplates[randomIndex];
  
  return createEventFromTemplate(randomTemplate, `event-${Date.now()}-${Math.random()}`);
};

export { getRandomProgress, getRandomResource };
