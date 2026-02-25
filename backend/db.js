import mysql from 'mysql2/promise';

/**
 * 创建MySQL数据库连接池
 * 使用环境变量配置连接参数，若未设置则使用默认值
 * 连接池优势：
 * - 复用连接避免频繁建立/关闭
 * - 自动管理连接状态
 * - 限制最大连接数防止过载
 */
// 生产环境强制校验
if (process.env.NODE_ENV === 'production') {
  if (!process.env.DB_USER) throw new Error('缺少DB_USER配置');
  if (!process.env.DB_PASSWORD) throw new Error('缺少DB_PASSWORD配置');
}

console.log('数据库配置来源:', {
  host: process.env.DB_HOST || '(使用默认值)',
  user: process.env.DB_USER || '(使用默认值)',
  env: process.env.NODE_ENV || 'development'
});

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.NODE_ENV === 'production' ? process.env.DB_USER : (process.env.DB_USER || 'root'),
  password: process.env.NODE_ENV === 'production' ? process.env.DB_PASSWORD : (process.env.DB_PASSWORD || 'root'),
  database: process.env.DB_NAME || 'genshin_characters',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

/**
 * 测试数据库连接
 * 服务启动时自动执行，验证数据库可用性
 */
async function testDbConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connection successful (shared pool)');
    connection.release();
  } catch (error) {
    console.error('❌ Database connection error:', error);
  }
}

testDbConnection();

export default pool;