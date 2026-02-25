import { config } from '../config.js';

/**
 * 统一错误处理中间件
 * 功能特点：
 * - 集中处理所有API错误
 * - 支持多种错误类型识别
 * - 提供结构化的错误响应
 * - 开发环境显示详细错误信息
 */
const errorHandler = (err, req, res, next) => {
  // 记录错误详情（包含请求信息）
  console.error('❌ 错误详情:', {
    method: req.method,
    path: req.path,
    error: err.message,
    stack: config.get('NODE_ENV') === 'development' ? err.stack : undefined
  });

  // 定义错误类型映射
  const errorTypes = {
    // 认证相关错误
    JsonWebTokenError: { status: 401, message: '无效的令牌' },
    TokenExpiredError: { status: 401, message: '令牌已过期' },
    
    // 数据库相关错误
    SequelizeValidationError: { status: 400, message: '数据验证失败' },
    SequelizeUniqueConstraintError: { status: 400, message: '数据已存在' },
    
    // 业务逻辑错误
    NotFoundError: { status: 404, message: '资源不存在' },
    PermissionDeniedError: { status: 403, message: '无权访问' }
  };

  // 查找匹配的错误类型
  const errorType = errorTypes[err.name] || { 
    status: 500, 
    message: '服务器内部错误' 
  };

  // 构建错误响应
  const errorResponse = {
    success: false,
    error: errorType.message,
    details: err.message,
    ...(config.get('NODE_ENV') === 'development' && { 
      stack: err.stack,
      type: err.name 
    })
  };

  // 发送错误响应
  res.status(errorType.status).json(errorResponse);
};

export default errorHandler;