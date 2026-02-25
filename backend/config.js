import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

// 获取当前文件路径 - 用于确定.env文件的相对路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class Config {
  /**
   * 初始化配置 - 在使用配置前必须调用
   * 
   * 功能流程：
   * 1. 确定.env文件路径
   * 2. 加载环境变量
   * 3. 验证必需的环境变量
   * 4. 设置默认值
   * 5. 打印配置摘要
   */
  static init() {
    // 明确指定.env文件路径 - 用于加载环境变量
    const envPath = path.join(__dirname, '.env');
    console.log('🔍 正在加载环境变量文件:', envPath);
    dotenv.config({ path: envPath });

    // 打印所有加载的环境变量用于调试 - 仅显示与数据库、服务器和安全相关的变量
    console.log('=== 已加载的环境变量 ===');
    Object.keys(process.env).forEach(key => {
      if (key.startsWith('DB_') || key === 'BACKEND_PORT' || key === 'JWT_SECRET' || key === 'NODE_ENV') {
        console.log(`${key}: ${key.includes('PASSWORD') || key.includes('SECRET') ? '***' : process.env[key]}`);
      }
    });
    console.log('====================================');

    // 必需的环境变量 - 生产环境中必须设置
    const requiredVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'JWT_SECRET'];
    
    if (process.env.NODE_ENV === 'production') {
      // 检查生产环境必需的环境变量是否都已设置
      for (const key of requiredVars) {
        if (!process.env[key]) {
          throw new Error(`❌ 缺少必需的环境变量: ${key}`);
        }
      }
    }

    // 确保环境变量已加载 - 二次确认，防止遗漏
    dotenv.config({ path: path.join(__dirname, '.env') });
    
    // 设置默认值 - 当环境变量未设置时使用默认值
    this._config = {
      DB_HOST: process.env.DB_HOST || 'localhost',           // 数据库主机地址
      DB_USER: process.env.DB_USER || 'root',               // 数据库用户名
      DB_PASSWORD: process.env.DB_PASSWORD || 'root',       // 数据库密码
      DB_NAME: process.env.DB_NAME || 'genshin_characters', // 数据库名称
      DB_PORT: process.env.DB_PORT || '3306',               // 数据库端口
      BACKEND_PORT: process.env.BACKEND_PORT || '3001',     // 后端服务端口
      JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key' // JWT密钥
    };

    // 打印配置摘要（除敏感信息外）- 用于验证配置正确性
    console.log('==== 环境变量配置 ====');
    console.log('DB_HOST:', process.env.DB_HOST);
    console.log('DB_USER:', process.env.DB_USER);
    console.log('DB_NAME:', process.env.DB_NAME);
    console.log('BACKEND_PORT:', process.env.BACKEND_PORT);
    console.log('JWT_SECRET:', process.env.JWT_SECRET ? '***' : 'NOT SET');
    console.log('NODE_ENV:', process.env.NODE_ENV || 'development');
    console.log('======================');
  }

  /**
   * 获取配置值
   * 
   * @param {string} key - 配置键名
   * @returns {*} - 对应的配置值
   * @throws {Error} - 当配置不存在时抛出错误
   */
  static get(key) {
    if (!this._config[key]) {
      throw new Error(`❌ 配置项 ${key} 不存在`);
    }
    return this._config[key];
  }
}

export const config = Config;