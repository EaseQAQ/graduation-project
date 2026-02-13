import CharacterModel from '../models/characterModel.js';

// 获取角色列表
const getCharacters = async (req, res) => {
  try {
    const characters = await CharacterModel.getAll();
    res.status(200).json({
      success: true,
      characters
    });
  } catch (error) {
    console.error('获取角色列表错误:', error);
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