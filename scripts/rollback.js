import mysql from 'mysql2/promise';
import path from 'path';
import { config } from '../backend/config.js';

// 初始化配置
config.init();

// 主回滚函数
async function rollback() {
  let connection;
  try {
    // 创建数据库连接
    connection = await mysql.createConnection({
      host: config.get('DB_HOST'),
      user: config.get('DB_USER'),
      password: config.get('DB_PASSWORD'),
      database: config.get('DB_NAME'),
      multipleStatements: true
    });

    // 获取最近一批迁移
    const [[{ batch }]] = await connection.execute(
      'SELECT MAX(batch) as batch FROM migrations'
    );
    
    if (!batch) {
      console.log('✅ 没有可回滚的迁移');
      return;
    }

    // 获取该批次的所有迁移
    const [migrations] = await connection.execute(
      'SELECT * FROM migrations WHERE batch = ? ORDER BY id DESC',
      [batch]
    );

    // 回滚每个迁移
    for (const migration of migrations) {
      try {
        console.log(`🔄 正在回滚迁移: ${migration.name}`);
        const migrationModule = await import(
          path.join(process.cwd(), 'backend/migrations', migration.name)
        );
        await migrationModule.down(connection);
        
        await connection.execute(
          'DELETE FROM migrations WHERE id = ?',
          [migration.id]
        );
        
        console.log(`✅ 成功回滚迁移: ${migration.name}`);
      } catch (error) {
        console.error(`❌ 回滚失败: ${migration.name}`, error);
        throw error;
      }
    }

    console.log(`↩️ 成功回滚 ${migrations.length} 个迁移`);
  } finally {
    if (connection) await connection.end();
  }
}

// 执行回滚
rollback().catch(err => {
  console.error('回滚失败:', err);
  process.exit(1);
});