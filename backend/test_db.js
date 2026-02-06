import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function testDatabase() {
  try {
    console.log('数据库配置:');
    console.log('DB_HOST:', process.env.DB_HOST);
    console.log('DB_USER:', process.env.DB_USER);
    console.log('DB_NAME:', process.env.DB_NAME);

    const pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    console.log('\n测试数据库连接...');
    const [connection] = await pool.execute('SELECT 1');
    console.log('✓ 数据库连接成功');

    console.log('\n检查收藏表是否存在...');
    const [tables] = await pool.execute('SHOW TABLES LIKE "favorites"');
    if (tables.length > 0) {
      console.log('✓ 收藏表(favorites)已存在');
    } else {
      console.log('✗ 收藏表(favorites)不存在');
      console.log('请运行数据库初始化脚本创建表结构');
    }

    // 测试模型方法
    console.log('\n测试模型方法导入...');
    const FavoriteModel = await import('./models/favoriteModel.js');
    console.log('✓ 模型导入成功');
    
    console.log('模型方法:');
    console.log('addFavorite:', typeof FavoriteModel.default.addFavorite);
    console.log('removeFavorite:', typeof FavoriteModel.default.removeFavorite);
    console.log('getUserFavorites:', typeof FavoriteModel.default.getUserFavorites);
    console.log('isFavorite:', typeof FavoriteModel.default.isFavorite);

    pool.end();
    console.log('\n测试完成');
  } catch (err) {
    console.error('✗ 测试失败:', err.message);
    console.error(err);
  }
}

testDatabase();