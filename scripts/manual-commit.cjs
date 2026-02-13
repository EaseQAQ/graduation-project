#!/usr/bin/env node
console.log('手动提交开始...');

const { execSync } = require('child_process');

try {
  // 1. 添加所有变更
  console.log('添加变更...');
  execSync('git add .', { stdio: 'inherit' });
  
  // 2. 生成提交消息
  const timestamp = new Date().toISOString();
  const commitMessage = `manual: ${timestamp}`;
  
  // 3. 执行提交
  console.log('提交变更...');
  execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });
  
  // 4. 尝试推送到远程仓库
  console.log('推送变更...');
  execSync('git push', { stdio: 'inherit' });
  
  console.log('✅ 提交和推送成功完成');
} catch (error) {
  console.error('❌ 提交失败:', error.message);
  process.exit(1);
}