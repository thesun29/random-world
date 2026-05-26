# 随机世界 - 项目索引文档

## 📋 项目概述

**随机世界** 是一款基于 React Native 和 Expo 开发的文字肉鸽生存游戏。玩家扮演造物主，引导自己的种族从原始猿人逐步进化，通过探索、遭遇随机事件、管理资源，最终发展成强大的文明帝国。

**技术栈**：
- React Native 0.76.7
- Expo 52.0.37
- TypeScript
- Zustand 5.0.0 (状态管理)
- Expo Router 4.0.17 (导航)

---

## 📁 目录结构

```
/workspace
├── app/                           # 应用主目录（Expo Router）
│   ├── _layout.tsx               # 根布局组件
│   ├── index.tsx                 # 登录/启动页面
│   ├── home.tsx                  # 主页面（世界地图、菜单）
│   ├── explore.tsx               # 探索页面（事件处理）
│   ├── settlement.tsx            # 结算页面
│   ├── battle.tsx                # 战斗页面（待实现）
│   ├── race/[id].tsx             # 种族详情页（动态路由）
│   └── system/[id].tsx           # 系统详情页（动态路由）
├── components/                    # 通用组件
│   ├── EventCard.tsx             # 事件卡片组件
│   ├── NotepadEvent.tsx          # 记事本事件组件
│   ├── ProgressBar.tsx           # 进度条组件
│   └── SystemCard.tsx            # 系统卡片组件
├── constants/                     # 常量定义
│   ├── Colors.ts                 # 颜色主题
│   └── Layout.ts                 # 布局常量
├── store/                         # 状态管理（Zustand）
│   └── useGameStore.ts           # 游戏主状态
├── types/                         # TypeScript 类型定义
│   └── index.ts                  # 核心类型
├── utils/                         # 工具函数
│   ├── events.ts                 # 事件生成系统
│   ├── races.ts                  # 种族系统
│   └── storage.ts                # 本地存储
├── assets/                        # 资源文件
│   └── images/                   # 图片资源
├── android/                       # Android 原生代码
├── ios/                           # iOS 原生代码
├── app.json                       # Expo 配置
├── package.json                   # 项目依赖
├── tsconfig.json                  # TypeScript 配置
└── README.md                      # 项目说明
```

---

## 🎮 核心游戏系统

### 1. 页面导航系统

| 页面 | 文件路径 | 功能说明 |
|------|----------|----------|
| 启动页 | [app/index.tsx](file:///workspace/app/index.tsx) | 游戏入口，加载玩家数据 |
| 主页面 | [app/home.tsx](file:///workspace/app/home.tsx) | 世界地图、资源管理、系统菜单 |
| 探索页 | [app/explore.tsx](file:///workspace/app/explore.tsx) | 事件处理、进度推进、资源收集 |
| 结算页 | [app/settlement.tsx](file:///workspace/app/settlement.tsx) | 探索结果展示、奖励领取 |
| 种族详情 | [app/race/[id].tsx](file:///workspace/app/race/[id].tsx) | 种族信息展示（动态路由） |
| 系统详情 | [app/system/[id].tsx](file:///workspace/app/system/[id].tsx) | 系统信息展示（动态路由） |

### 2. 状态管理 (Zustand)

**文件**：[store/useGameStore.ts](file:///workspace/store/useGameStore.ts)

**核心状态**：
- `player`: 玩家数据（资源、种族、解锁系统）
- `currentRun`: 当前探索数据（进度、资源、事件记录）
- `eventHistory`: 事件历史
- `currentEvent`: 当前事件
- `isBattleActive`: 战斗状态

**核心方法**：
- `loadSavedPlayer()`: 加载保存的玩家数据
- `startNewRun()`: 开始新探索
- `makeChoice()`: 处理事件选择
- `endRun()`: 结束探索并结算

### 3. 事件系统

**文件**：[utils/events.ts](file:///workspace/utils/events.ts)

**事件类型**：
- `normal`: 普通事件（资源、小奖励）
- `rare`: 稀有事件（较大奖励、系统解锁）
- `epic`: 史诗事件（种族进化、大额奖励）
- `negative`: 负面事件（资源损失、人口减少）
- `encounter`: 遭遇战事件（战斗触发）

**事件示例**：
- 发现清澈小溪
- 野果树
- 神秘老者
- 突发瘟疫
- 部落内讧
- 发现敌对部落

### 4. 种族进化系统

**文件**：[utils/races.ts](file:///workspace/utils/races.ts)

**种族列表**：
| 种族ID | 名称 | 等级 | 基础战力 | 战力乘数 |
|--------|------|------|----------|----------|
| `ape` | 未开化猿人 | 1 | 5 | 1.0 |
| `tribe` | 部落居民 | 2 | 15 | 1.5 |
| `civilization` | 文明国度 | 3 | 35 | 2.0 |

**进化路径**：
`ape` → `tribe` → `civilization` → `empire`

**战斗相关**：
- `calculateStrength()`: 计算种族战力
- `generateEnemyTribe()`: 生成敌对部落
- `calculateVictoryChance()`: 计算胜率
- `simulateBattle()`: 模拟战斗

### 5. 游戏系统解锁

**可解锁系统**：
| 系统ID | 名称 | 说明 |
|--------|------|------|
| `materials` | 材料 | 资源管理系统 |
| `essence` | 精华 | 特殊资源系统 |
| `dishes` | 菜品 | 食物制作系统 |
| `secrets` | 秘术 | 技能系统 |
| `beasts` | 异兽 | 宠物系统 |
| `weapons` | 神兵 | 装备系统 |
| `building` | 修建 | 建筑系统 |
| `empire` | 皇朝 | 高级文明系统 |

### 6. 资源管理

**核心资源**：
| 资源 | 标识 | 用途 |
|------|------|------|
| 食物 | `food` | 维持人口、招募战士 |
| 水源 | `water` | 生存必需 |
| 木材 | `wood` | 建造、制作 |
| 石材 | `stone` | 建造、武器 |

---

## 🧩 组件库

### 1. EventCard

**文件**：[components/EventCard.tsx](file:///workspace/components/EventCard.tsx)

**功能**：显示随机事件卡片，包含选择按钮

**Props**：
```typescript
{
  event: GameEvent;
  onChoice: (choiceId: string) => void;
}
```

### 2. 其他组件

- **ProgressBar**: 显示探索进度
- **NotepadEvent**: 记事本风格的事件展示
- **SystemCard**: 系统解锁卡片

---

## 📊 数据类型

**文件**：[types/index.ts](file:///workspace/types/index.ts)

**核心类型**：

```typescript
// 玩家数据
interface Player {
  id: string;
  name: string;
  worldData: WorldData;
  unlockedSystems: string[];
}

// 世界数据
interface WorldData {
  resources: { [key: string]: number };
  unlockedRaces: string[];
  racePopulations: { [raceId: string]: number };
  unlockedTribes: TribeData[];
}

// 探索数据
interface RunData {
  progress: number;
  currentRace: string;
  inventory: { [key: string]: any };
  events: GameEvent[];
  unlockedSystems: string[];
  population: number;
  totalStrength: number;
  encounteredTribes: TribeData[];
  defeatedTribes: TribeData[];
  allTribes: TribeData[];
}

// 游戏事件
interface GameEvent {
  id: string;
  type: 'normal' | 'rare' | 'epic' | 'negative' | 'encounter';
  title: string;
  description: string;
  choices: EventChoice[];
}

// 事件选择
interface EventChoice {
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
```

---

## 🎨 主题与样式

**文件**：[constants/Colors.ts](file:///workspace/constants/Colors.ts)

**颜色主题**：
- 深色背景
- 金色主色调（强调色）
- 紫色/深色辅助色
- 红色（错误/负面事件）

---

## 🚀 开发流程

### 开始新项目

```bash
# 安装依赖
npm install

# 启动开发服务器
npm start

# 运行 Android
npm run android

# 运行 iOS
npm run ios

# 运行 Web
npm run web
```

### 添加新事件

编辑 [utils/events.ts](file:///workspace/utils/events.ts)，在 `getEventTemplates()` 中添加新的事件模板。

### 添加新种族

编辑 [utils/races.ts](file:///workspace/utils/races.ts)，在 `RACES` 对象中添加新种族定义。

### 添加新系统

1. 在 [app/home.tsx](file:///workspace/app/home.tsx) 中添加系统菜单项
2. 在 [app/system/[id].tsx](file:///workspace/app/system/[id].tsx) 中添加系统详情页
3. 在事件中添加系统解锁逻辑

---

## 🔗 关键文件索引

| 文件 | 说明 |
|------|------|
| [package.json](file:///workspace/package.json) | 项目依赖配置 |
| [README.md](file:///workspace/README.md) | 项目文档 |
| [types/index.ts](file:///workspace/types/index.ts) | 类型定义中心 |
| [store/useGameStore.ts](file:///workspace/store/useGameStore.ts) | 状态管理核心 |
| [utils/events.ts](file:///workspace/utils/events.ts) | 事件系统实现 |
| [utils/races.ts](file:///workspace/utils/races.ts) | 种族系统实现 |
| [app/home.tsx](file:///workspace/app/home.tsx) | 主界面实现 |
| [app/explore.tsx](file:///workspace/app/explore.tsx) | 探索界面实现 |

---

## 📝 开发笔记

### 当前状态

- ✅ 基础探索系统完整实现
- ✅ 随机事件系统完整实现
- ✅ 种族进化系统框架完整
- ✅ 状态管理完整
- ✅ 主界面框架完成
- ❌ 战斗页面尚未实现（battle.tsx 缺失）
- ❌ 部分系统详情页待完善

### 下一步开发建议

1. 实现战斗系统 (battle.tsx)
2. 完善各系统详情页
3. 添加更多种族和事件
4. 实现存档/读档的完整流程
5. 添加游戏音效和视觉效果

---

*文档创建时间：2026-05-26*
