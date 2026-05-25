# 随机世界 - 文字肉鸽游戏

一款手机端文字肉鸽游戏，玩家扮演造物主，通过探索触发随机事件，壮大自己的种群。

## 技术栈

- **React Native** - 移动端开发框架
- **Expo** - 开发工具链
- **TypeScript** - 类型安全
- **Zustand** - 状态管理
- **Expo Router** - 导航系统

## 游戏特色

- 🎲 随机事件系统 - 每次探索都有不同的经历
- 🧬 种族进化 - 从猿人到文明的进化之旅
- 🏰 多系统解锁 - 菜品、秘术、异兽、神兵、修建、阵界、皇朝
- 📊 资源管理 - 收集食物、水、木材、石材等资源
- 🎨 精美的视觉效果 - 深色主题配合金色点缀

## 项目结构

```
randomWorld/
├── app/                      # 应用页面
│   ├── _layout.tsx          # 导航布局
│   ├── index.tsx           # 登录页
│   ├── home.tsx            # 主页
│   ├── explore.tsx         # 探索页
│   ├── settlement.tsx      # 结算页
│   └── system/
│       └── [id].tsx        # 系统详情页
├── assets/                 # 资源文件
├── components/             # 通用组件
│   ├── EventCard.tsx
│   ├── ProgressBar.tsx
│   └── SystemCard.tsx
├── constants/              # 常量定义
│   ├── Colors.ts
│   └── Layout.ts
├── store/                  # 状态管理
│   └── useGameStore.ts
├── types/                  # 类型定义
│   └── index.ts
├── utils/                  # 工具函数
│   ├── events.ts
│   ├── races.ts
│   └── storage.ts
├── app.json
├── babel.config.js
├── package.json
└── tsconfig.json
```

## 快速开始

### 前置要求

- Node.js 18+
- npm 或 yarn
- Expo CLI (可选)

### 安装依赖

```bash
npm install
```

### 运行项目

```bash
# 启动开发服务器
npm start

# 运行在 Android
npm run android

# 运行在 iOS
npm run ios

# 运行在 Web
npm run web
```

## 游戏玩法

1. **登录** - 使用 TapTap 账号登录或游客模式
2. **开始探索** - 在主页点击"开始探索"按钮
3. **处理事件** - 在探索过程中会遇到各种随机事件，做出你的选择
4. **获得收益** - 每次选择都会影响探索进度和资源获取
5. **解锁系统** - 通过特定事件可以解锁新的游戏系统
6. **种族进化** - 你的种群会随着探索进程不断进化
7. **结算收益** - 探索完成后，将收益带回大世界

## TapTap 集成

项目已预留 TapTap SDK 集成接口：

- 登录认证
- 用户信息获取
- 广告服务（激励视频、插屏广告）

详细集成文档请参考 `.trae/documents/` 目录。

## 开发说明

### 状态管理

使用 Zustand 管理游戏状态，主要包括：
- 玩家信息
- 当前探索数据
- 大世界资源

### 添加新事件

编辑 `utils/events.ts` 文件，按照现有格式添加新事件。

### 添加新种族

编辑 `utils/races.ts` 文件，定义新种族及其进化关系。

### 添加新系统

在主页和系统详情页添加对应的系统卡片和内容。

## 许可证

MIT
