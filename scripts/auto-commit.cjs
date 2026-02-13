#!/usr/bin/env node
// 添加明确的UTF-8编码支持
process.stdin.setEncoding('utf8');
process.stdout.setEncoding('utf8');

const { execSync } = require('child_process');
const { existsSync, readFileSync, writeFileSync } = require('fs');
const path = require('path');

// 确保控制台输出正确的文本编码
console.log('开始自动提交流程...'.normalize());

// 检查是否有未提交的更改
let hasChanges = false;
try {
  const statusOutput = execSync('git status --porcelain', { encoding: 'utf8' });
  hasChanges = statusOutput.trim().length > 0;
} catch (error) {
  console.error('检查Git状态时出错:', error.message);
  process.exit(1);
}

if (!hasChanges) {
  console.log('没有检测到任何更改，无需提交');
  process.exit(0);
}

// 1. 添加所有变更
console.log('正在添加所有变更...');
try {
  execSync('git add .', { stdio: 'inherit' });
} catch (error) {
  console.error('添加变更时出错:', error.message);
  process.exit(1);
}

// 2. 生成提交消息
const timestamp = new Date().toISOString();
const commitMessage = `auto: ${timestamp}`;

// 3. 执行提交
console.log('正在提交...');
try {
  execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });
} catch (error) {
  console.log('提交失败:', error.message);
  process.exit(1);
}

// 4. 尝试推送到远程仓库
console.log('正在推送...');
try {
  execSync('git push', { stdio: 'inherit' });
  console.log('✅ 自动提交和推送成功完成');
} catch (error) {
  const errorMessage = '❌ 推送失败，请手动解决冲突后再尝试\n' + 
                       '错误详情: ' + error.message.normalize();
  console.error(errorMessage);
  process.exit(1);
}