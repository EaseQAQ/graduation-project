# 数据库迁移系统

## 使用说明

1. 每次数据库变更都应创建一个新的迁移文件
2. 文件名格式：`YYYYMMDD-HHMMSS-描述性名称.js`
3. 迁移文件应包含 `up` (应用变更) 和 `down` (撤销变更) 两个函数

## 示例迁移文件

```javascript
module.exports = {
  up: async (pool) => {
    await pool.execute(`ALTER TABLE users ADD COLUMN last_login TIMESTAMP`);
  },
  down: async (pool) => {
    await pool.execute(`ALTER TABLE users DROP COLUMN last_login`);
  }
};
```

## 运行迁移

使用迁移工具运行：
```bash
node scripts/migrate.js
```