import 'dotenv/config';
import mysql from 'mysql2/promise';
import { execSync } from 'child_process';

// 导入角色数据函数 - 将角色数据从JSON文件导入到MySQL数据库
async function importCharacters() {
  try {
    // 步骤1: 从转换脚本获取角色数据
    console.log('Fetching character data...');
    const characterJson = execSync('node transform_character_data.js', { encoding: 'utf-8' });
    const characters = JSON.parse(characterJson);
    console.log(`Found ${characters.length} characters to import`);

    // 步骤2: 连接到MySQL数据库
    console.log('Connecting to database...');
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    // 步骤3: 创建表（如果不存在）
    console.log('Creating table if not exists...');
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS characters (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        element VARCHAR(50) NOT NULL,
        weapon VARCHAR(50) NOT NULL,
        rarity INT NOT NULL,
        region VARCHAR(50) NOT NULL,
        description TEXT,
        image VARCHAR(255),
        normal_attack VARCHAR(255),
        elemental_skill VARCHAR(255),
        elemental_burst VARCHAR(255),
        ascension_materials TEXT,
        talent_materials TEXT,
        base_hp INT NOT NULL,
        base_atk INT NOT NULL,
        base_def INT NOT NULL,
        character_story TEXT,
        constellations TEXT,
        passive_talents TEXT,
        voice_actor_cn VARCHAR(255),
        voice_actor_jp VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_name (name)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;
    await connection.execute(createTableQuery);

    // 步骤4: 插入角色数据
    console.log('Inserting characters...');
    let insertedCount = 0;
    let skippedCount = 0;

    for (const char of characters) {
      try {
        // 将数组转换为JSON字符串
        const ascensionMaterials = JSON.stringify(char.ascension_materials);
        const talentMaterials = JSON.stringify(char.talent_materials);
        const constellations = JSON.stringify(char.constellations);
        const passiveTalents = JSON.stringify(char.passive_talents);
        
        const [result] = await connection.execute(
          `INSERT INTO characters 
            (name, element, weapon, rarity, region, description, image, 
              normal_attack, elemental_skill, elemental_burst, 
              ascension_materials, talent_materials,
              base_hp, base_atk, base_def,
              character_story, constellations, passive_talents,
              voice_actor_cn, voice_actor_jp)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
              element=VALUES(element), weapon=VALUES(weapon), rarity=VALUES(rarity),
              region=VALUES(region), description=VALUES(description), image=VALUES(image),
              normal_attack=VALUES(normal_attack), elemental_skill=VALUES(elemental_skill),
              elemental_burst=VALUES(elemental_burst), ascension_materials=VALUES(ascension_materials),
              talent_materials=VALUES(talent_materials),
              base_hp=VALUES(base_hp), base_atk=VALUES(base_atk), base_def=VALUES(base_def),
              character_story=VALUES(character_story), constellations=VALUES(constellations),
              passive_talents=VALUES(passive_talents),
              voice_actor_cn=VALUES(voice_actor_cn), voice_actor_jp=VALUES(voice_actor_jp)`,
          [
            char.NAME,
            char.element,
            char.weapon,
            char.rarity,
            char.region,
            char.description,
            char.image,
            char.normal_attack,
            char.elemental_skill,
            char.elemental_burst,
            ascensionMaterials,
            talentMaterials,
            char.base_hp,
            char.base_atk,
            char.base_def,
            char.character_story,
            constellations,
            passiveTalents,
            char.voice_actor_cn,
            char.voice_actor_jp
          ]
        );

        if (result.affectedRows === 1) {
          insertedCount++;
        } else if (result.affectedRows === 2) {
          skippedCount++; // 更新已存在的记录
        }
      } catch (insertErr) {
        console.error(`Error inserting ${char.NAME}:`, insertErr.message);
      }
    }

    console.log(`Import completed: ${insertedCount} inserted, ${skippedCount} updated/skipped`);

    // 步骤5: 验证插入结果
    const [rows] = await connection.execute('SELECT COUNT(*) AS total FROM characters');
    console.log(`Total characters in database: ${rows[0].total}`);

    await connection.end();
    return { success: true, inserted: insertedCount, updated: skippedCount, total: rows[0].total };
  } catch (err) {
    console.error('Import failed:', err.message);
    return { success: false, error: err.message };
  }
}

// 运行导入程序
importCharacters();