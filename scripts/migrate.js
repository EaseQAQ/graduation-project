import mysql from 'mysql2/promise';
import path from 'path';
import { readdir } from 'fs/promises';
import { config } from '../backend/config.js';

// 初始化配置
config.init();

// 创建迁移表SQL
const CREATE_MIGRATIONS_TABLE = `
CREATE TABLE IF NOT EXISTS migrations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  batch INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`;

// 主迁移函数
async function migrate() {
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

    // 确保迁移表存在
    await connection.execute(CREATE_MIGRATIONS_TABLE);

    // 获取已应用的迁移
    const [appliedMigrations] = await connection.execute(
      'SELECT name FROM migrations ORDER BY batch DESC, id DESC'
    );
    const appliedSet = new Set(appliedMigrations.map(m => m.name));

    // 读取迁移文件
    const migrationsDir = path.join(process.cwd(), 'backend/migrations');
    const files = await readdir(migrationsDir);
    const migrationFiles = files
      .filter(f => f.endsWith('.js') && !f.endsWith('.test.js'))
      .sort();

    // 确定需要运行的迁移
    const pendingMigrations = migrationFiles.filter(f => !appliedSet.has(f));
    if (pendingMigrations.length === 0) {
      console.log('✅ 没有待处理的迁移');
      return;
    }

    // 获取当前批次号
    const [[{ maxBatch }]] = await connection.execute(
      'SELECT COALESCE(MAX(batch), 0) as maxBatch FROM migrations'
    );
    const currentBatch = maxBatch + 1;

    // 应用每个迁移
    for (const file of pendingMigrations) {
      try {
        console.log(`🔄 正在应用迁移: ${file}`);
        const migration = await import(path.join(migrationsDir, file));
        await migration.up(connection);
        
        await connection.execute(
          'INSERT INTO migrations (name, batch) VALUES (?, ?)',
          [file, currentBatch]
        );
        
        console.log(`✅ 成功应用迁移: ${file}`);
      } catch (error) {
        console.error(`❌ 迁移失败: ${file}`, error);
        throw error;
      }
    }

    console.log(`🎉 成功应用 ${pendingMigrations.length} 个迁移`);
  } finally {
    if (connection) await connection.end();
  }
}

// 执行迁移
migrate().catch(err => {
  console.error('迁移失败:', err);
  process.exit(1);
});