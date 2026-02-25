import CharacterModel from '../models/characterModel.js';

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
    // 记录错误日志
    console.error('获取角色列表错误:', error);
    
    // 返回服务器错误响应
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: error.message
    });
  }
};

export default {
  getCharacters
};