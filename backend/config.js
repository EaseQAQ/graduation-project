import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

// 获取当前文件路径 - 用于确定.env文件的相对路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class Config {
  static #initialized = false;
  static #config = {};

  /**
   * 初始化配置 - 在使用配置前必须调用
   * 
   * 功能特点：
   * - 确保只初始化一次
   * - 支持环境变量验证
   * - 提供默认值
   * - 自动加载.env文件
   */
  static init() {
    if (this.#initialized) return;
    
    // 加载环境变量
    this.#loadEnv();
    
    // 验证配置
    this.#validateConfig();
    
    // 设置默认值
    this.#setDefaults();
    
    // 打印配置摘要
    this.#logConfig();
    
    this.#initialized = true;
  }

  static #loadEnv() {
    const envPath = path.join(__dirname, '.env');
    console.log('🔍 正在加载环境变量文件:', envPath);
    dotenv.config({ path: envPath });
  }

  static #validateConfig() {
    const requiredVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'JWT_SECRET'];
    
    if (process.env.NODE_ENV === 'production') {
      for (const key of requiredVars) {
        if (!process.env[key]) {
          throw new Error(`❌ 缺少必需的环境变量: ${key}`);
        }
      }
    }
  }

  static #setDefaults() {
    this.#config = {
      DB_HOST: process.env.DB_HOST || 'localhost',
      DB_USER: process.env.DB_USER || 'root',
      DB_PASSWORD: process.env.DB_PASSWORD || 'root',
      DB_NAME: process.env.DB_NAME || 'genshin_characters',
      DB_PORT: process.env.DB_PORT || '3306',
      BACKEND_PORT: process.env.BACKEND_PORT || '3001',
      JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
      NODE_ENV: process.env.NODE_ENV || 'development'
    };
  }

  static #logConfig() {
    console.log('==== 环境变量配置 ====');
    console.log('DB_HOST:', this.#config.DB_HOST);
    console.log('DB_USER:', this.#config.DB_USER);
    console.log('DB_NAME:', this.#config.DB_NAME);
    console.log('BACKEND_PORT:', this.#config.BACKEND_PORT);
    console.log('JWT_SECRET:', '***');
    console.log('NODE_ENV:', this.#config.NODE_ENV);
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
    if (!this.#initialized) {
      throw new Error('配置未初始化，请先调用Config.init()');
    }
    
    if (!this.#config[key]) {
      throw new Error(`❌ 配置项 ${key} 不存在`);
    }
    return this.#config[key];
  }
}

export const config = Config;