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

// 根据ID获取角色 - 处理获取单个角色信息的请求
const getCharacterById = async (req, res) => {
  try {
    // 从请求参数中获取角色ID
    const characterId = req.params.id;
    
    // 调用模型方法获取单个角色数据
    const character = await CharacterModel.getById(characterId);
    
    if (!character) {
      return res.status(404).json({
        success: false,
        message: `未找到ID为 ${characterId} 的角色`
      });
    }
    
    // 返回成功响应，包含角色信息
    res.status(200).json({
      success: true,
      character
    });
  } catch (error) {
    // 使用统一错误处理中间件
    errorHandler(error, req, res, null);
  }
};

export default {
  getCharacters,
  getCharacterById
};