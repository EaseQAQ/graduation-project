export default {
  up: async (pool) => {
    // 创建用户表
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 创建角色表
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS characters (
        id int NOT NULL AUTO_INCREMENT PRIMARY KEY,
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

    // 创建收藏表
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS favorites (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        character_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_character (user_id, character_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
  },

  down: async (pool) => {
    // 删除所有表（按依赖顺序）
    await pool.execute('DROP TABLE IF EXISTS favorites');
    await pool.execute('DROP TABLE IF EXISTS characters');
    await pool.execute('DROP TABLE IF EXISTS users');
  }
};