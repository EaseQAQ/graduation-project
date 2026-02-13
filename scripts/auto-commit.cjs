#!/usr/bin/env node
const { execSync } = require('child_process');
const { existsSync, readFileSync, writeFileSync } = require('fs');
const path = require('path');

console.log('开始自动提交流程...');

// 1. 添加所有变更
execSync('git add .', { stdio: 'inherit' });

// 2. 生成提交消息
const timestamp = new Date().toISOString();
const commitMessage = `auto: ${timestamp}`;

// 3. 执行提交
try {
  execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });
} catch (error) {
  console.log('没有变更需要提交，跳过提交步骤');
  process.exit(0);
}

// 4. 尝试推送到远程仓库
try {
  execSync('git push', { stdio: 'inherit' });
  console.log('✅ 自动提交和推送成功完成');
} catch (error) {
  console.error('❌ 推送失败，请手动解决冲突后再尝试');
}