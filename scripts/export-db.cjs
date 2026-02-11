const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

// 加载环境变量（与项目模型设置一致）
dotenv.config();

// 数据库连接池（与userModel.js相同）
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || 'root',
  database: process.env.DB_NAME || 'genshin_characters',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 辅助函数：从模型文件获取表名（例如，userModel.js → users）
function getTableNameFromModelFile(fileName) {
  const baseName = fileName.replace('.js', '').replace('Model', '');
  return baseName.toLowerCase() + 's';
}

// 2. 所有模型路径（从 backend/models/ 加载）
const modelsDir = path.join(__dirname, '../backend/models');

// 3. 存储最终的 SQL 内容
let sqlContent = '';

// 4. 获取所有模型并导出
async function exportDatabase() {
  try {
    console.log('✅ 初始化数据库连接池');
    // 测试连接
    const testConn = await pool.getConnection();
    testConn.release();
    console.log('✅ 数据库连接成功');

    // 读取所有模型文件
    const modelFiles = fs.readdirSync(modelsDir).filter(file => file.endsWith('.js'));
    
    let connection;
    try {
      connection = await pool.getConnection();
      for (const file of modelFiles) {
        const tableName = getTableNameFromModelFile(file);
        console.log(`🔄 导出表: ${tableName}`);

      // 1. 生成 CREATE TABLE 语句
        const [createTableRows] = await connection.execute(
          `SHOW CREATE TABLE \`${tableName}\`;`
        );

        if (createTableRows.length > 0) {
          let createSql = createTableRows[0]['Create Table'];
          // 添加IF NOT EXISTS防止导入时重复表错误
          createSql = createSql.replace(/CREATE TABLE (\`\w+\`)/, "CREATE TABLE IF NOT EXISTS $1");
          sqlContent += `-- Table: ${tableName}\n`;
          sqlContent += `${createSql};\n\n`;
        }

      // 2. 生成数据插入语句
        const [dataRows] = await connection.execute(
          `SELECT * FROM \`${tableName}\`;`
        );

        if (dataRows.length > 0) {
          for (const row of dataRows) {
          const columns = Object.keys(row).map(col => `\`${col}\``).join(', ');
          const values = Object.values(row).map(val => {
            if (val === null) return 'NULL';
            if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
            return val;
          }).join(', ');

          sqlContent += `INSERT INTO \`${tableName}\` (${columns}) VALUES (${values});\n`;
        }
        sqlContent += '\n';
      }
    }
  } finally {
    if (connection) connection.release();
  }

    // 5. 写入文件
    const outputPath = path.join(__dirname, 'export-db.sql');
    fs.writeFileSync(outputPath, sqlContent, 'utf8');
    console.log(`✅ 导出完成: ${outputPath}`);
  } catch (error) {
    console.error('❌ 导出失败:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

exportDatabase();