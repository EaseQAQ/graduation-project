const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

// 加载环境变量（与项目模型设置一致）
dotenv.config();

// 数据库连接池（与userModel.js和导出脚本一致）
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

// 辅助函数：将SQL内容拆分为有效语句（正确处理字符串/注释）
function splitSqlStatements(sqlContent) {
  const statements = [];
  let currentStmt = '';
  let inString = false;
  let stringChar = '';
  let inComment = false;

  for (const char of sqlContent) {
    // 处理行注释（-- ...）
    if (!inString && char === '-' && currentStmt.endsWith('-')) {
      inComment = true;
      currentStmt = currentStmt.slice(0, -1); // 移除最后一个'-'
      continue;
    }
    if (inComment && char === '\n') {
      inComment = false;
      continue;
    }
    if (inComment) continue;

    // 处理字符串（单/双引号）
    if (!inString && (char === "'" || char === '"')) {
      inString = true;
      stringChar = char;
      currentStmt += char;
      continue;
    }
    if (inString && char === stringChar) {
      inString = false;
      currentStmt += char;
      continue;
    }

    // 处理语句终止符（;）
    if (!inString && char === ';') {
      currentStmt += char;
      statements.push(currentStmt.trim());
      currentStmt = '';
      continue;
    }

    currentStmt += char;
  }

  // 添加剩余语句（如果有）
  if (currentStmt.trim()) statements.push(currentStmt.trim());
  return statements;
}

// 主导入函数
async function importDatabase() {
  let connection;
  try {
    console.log('✅ 初始化数据库连接池');
    
    // 检查并创建数据库（如果不存在）
    const tempPool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || 'root',
      waitForConnections: true,
      connectionLimit: 1,
      queueLimit: 0
    });
    
    const tempConn = await tempPool.getConnection();
    const dbName = process.env.DB_NAME || 'genshin_characters';
    
    // 检查数据库是否存在
    const [rows] = await tempConn.query(`SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?`, [dbName]);
    if (rows.length === 0) {
      console.log(`📦 创建数据库: ${dbName}`);
      await tempConn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    }
    tempConn.release();
    await tempPool.end();
    
    // 测试连接有效性
    const testConn = await pool.getConnection();
    testConn.release();
    console.log('✅ 数据库连接成功');

    // 读取SQL文件
    const sqlFilePath = path.join(__dirname, 'export-db.sql');
    if (!fs.existsSync(sqlFilePath)) {
      throw new Error(`SQL文件未找到：${sqlFilePath}`);
    }
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    console.log(`📄 读取SQL文件：${sqlFilePath}（${sqlContent.length} 字节）`);

    // 拆分为有效语句
    const statements = splitSqlStatements(sqlContent);
    console.log(`🔢 解析到 ${statements.length} 条SQL语句`);

    // 获取连接并开始事务
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // 执行每个语句
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      if (!stmt) continue;

      try {
        await connection.execute(stmt);
        console.log(`✅ 执行语句 ${i+1}/${statements.length}：${stmt.slice(0,50)}...`);
      } catch (stmtError) {
        await connection.rollback();
        throw new Error(`语句 ${i+1} 执行失败：${stmtError.message}\nSQL：${stmt}`);
      }
    }

    // 提交事务
    await connection.commit();
    console.log('🎉 所有语句执行成功。事务已提交。');
    console.log(`✅ 导入完成：${sqlFilePath}`);
  } catch (error) {
    console.error('❌ 导入失败：', error.message);
    process.exit(1);
  } finally {
    if (connection) connection.release();
    await pool.end();
  }
}

// 运行导入
importDatabase();