import rateLimit from 'express-rate-limit';

// 通用API速率限制 - 用于保护非认证相关的公共API端点
// 防止请求洪水攻击，保护服务器资源
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟窗口（900,000毫秒）
  max: 100, // 每个IP最多100次请求
  standardHeaders: true, // 返回标准的RateLimit头信息
  legacyHeaders: false, // 禁用旧版X-RateLimit头
  message: '请求过于频繁，请稍后再试', // 自定义错误消息
  skip: (req) => {
    // 在开发环境下跳过速率限制，方便调试
    return process.env.NODE_ENV === 'development';
  }
});

// 认证相关API的严格限制 - 用于保护登录、注册等敏感操作
// 防止暴力破解密码，增强安全性
export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1小时窗口（3,600,000毫秒）
  max: 20, // 每个IP最多20次认证请求
  message: '认证请求过于频繁，请1小时后再试', // 自定义错误消息
  skip: (req) => {
    // 在开发环境下跳过速率限制，方便调试
    return process.env.NODE_ENV === 'development';
  }
});