/**
 * 游戏服务器重启脚本
 * 用于在每轮对话后自动重启游戏服务器并刷新浏览器
 */

const { exec, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');

const MEMORY_FILE = path.join(__dirname, '../memory/server-state.json');
const BROWSER_REFRESH_FILE = path.join(__dirname, '../memory/browser-refresh.json');

// 确保记忆目录存在
function ensureMemoryDir() {
  const memoryDir = path.dirname(MEMORY_FILE);
  if (!fs.existsSync(memoryDir)) {
    fs.mkdirSync(memoryDir, { recursive: true });
  }
}

// 读取服务器状态
function readServerState() {
  ensureMemoryDir();
  try {
    if (fs.existsSync(MEMORY_FILE)) {
      return JSON.parse(fs.readFileSync(MEMORY_FILE, 'utf8'));
    }
  } catch (error) {
    console.error('读取服务器状态失败:', error);
  }
  return {
    status: 'stopped',
    pid: null,
    lastRestart: null,
    restartCount: 0,
    refreshCount: 0
  };
}

// 保存服务器状态
function saveServerState(state) {
  ensureMemoryDir();
  try {
    fs.writeFileSync(MEMORY_FILE, JSON.stringify(state, null, 2));
  } catch (error) {
    console.error('保存服务器状态失败:', error);
  }
}

// 记录浏览器刷新
function recordBrowserRefresh() {
  ensureMemoryDir();
  const refreshData = {
    timestamp: new Date().toISOString(),
    count: (readServerState().refreshCount || 0) + 1
  };
  fs.writeFileSync(BROWSER_REFRESH_FILE, JSON.stringify(refreshData, null, 2));
  
  const state = readServerState();
  state.refreshCount = refreshData.count;
  saveServerState(state);
  
  return refreshData;
}

// 刷新浏览器 - Windows 系统
function refreshBrowser() {
  return new Promise((resolve) => {
    console.log('🔄 正在刷新浏览器...');
    
    // 方法1: 使用 PowerShell 刷新活动浏览器标签页
    const refreshScript = `
      Add-Type -TypeDefinition @'
      using System;
      using System.Runtime.InteropServices;
      public class WindowHelper {
          [DllImport("user32.dll", SetLastError = true)]
          public static extern IntPtr GetForegroundWindow();
          
          [DllImport("user32.dll", CharSet = CharSet.Auto)]
          public static extern bool PostMessage(IntPtr hWnd, uint Msg, IntPtr wParam, IntPtr lParam);
      }
'@
      
      # 发送 F5 按键到活动窗口
      $signature = @'
      [DllImport("user32.dll", SetLastError = true)]
      public static extern void keybd_event(byte bVk, byte bScan, uint dwFlags, UIntPtr dwExtraInfo);
'@
      
      $type = Add-Type -MemberDefinition $signature -Name "Keyboard" -Namespace Win32 -PassThru
      $VK_F5 = 0x74
      $KEYEVENTF_KEYUP = 0x2
      
      $type::keybd_event($VK_F5, 0, 0, 0)
      Start-Sleep -Milliseconds 50
      $type::keybd_event($VK_F5, 0, $KEYEVENTF_KEYUP, 0)
    `;
    
    exec(`powershell -Command "${refreshScript.replace(/"/g, '\\"')}"`, (error) => {
      if (error) {
        // 如果 PowerShell 方法失败，尝试其他方法
        console.log('尝试使用替代刷新方法...');
        
        // 方法2: 创建一个临时文件，让浏览器检测到变化
        const refreshMarker = path.join(__dirname, '../memory/.refresh-marker');
        fs.writeFileSync(refreshMarker, Date.now().toString());
        setTimeout(() => {
          try {
            fs.unlinkSync(refreshMarker);
          } catch {}
        }, 1000);
      }
      
      const refreshData = recordBrowserRefresh();
      console.log(`✅ 浏览器刷新信号已发送 (刷新次数: ${refreshData.count})`);
      resolve();
    });
  });
}

// 启动一个简单的刷新通知服务器
function startRefreshNotifier() {
  const server = http.createServer((req, res) => {
    if (req.url === '/api/refresh-status') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      const state = readServerState();
      const refreshData = fs.existsSync(BROWSER_REFRESH_FILE) 
        ? JSON.parse(fs.readFileSync(BROWSER_REFRESH_FILE, 'utf8'))
        : { count: 0 };
      
      res.end(JSON.stringify({
        serverStatus: state.status,
        lastRestart: state.lastRestart,
        refreshCount: refreshData.count,
        lastRefresh: refreshData.timestamp
      }));
    } else if (req.url === '/api/trigger-refresh') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      refreshBrowser().then(() => {
        res.end(JSON.stringify({ success: true }));
      });
    } else {
      res.writeHead(404);
      res.end();
    }
  });
  
  server.listen(8082, () => {
    console.log('🔔 刷新通知服务器运行在 http://localhost:8082');
  });
  
  return server;
}

// 停止占用8081端口的进程
function stopExistingServer() {
  return new Promise((resolve) => {
    exec('netstat -ano | findstr :8081', (error, stdout) => {
      if (!error && stdout) {
        const lines = stdout.trim().split('\n');
        const pids = [];
        
        lines.forEach(line => {
          const match = line.match(/\s+(\d+)\s*$/);
          if (match) {
            pids.push(match[1]);
          }
        });
        
        if (pids.length > 0) {
          console.log(`发现占用8081端口的进程: ${pids.join(', ')}`);
          
          // 终止所有相关进程
          const killPromises = pids.map(pid => {
            return new Promise((killResolve) => {
              exec(`taskkill /F /PID ${pid}`, (killError) => {
                if (!killError) {
                  console.log(`已终止进程 ${pid}`);
                }
                killResolve();
              });
            });
          });
          
          Promise.all(killPromises).then(() => {
            setTimeout(resolve, 1000); // 等待进程完全终止
          });
        } else {
          resolve();
        }
      } else {
        resolve();
      }
    });
  });
}

// 启动服务器
function startServer() {
  return new Promise((resolve, reject) => {
    console.log('正在启动游戏服务器...');
    
    const env = { ...process.env, CI: 'false' };
    const server = spawn('npm', ['start'], {
      cwd: path.join(__dirname, '../../'),
      shell: true,
      detached: false,
      env: env
    });
    
    let started = false;
    let timeoutId;
    let refreshNotifier = null;
    
    server.stdout.on('data', (data) => {
      const output = data.toString();
      console.log(output);
      
      if (!started && (output.includes('Metro Bundler') || output.includes('waiting on') || output.includes('Local:'))) {
        started = true;
        if (timeoutId) clearTimeout(timeoutId);
        
        const state = readServerState();
        state.status = 'running';
        state.pid = server.pid;
        state.lastRestart = new Date().toISOString();
        state.restartCount = (state.restartCount || 0) + 1;
        saveServerState(state);
        
        console.log('✅ 游戏服务器启动成功！');
        
        // 启动刷新通知服务器
        try {
          refreshNotifier = startRefreshNotifier();
        } catch (e) {
          console.log('刷新通知服务器启动失败:', e.message);
        }
        
        // 延迟刷新浏览器，确保服务器完全就绪
        setTimeout(async () => {
          await refreshBrowser();
          resolve(server);
        }, 2000);
      }
    });
    
    server.stderr.on('data', (data) => {
      console.error('服务器错误:', data.toString());
    });
    
    server.on('error', (error) => {
      console.error('启动服务器失败:', error);
      reject(error);
    });
    
    server.on('close', (code) => {
      console.log(`服务器进程退出，代码: ${code}`);
      const state = readServerState();
      state.status = 'stopped';
      state.pid = null;
      saveServerState(state);
      
      if (refreshNotifier) {
        try {
          refreshNotifier.close();
        } catch (e) {}
      }
    });
    
    // 设置超时
    timeoutId = setTimeout(() => {
      if (!started) {
        reject(new Error('服务器启动超时'));
      }
    }, 30000);
  });
}

// 主重启函数
async function restartGameServer() {
  console.log('🚀 开始重启游戏服务器...');
  
  const state = readServerState();
  console.log(`当前状态: ${state.status}, 重启次数: ${state.restartCount || 0}`);
  
  try {
    // 1. 停止现有服务器
    console.log('⏹️  停止现有服务器...');
    await stopExistingServer();
    
    // 2. 等待一下
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 3. 启动新服务器
    console.log('▶️  启动新服务器...');
    await startServer();
    
    console.log('✨ 服务器重启完成，浏览器已刷新！');
  } catch (error) {
    console.error('❌ 重启服务器失败:', error);
    throw error;
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  restartGameServer().catch(console.error);
}

module.exports = {
  restartGameServer,
  stopExistingServer,
  startServer,
  readServerState,
  saveServerState,
  refreshBrowser,
  startRefreshNotifier,
  recordBrowserRefresh
};
