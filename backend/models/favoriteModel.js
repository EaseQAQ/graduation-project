import db from '../db.js';

// 收藏模型 - 管理用户收藏角色的数据操作
const FavoriteModel = {
  /**
   * 创建收藏表 - 如果表不存在则创建
   * 
   * 功能特点：
   * - 使用条件创建（CREATE TABLE IF NOT EXISTS）
   * - 设置主键和外键约束
   * - 添加唯一约束防止重复收藏
   * - 支持级联删除
   * - 使用完整Unicode字符集（utf8mb4）
   */
  createTable: async () => {
    const connection = await db.pool.getConnection();
    try {
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS favorites (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          character_id INT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          UNIQUE KEY unique_user_character (user_id, character_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);
      console.log('✅ 收藏表创建成功或已存在');
    } catch (error) {
      console.error('❌ 创建收藏表错误:', error);
      throw error;
    } finally {
      connection.release();
    }
  },

  /**
   * 添加收藏 - 将指定角色添加到用户的收藏列表中
   * 
   * @param {number} userId - 用户的唯一标识符
   * @param {number} characterId - 角色的唯一标识符
   * @returns {boolean} - 插入成功返回true，失败返回false
   * @throws {Error} - 当插入失败时抛出错误
   */
  addFavorite: async (userId, characterId) => {
    const connection = await db.pool.getConnection();
    try {
      const [result] = await connection.execute(
        'INSERT INTO favorites (user_id, character_id) VALUES (?, ?)',
        [userId, characterId]
      );
      
      if (result.affectedRows > 0) {
        console.log(`✅ 成功添加用户ID ${userId} 收藏角色ID ${characterId}`);
        
        // 清除相关缓存
        db.queryCache.del(`favorites:user:${userId}`);
        db.queryCache.del(`favorites:user:${userId}:character:${characterId}`);
        
        return true;
      } else {
        console.log(`⚠️ 未添加收藏，可能已存在或数据无效`);
        return false;
      }
    } catch (error) {
      console.error('❌ 添加收藏错误:', error);
      throw error;
    } finally {
      connection.release();
    }
  },

  /**
   * 取消收藏 - 从用户的收藏列表中移除指定角色
   * 
   * @param {number} userId - 用户的唯一标识符
   * @param {number} characterId - 角色的唯一标识符
   * @returns {boolean} - 删除成功返回true，失败返回false
   * @throws {Error} - 当删除失败时抛出错误
   */
  removeFavorite: async (userId, characterId) => {
    const connection = await db.pool.getConnection();
    try {
      const [result] = await connection.execute(
        'DELETE FROM favorites WHERE user_id = ? AND character_id = ?',
        [userId, characterId]
      );
      
      if (result.affectedRows > 0) {
        console.log(`✅ 成功取消用户ID ${userId} 收藏角色ID ${characterId}`);
        
        // 清除相关缓存
        db.queryCache.del(`favorites:user:${userId}`);
        db.queryCache.del(`favorites:user:${userId}:character:${characterId}`);
        
        return true;
      } else {
        console.log(`⚠️ 未取消收藏，可能该角色不在收藏列表中`);
        return false;
      }
    } catch (error) {
      console.error('❌ 取消收藏错误:', error);
      throw error;
    } finally {
      connection.release();
    }
  },

  /**
   * 检查是否已收藏 - 验证指定用户是否已经收藏了指定角色
   * 
   * @param {number} userId - 用户的唯一标识符
   * @param {number} characterId - 角色的唯一标识符
   * @returns {boolean} - 已收藏返回true，未收藏返回false
   * @throws {Error} - 当查询失败时抛出错误
   */
  isFavorite: async (userId, characterId) => {
    try {
      const rows = await db.query(
        'SELECT * FROM favorites WHERE user_id = ? AND character_id = ?',
        [userId, characterId],
        { cacheKey: `favorites:user:${userId}:character:${characterId}`, ttl: 300 } // 缓存5分钟
      );
      
      if (rows.length > 0) {
        console.log(`✅ 用户ID ${userId} 已收藏角色ID ${characterId}`);
        return true;
      } else {
        console.log(`🔍 用户ID ${userId} 未收藏角色ID ${characterId}`);
        return false;
      }
    } catch (error) {
      console.error('❌ 检查收藏状态错误:', error);
      throw error;
    }
  },

  /**
   * 获取用户所有收藏 - 获取指定用户的所有收藏角色ID列表
   * 
   * @param {number} userId - 用户的唯一标识符
   * @returns {Array<number>} - 收藏的角色ID数组
   * @throws {Error} - 当查询失败时抛出错误
   */
  getUserFavorites: async (userId) => {
    try {
      const rows = await db.query(
        'SELECT character_id FROM favorites WHERE user_id = ?',
        [userId],
        { cacheKey: `favorites:user:${userId}`, ttl: 300 } // 缓存5分钟
      );
      
      const favoriteIds = rows.map(row => row.character_id);
      console.log(`✅ 成功获取用户ID ${userId} 的 ${favoriteIds.length} 个收藏`);
      return favoriteIds;
    } catch (error) {
      console.error('❌ 获取用户收藏列表错误:', error);
      throw error;
    }
  }
};

// 导出模型对象
export { FavoriteModel as default };