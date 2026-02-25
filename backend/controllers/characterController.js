import CharacterModel from '../models/characterModel.js';
import errorHandler from '../middleware/errorHandler.js';

// 获取角色列表 - 处理获取所有角色信息的请求
const getCharacters = async (req, res) => {
  try {
    // 调用模型方法获取所有角色数据
    const characters = await CharacterModel.getAll();
    
    // 返回成功响应，包含角色列表
    res.status(200).json({
      success: true,
      characters
    });
  } catch (error) {
    // 使用统一错误处理中间件
    errorHandler(error, req, res, null);
  }
};

export default {
  getCharacters
};