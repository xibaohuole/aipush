#!/usr/bin/env node

/**
 * 自动清理占用端口的脚本
 * 在启动开发服务器前自动释放端口
 */

const { execSync } = require('child_process');
const os = require('os');

const PORTS = [3000, 4000, 5173, 5174]; // 需要清理的端口

function killPort(port) {
  const platform = os.platform();

  try {
    if (platform === 'win32') {
      // Windows系统
      const result = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf-8' });

      if (result) {
        const lines = result.split('\n').filter(line => line.includes('LISTENING'));

        lines.forEach(line => {
          const parts = line.trim().split(/\s+/);
          const pid = parts[parts.length - 1];

          if (pid && !isNaN(pid)) {
            try {
              execSync(`taskkill //F //PID ${pid}`, { encoding: 'utf-8' });
              console.log(`✅ 已释放端口 ${port} (PID: ${pid})`);
            } catch (err) {
              // 进程可能已经结束
            }
          }
        });
      }
    } else {
      // Unix/Linux/Mac系统
      try {
        const result = execSync(`lsof -ti:${port}`, { encoding: 'utf-8' });
        const pid = result.trim();

        if (pid) {
          execSync(`kill -9 ${pid}`);
          console.log(`✅ 已释放端口 ${port} (PID: ${pid})`);
        }
      } catch (err) {
        // 端口未被占用
      }
    }
  } catch (error) {
    // 端口未被占用，忽略错误
  }
}

console.log('🔍 检查并清理占用的端口...\n');

PORTS.forEach(port => {
  killPort(port);
});

console.log('\n✨ 端口清理完成！');
