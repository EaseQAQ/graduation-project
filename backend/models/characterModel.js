import db from '../db.js';

// 角色模型 - 管理角色数据的CRUD操作
const CharacterModel = {
  /**
   * 创建角色表 - 如果表不存在则创建
   * 
   * 功能特点：
   * - 使用条件创建（CREATE TABLE IF NOT EXISTS）
   * - 设置合适的字段类型和约束
   * - 支持完整Unicode字符集（utf8mb4）
   * - 建立主键和索引
   */
  createTable: async () => {
    const connection = await db.pool.getConnection();
    try {
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS characters (
          id int NOT NULL AUTO_INCREMENT,
          name varchar(255) NOT NULL,
          element varchar(50) NOT NULL,
          weapon varchar(50) NOT NULL,
          rarity int NOT NULL,
          region varchar(50) NOT NULL,
          description text,
          image varchar(255) DEFAULT NULL,
          normal_attack varchar(255) DEFAULT NULL,
          elemental_skill varchar(255) DEFAULT NULL,
          elemental_burst varchar(255) DEFAULT NULL,
          ascension_materials text,
          talent_materials text,
          base_hp int NOT NULL,
          base_atk int NOT NULL,
          base_def int NOT NULL,
          character_story text,
          constellations text,
          passive_talents text,
          voice_actor_cn varchar(255) DEFAULT NULL,
          voice_actor_jp varchar(255) DEFAULT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);
      console.log('✅ 角色表创建成功或已存在');
    } catch (error) {
      console.error('❌ 创建角色表错误:', error);
      throw error;
    } finally {
      connection.release();
    }
  },

  /**
   * 获取所有角色 - 查询数据库中的所有角色信息
   * 
   * 功能特点：
   * - 按名称排序返回结果
   * - 返回完整的角色数据
   * - 包含所有字段信息
   * - 支持大数量数据查询
   */
  getAll: async () => {
    try {
      const rows = await db.query(
        'SELECT * FROM characters ORDER BY name',
        [],
        { cacheKey: 'characters:all', ttl: 3600 } // 缓存1小时
      );
      console.log(`✅ 成功获取 ${rows.length} 个角色数据`);
      return rows;
    } catch (error) {
      console.error('❌ 获取所有角色错误:', error);
      throw error;
    }
  },

  /**
   * 根据ID获取角色 - 通过角色ID查询特定角色信息
   * 
   * @param {number} id - 角色的唯一标识符
   * @returns {Object|null} - 找到的角色对象，未找到时返回null
   * @throws {Error} - 当数据库查询失败时抛出错误
   */
  getById: async (id) => {
    try {
      const rows = await db.query(
        'SELECT * FROM characters WHERE id = ?',
        [id],
        { cacheKey: `characters:${id}`, ttl: 3600 } // 缓存1小时
      );
      
      if (rows.length > 0) {
        console.log(`✅ 成功获取角色ID ${id} 的信息`);
        return rows[0];
      } else {
        console.log(`?? 未找到角色ID ${id} 的信息`);
        return null;
      }
    } catch (error) {
      console.error('❌ 根据ID获取角色错误:', error);
      throw error;
    }
  },

  /**
   * 添加新角色 - 向数据库中插入新角色记录
   * 
   * @param {string} name - 角色名称
   * @param {string} element - 元素属性
   * @param {number} rarity - 稀有度等级
   * @param {string} description - 角色描述
   * @param {string} imageUrl - 角色图片URL
   * @returns {number} - 新插入记录的自增ID
   * @throws {Error} - 当插入失败时抛出错误
   */
  addCharacter: async (name, element, rarity, description, imageUrl) => {
    const connection = await db.pool.getConnection();
    try {
      const [result] = await connection.execute(
        'INSERT INTO characters (name, element, rarity, description, image_url) VALUES (?, ?, ?, ?, ?)',
        [name, element, rarity, description, imageUrl]
      );
      console.log(`✅ 成功添加角色: ${name}, ID: ${result.insertId}`);
      
      // 清除相关缓存
      db.queryCache.del('characters:all');
      
      return result.insertId;
    } catch (error) {
      console.error('❌ 添加角色错误:', error);
      throw error;
    } finally {
      connection.release();
    }
  },

  /**
   * 更新角色 - 根据角色ID更新角色信息
   * 
   * @param {number} id - 角色的唯一标识符
   * @param {string} name - 角色名称
   * @param {string} element - 元素属性
   * @param {number} rarity - 稀有度等级
   * @param {string} description - 角色描述
   * @param {string} imageUrl - 角色图片URL
   * @returns {boolean} - 更新成功返回true，失败返回false
   * @throws {Error} - 当更新失败时抛出错误
   */
  updateCharacter: async (id, name, element, rarity, description, imageUrl) => {
    const connection = await db.pool.getConnection();
    try {
      const [result] = await connection.execute(
        'UPDATE characters SET name = ?, element = ?, rarity = ?, description = ?, image_url = ? WHERE id = ?',
        [name, element, rarity, description, imageUrl, id]
      );
      
      if (result.affectedRows > 0) {
        console.log(`✅ 成功更新角色ID ${id} 的信息`);
        
        // 清除相关缓存
        db.queryCache.del(`characters:${id}`);
        db.queryCache.del('characters:all');
        
        return true;
      } else {
        console.log(`⚠️ 未更新角色ID ${id}，可能数据未变化`);
        return false;
      }
    } catch (error) {
      console.error('❌ 更新角色错误:', error);
      throw error;
    } finally {
      connection.release();
    }
  },

  /**
   * 删除角色 - 根据角色ID删除角色记录
   * 
   * @param {number} id - 角色的唯一标识符
   * @returns {boolean} - 删除成功返回true，失败返回false
   * @throws {Error} - 当删除失败时抛出错误
   */
  deleteCharacter: async (id) => {
    const connection = await db.pool.getConnection();
    try {
      const [result] = await connection.execute(
        'DELETE FROM characters WHERE id = ?',
        [id]
      );
      
      if (result.affectedRows > 0) {
        console.log(`✅ 成功删除角色ID ${id}`);
        
        // 清除相关缓存
        db.queryCache.del(`characters:${id}`);
        db.queryCache.del('characters:all');
        
        return true;
      } else {
        console.log(`⚠️ 未删除角色ID ${id}，可能角色不存在`);
        return false;
      }
    } catch (error) {
      console.error('❌ 删除角色错误:', error);
      throw error;
    } finally {
      connection.release();
    }
  }
};

export default CharacterModel;