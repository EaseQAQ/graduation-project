# 原神角色图鉴管理系统

## ✨ 项目特色

| 功能       | 描述                          | 技术实现               |
|------------|-----------------------------|------------------------|
| 多维度筛选  | 按元素/地区/武器/星级筛选角色  | Vue 3 Composition API  |
| 实时收藏    | 即时更新收藏状态                | Pinia 状态管理         |
| 响应式设计  | 适配手机/平板/PC               | CSS Flex/Grid 布局     |
| JWT 认证    | 安全的用户认证系统              | Express + JWT          |

## 🚀 快速开始

### 开发环境配置
1. **安装依赖**
```bash
# 克隆项目
git clone https://github.com/your-username/my-vue3-js-project.git
cd my-vue3-js-project
```
2. **数据库初始化**
```bash
# 方式1：使用脚本导入（推荐）
node scripts/import-db.cjs

# 方式2：手动SQL导入
mysql -u root -p genshin_characters < scripts/export-db.sql
```

3. **后端服务配置**
```bash
cd backend
cp .env.example .env
# 编辑 .env 填写您的数据库配置
```

4. **一键启动全栈服务（推荐）**
```bash
node scripts/launch.cjs
```

5. **手动启动方式（备选）**
```bash
# 前端启动
npm run dev

# 后端启动（需单独终端）
cd backend && node server.js
```

## 🧩 项目结构

```text
my-vue3-js-project/
├── backend/          # 后端服务
│   ├── controllers/  # API控制器
│   ├── middleware/   # 认证中间件 
│   ├── models/       # 数据库模型
│   ├── routes/       # 路由定义
│   └── server.js     # 服务入口
└── src/             # 前端源码
    ├── stores/       # Pinia 状态管理
    ├── services/     # API 服务层
    └── views/        # 页面组件
```

## 🛠️ 开发规范

### Git 提交规范
```bash
git commit -m "feat: 添加角色收藏功能"
git commit -m "fix: 修复登录状态异常 #123"
```
| 类型     | 描述                  |
|----------|---------------------|
| feat     | 新增功能               |
| fix      | 修复问题               | 
| docs     | 文档更新               |

### 代码风格
- Vue 组件使用 `<script setup>` 语法
- CSS 采用 BEM 命名规范
- API 调用统一在 services 层管理

## 🤝 贡献指南

1. 提交 Issue 描述问题或建议
2. Fork 项目并创建特性分支
3. 提交 Pull Request 并关联 Issue
4. 通过 ESLint 检查 + 单元测试

## ?? 许可证

MIT © 2026 原神图鉴团队