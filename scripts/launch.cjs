// 全栈启动脚本 (终极兼容版)
const { exec } = require('child_process');
const path = require('path');

console.log('🚀 启动全栈开发环境...');

// 定义路径 (Windows兼容)
const backendPath = path.join(__dirname, '../backend');
const frontendPath = __dirname;

// 启动前端服务
const frontend = exec('npm run dev', {
  cwd: frontendPath,
  windowsHide: true
}, (err) => {
  if (err) console.error('前端启动失败:', err.message);
});

// 启动后端服务
const backend = exec('node server.js', {
  cwd: backendPath,
  windowsHide: true
}, (err) => {
  if (err) {
    console.error('后端启动失败:', err.message);
    console.log('请手动运行:');
    console.log(`  1. cd ${backendPath}`);
    console.log('  2. node server.js');
  }
});

// 日志转发
frontend.stdout.on('data', (data) => console.log('[前端]', data.toString().trim()));
backend.stdout.on('data', (data) => console.log('[后端]', data.toString().trim()));

// 清理子进程
process.on('exit', () => {
  frontend.kill();
  backend.kill();
});

console.log(`
✅ 服务入口:
• 前端: http://localhost:5173
• 后端: http://localhost:3001
`);