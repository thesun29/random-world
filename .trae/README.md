# Trae 全局记忆系统

这个目录包含了 Trae 的全局记忆配置和脚本，用于管理游戏服务器重启、对话记忆以及浏览器自动刷新。

## 📁 目录结构

```
.trae/
├── rules.json          # Trae 项目规则配置
├── config.json         # 详细配置文件
├── README.md          # 本文档
├── scripts/           # 脚本目录
│   ├── restart-server.js    # 服务器重启脚本（含浏览器刷新）
│   └── memory-manager.js    # 记忆管理模块
└── memory/            # 记忆存储目录（git 忽略）
    ├── server-state.json   # 服务器状态
    ├── browser-refresh.json # 浏览器刷新记录
    ├── session.json        # 会话信息
    ├── conversations.json  # 对话历史
    └── game-state.json     # 游戏状态
```

## 🎯 功能特性

### 1. 自动服务器重启
- **代码修改后自动重启** - 修改代码后自动重启游戏服务器
- **每轮对话后重启** - 每完成一轮对话自动重启服务器
- **端口管理** - 自动清理占用 8081 端口的进程

### 2. 浏览器自动刷新
- **系统级刷新** - 使用 PowerShell 发送 F5 按键刷新活动浏览器
- **Web 客户端检测** - 网页组件自动检测服务器重启并刷新
- **刷新通知服务器** - 在 8082 端口提供刷新状态 API
- **多种刷新方式** - 支持 F5、location.reload() 等多种刷新方式

### 3. 全局记忆系统
- **对话历史** - 保存最近 100 条对话记录
- **会话跟踪** - 记录当前会话信息和对话计数
- **游戏状态** - 跟踪游戏进度和解锁内容
- **服务器状态** - 监控服务器运行状态和重启次数

## 🚀 使用方法

### 便捷命令

```bash
# 重启游戏服务器（含浏览器刷新）
npm run restart-server

# 查看记忆数据
npm run view-memory

# 清空记忆数据
npm run clear-memory

# 手动启动游戏
npm start
```

### 服务器重启脚本

```bash
# 直接运行重启脚本
node .trae/scripts/restart-server.js
```

### 刷新通知服务器 API

重启脚本会启动一个辅助服务器在 8082 端口，提供以下 API：

```
GET /api/refresh-status  # 获取刷新状态
GET /api/trigger-refresh # 手动触发刷新
```

### 记忆管理 API

记忆管理模块提供了以下功能：

```javascript
const { 
  SessionManager, 
  ConversationManager, 
  GameStateManager 
} = require('./.trae/scripts/memory-manager');

// 会话管理
SessionManager.getCurrentSession();
SessionManager.incrementConversationCount();

// 对话管理
ConversationManager.addConversation({ user: '...', assistant: '...' });
ConversationManager.getRecentConversations(10);

// 游戏状态
GameStateManager.getGameState();
GameStateManager.updateGameState({ resources: { food: 100 } });
```

## 🔌 浏览器刷新助手组件

项目包含一个 React Native 组件 `BrowserRefreshHelper.tsx`，已集成到根布局中，功能包括：

- 自动检测服务器重启
- 显示服务器状态和刷新次数
- 提供手动刷新按钮
- 只在 Web 平台显示

## ⚙️ 配置说明

### rules.json 主要配置项

| 配置项 | 说明 |
|--------|------|
| autoRestart | 代码修改后自动重启 |
| conversationRestart | 每轮对话后重启 |
| globalMemory | 全局记忆启用状态 |

### config.json 配置项

- **memory** - 记忆存储配置
- **serviceManagement** - 服务管理命令
- **browserRefresh** - 浏览器刷新配置
- **projectTracking** - 项目文件监控

## 📊 记忆数据结构

### 服务器状态 (server-state.json)
```json
{
  "status": "running",
  "pid": 12345,
  "lastRestart": "2024-01-01T00:00:00.000Z",
  "restartCount": 5,
  "refreshCount": 3
}
```

### 浏览器刷新状态 (browser-refresh.json)
```json
{
  "timestamp": "2024-01-01T00:00:00.000Z",
  "count": 3
}
```

### 会话信息 (session.json)
```json
{
  "id": "1234567890",
  "startTime": "2024-01-01T00:00:00.000Z",
  "conversationCount": 10
}
```

### 对话历史 (conversations.json)
```json
[
  {
    "id": "1",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "user": "用户输入",
    "assistant": "助手回复"
  }
]
```

## 🔧 故障排查

### 端口被占用
```bash
# 手动查看端口占用
netstat -ano | findstr ":8081"
netstat -ano | findstr ":8082"

# 手动终止进程
taskkill /F /PID <进程ID>
```

### 服务器无法启动
1. 检查 Node.js 是否正确安装
2. 运行 `npm install` 确保依赖完整
3. 查看是否有其他进程占用 8081/8082 端口
4. 检查防火墙设置

### 浏览器不自动刷新
1. 确认浏览器标签页是活动窗口（F5 方法需要）
2. 查看浏览器控制台是否有错误
3. 尝试手动点击网页上的"手动刷新"按钮
4. 检查 8082 端口的刷新服务器是否正常运行

### 记忆文件损坏
```bash
# 清空记忆重新开始
npm run clear-memory
```

## 📝 注意事项

1. **记忆目录** - `.trae/memory/` 已在 `.gitignore` 中，不会被提交
2. **自动重启** - 根据 Trae 配置，每轮对话后会自动重启服务器
3. **服务器超时** - 启动超时时间为 30 秒
4. **历史记录** - 对话历史最多保留 100 条
5. **端口占用** - 确保 8081 和 8082 端口可用
6. **浏览器权限** - F5 刷新方法需要浏览器窗口是活动的

## 🔄 工作原理

### 服务器重启流程
1. 检测并终止占用 8081 端口的进程
2. 启动 Expo 开发服务器
3. 启动刷新通知服务器（8082 端口）
4. 服务器就绪后发送浏览器刷新信号
5. Web 客户端检测到重启自动刷新页面

### 浏览器刷新方法优先级
1. PowerShell F5 按键（系统级）
2. Web 组件检测（客户端轮询）
3. 标记文件检测（降级方案）

---

**注意** - 本系统需要 Trae 平台支持相应的规则触发器才能完全生效。
