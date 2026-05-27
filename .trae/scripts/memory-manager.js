/**
 * 全局记忆管理模块
 * 用于保存和管理对话历史、游戏状态等信息
 */

const fs = require('fs');
const path = require('path');

const MEMORY_DIR = path.join(__dirname, '../memory');
const CONVERSATION_FILE = path.join(MEMORY_DIR, 'conversations.json');
const GAME_STATE_FILE = path.join(MEMORY_DIR, 'game-state.json');
const SESSION_FILE = path.join(MEMORY_DIR, 'session.json');

// 确保记忆目录存在
function ensureMemoryDir() {
  if (!fs.existsSync(MEMORY_DIR)) {
    fs.mkdirSync(MEMORY_DIR, { recursive: true });
  }
}

// 读取JSON文件
function readJSONFile(filePath, defaultValue = null) {
  ensureMemoryDir();
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
  } catch (error) {
    console.error(`读取文件失败 ${filePath}:`, error);
  }
  return defaultValue;
}

// 写入JSON文件
function writeJSONFile(filePath, data) {
  ensureMemoryDir();
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`写入文件失败 ${filePath}:`, error);
  }
}

// 会话管理
const SessionManager = {
  getCurrentSession() {
    return readJSONFile(SESSION_FILE, {
      id: Date.now().toString(),
      startTime: new Date().toISOString(),
      conversationCount: 0
    });
  },
  
  updateSession(updates) {
    const session = this.getCurrentSession();
    const newSession = { ...session, ...updates, lastUpdate: new Date().toISOString() };
    writeJSONFile(SESSION_FILE, newSession);
    return newSession;
  },
  
  incrementConversationCount() {
    const session = this.getCurrentSession();
    return this.updateSession({
      conversationCount: (session.conversationCount || 0) + 1
    });
  }
};

// 对话历史管理
const ConversationManager = {
  getAllConversations() {
    return readJSONFile(CONVERSATION_FILE, []);
  },
  
  addConversation(conversation) {
    const conversations = this.getAllConversations();
    const newConversation = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      ...conversation
    };
    
    // 只保留最近100条对话
    const updatedConversations = [newConversation, ...conversations].slice(0, 100);
    writeJSONFile(CONVERSATION_FILE, updatedConversations);
    
    // 更新会话计数
    SessionManager.incrementConversationCount();
    
    return newConversation;
  },
  
  getRecentConversations(limit = 10) {
    return this.getAllConversations().slice(0, limit);
  },
  
  clearConversations() {
    writeJSONFile(CONVERSATION_FILE, []);
  }
};

// 游戏状态管理
const GameStateManager = {
  getGameState() {
    return readJSONFile(GAME_STATE_FILE, {
      playerProgress: {},
      explorationHistory: [],
      unlockedSystems: [],
      unlockedRaces: [],
      resources: {
        food: 0,
        water: 0,
        wood: 0,
        stone: 0
      },
      lastPlayed: null
    });
  },
  
  updateGameState(updates) {
    const state = this.getGameState();
    const newState = { 
      ...state, 
      ...updates, 
      lastUpdated: new Date().toISOString() 
    };
    writeJSONFile(GAME_STATE_FILE, newState);
    return newState;
  },
  
  recordExploration(explorationData) {
    const state = this.getGameState();
    const newExploration = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      ...explorationData
    };
    return this.updateGameState({
      explorationHistory: [newExploration, ...state.explorationHistory].slice(0, 50)
    });
  },
  
  resetGameState() {
    writeJSONFile(GAME_STATE_FILE, {
      playerProgress: {},
      explorationHistory: [],
      unlockedSystems: [],
      unlockedRaces: [],
      resources: {
        food: 0,
        water: 0,
        wood: 0,
        stone: 0
      },
      lastPlayed: new Date().toISOString()
    });
  }
};

// 导出所有功能
module.exports = {
  SessionManager,
  ConversationManager,
  GameStateManager,
  ensureMemoryDir,
  readJSONFile,
  writeJSONFile
};
