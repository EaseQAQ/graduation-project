import mysql from 'mysql2/promise';
import { config } from './config.js';
import NodeCache from 'node-cache';

// 确保配置已初始化 - 在使用数据库前必须调用
config.init();

// 创建查询缓存 - 用于缓存数据库查询结果，提高性能
// TTL(生存时间): 600秒(10分钟)，过期后自动删除
// 检查周期: 60秒，定期检查过期项
const queryCache = new NodeCache({
  stdTTL: 600, // 10分钟
  checkperiod: 60 // 每分钟检查过期
});

/**
 * 创建MySQL数据库连接池
 * 优化配置项，根据环境自动调整
 * 
 * 连接池优势：
 * - 复用连接，避免频繁建立/关闭连接
 * - 自动管理连接状态
 * - 限制最大连接数，防止系统过载
 * - 支持高并发场景
 */
// 使用config.js统一管理配置
const dbConfig = {
  host: config.get('DB_HOST'),           // 数据库主机地址
  user: config.get('DB_USER'),           // 数据库用户名
  password: config.get('DB_PASSWORD'),   // 数据库密码
  database: config.get('DB_NAME'),       // 数据库名称
  port: parseInt(config.get('DB_PORT')) || 3306, // 数据库端口，默认3306
  
  // 连接属性 - 用于调试和监控
  connectAttributes: {
    program_name: 'genshin-backend',     // 应用程序名称
    _connector: 'mysql2/promise'         // 连接器类型
  }
};

// 验证配置是否加载正确 - 调试用
console.log('✅ 数据库连接配置:', {
  host: dbConfig.host,
  port: dbConfig.port,
  user: dbConfig.user,
  database: dbConfig.database,
  configSource: 'config.js'
});
// 创建连接池
const pool = mysql.createPool({
  ...dbConfig,
  // 连接池优化参数
  waitForConnections: true,            // 等待连接可用
  connectionLimit: process.env.NODE_ENV === 'production' ? 20 : 10, // 生产环境20个，开发环境10个
  queueLimit: process.env.NODE_ENV === 'production' ? 100 : 50,     // 请求数队列长度
  
  // MySQL连接优化参数
  connectTimeout: 10000, // 10秒连接超时
  timezone: '+08:00',    // 时区设置为东八区
  charset: 'utf8mb4',    // 支持完整unicode字符集（包括表情符号）
  
  // 心跳机制 - 保持连接活跃
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000, // 10秒后开始心跳检测
  
  // 调试选项 - 仅在开发环境启用
  debug: process.env.NODE_ENV === 'development',
  trace: process.env.NODE_ENV === 'development'
});

/**
 * 执行数据库查询 - 带缓存功能
 * 
 * 功能特点：
 * - 自动缓存查询结果，提高性能
 * - 支持自定义缓存键和过期时间
 * - 提供详细的错误日志
 * 
 * @param {string} sql - SQL查询语句
 * @param {Array} params - 查询参数数组
 * @param {object} options - 可选参数对象
 *   @property {string} cacheKey - 缓存键名，用于缓存查询结果
 *   @property {number} ttl - 缓存过期时间（秒），默认600秒(10分钟)
 * @returns {Promise<Array>} - 查询结果数组
 * @throws {Error} - 当查询失败时抛出错误
 */
async function query(sql, params, options = {}) {
  // 如果有缓存键且启用缓存
  if (options.cacheKey) {
    const cached = queryCache.get(options.cacheKey);
    if (cached) {
      console.log('[DB] 缓存命中:', options.cacheKey);
      return cached;
    }
  }
  
  // 执行数据库查询
  try {
    const [rows] = await pool.query(sql, params);
    
    // 如果有缓存键，则将结果缓存起来
    if (options.cacheKey) {
      queryCache.set(
        options.cacheKey, 
        rows, 
        options.ttl || 600 // 默认10分钟
      );
    }
    
    return rows;
  } catch (error) {
    console.error('❌ 数据库查询错误:', { sql, params, error });
    throw error;
  }
}

/**
 * 测试数据库连接 - 服务启动时自动执行
 * 
 * 功能流程：
 * 1. 检查配置信息
 * 2. 获取数据库连接
 * 3. 执行基础查询验证连接
 * 4. 查询表结构确认数据库正常
 * 5. 释放连接并返回结果
 * 
 * @returns {Promise<boolean>} - 连接成功返回true，失败抛出异常
 * @throws {Error} - 当连接失败时抛出错误
 */
async function testDbConnection() {
  try {
    console.log('🔍 正在测试数据库连接...', {
      host: config.get('DB_HOST'),
      port: config.get('DB_PORT'),
      user: config.get('DB_USER'),
      database: config.get('DB_NAME')
    });
    
    // 从连接池获取一个连接
    const connection = await pool.getConnection();
    console.log('✅ 数据库连接成功');
    
    // 测试基本查询：1+1=2
    const [result] = await connection.query('SELECT 1 + 1 AS solution');
    console.log('✔️ 基本查询测试:', result[0].solution === 2 ? '通过' : '失败');
    
    // 测试表结构查询
    try {
      const [tables] = await connection.query('SHOW TABLES');
      console.log(`✔️ 发现 ${tables.length} 个数据表`);
    } catch (tableError) {
      console.error('⚠️ 表查询失败:', tableError.message);
    }
    
    // 释放连接回连接池
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ 数据库连接失败:', {
      message: error.message,
      code: error.code,
      errno: error.errno,
      sqlState: error.sqlState
    });
    throw error;
  }
}

export default {
  pool,
  query,
  testDbConnection
};