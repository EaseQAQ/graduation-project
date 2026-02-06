// 直接测试模型导入和方法
async function debugModel() {
  try {
    console.log('开始测试模型导入...');
    
    // 动态导入模型
    const FavoriteModelModule = await import('./models/favoriteModel.js');
    const FavoriteModel = FavoriteModelModule.default;
    
    console.log('✓ 模型导入成功');
    console.log('模型类型:', typeof FavoriteModel);
    console.log('模型对象:', FavoriteModel);
    
    // 检查方法是否存在
    console.log('\n方法检查:');
    console.log('addFavorite:', typeof FavoriteModel.addFavorite);
    console.log('removeFavorite:', typeof FavoriteModel.removeFavorite);
    console.log('getUserFavorites:', typeof FavoriteModel.getUserFavorites);
    console.log('isFavorite:', typeof FavoriteModel.isFavorite);
    
    // 尝试调用方法（不实际执行数据库操作）
    console.log('\n方法存在性验证:');
    console.log('addFavorite 方法存在:', !!FavoriteModel.addFavorite);
    console.log('removeFavorite 方法存在:', !!FavoriteModel.removeFavorite);
    console.log('getUserFavorites 方法存在:', !!FavoriteModel.getUserFavorites);
    console.log('isFavorite 方法存在:', !!FavoriteModel.isFavorite);
    
  } catch (error) {
    console.error('测试失败:', error);
    console.error('错误详情:', error.stack);
  }
}

debugModel();