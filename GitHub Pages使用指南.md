# 🌐 GitHub Pages + FastGPT 使用指南

## 📋 当前状态

✅ **本地服务器已启动**：`http://localhost:3002`  
✅ **GitHub Pages已部署**：`https://dpxj.github.io/TJ-BOSS_zhishiku0713/`

## 🎯 使用方案

### 方案1：本地开发（推荐）

**访问地址：** `http://localhost:3002`

**优势：**
- ✅ 功能完整
- ✅ 无需额外配置
- ✅ 实时调试
- ✅ 所有FastGPT功能可用

**配置步骤：**
1. 确保本地服务器运行：`node fastgpt-sdk-server-3002.js`
2. 访问 `http://localhost:3002`
3. 在浏览器控制台配置API密钥和工作流ID
4. 开始使用

### 方案2：GitHub Pages + 本地API

**访问地址：** `https://dpxj.github.io/TJ-BOSS_zhishiku0713/`

**工作原理：**
- GitHub Pages托管前端界面
- 本地服务器提供API服务
- 前端调用本地API解决CORS问题

**配置步骤：**

1. **确保本地服务器运行**
   ```bash
   node fastgpt-sdk-server-3002.js
   ```

2. **配置API密钥**
   ```bash
   # 方法1：使用配置脚本
   # 编辑 setup-api-key.js，设置你的API密钥
   node setup-api-key.js
   
   # 方法2：使用API接口
   curl -X POST http://localhost:3002/api/config \
     -H "Content-Type: application/json" \
     -d '{"apiKey": "fastgpt-your-actual-api-key-here"}'
   ```

3. **访问GitHub Pages**
   - 打开：`https://dpxj.github.io/TJ-BOSS_zhishiku0713/`
   - 页面右上角会显示环境信息

4. **配置工作流ID**
   在浏览器控制台执行：
   ```javascript
   // 配置风格分析工作流
   setMode("style")
   setApiKey("fastgpt-your-style-api-key")
   setWorkflowId("your-style-workflow-id")
   
   // 配置内容生成工作流
   setMode("content")
   setApiKey("fastgpt-your-content-api-key")
   setWorkflowId("your-content-workflow-id")
   
   // 测试API连接
   testApi()
   ```

## 🔧 技术实现

### 环境检测
```javascript
// 自动检测当前环境
const isLocalEnvironment = window.location.hostname === 'localhost' || 
                          window.location.hostname === '127.0.0.1';

// 根据环境选择API地址
const API_BASE = isLocalEnvironment ? '' : 'http://localhost:3002';
```

### API调用
```javascript
// 风格分析
const response = await fetch(`${API_BASE}/api/fastgpt/workflow/run`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
        workflowId: workflowId,
        variables: variables
    })
});
```

## ⚠️ 注意事项

### 1. 本地服务器必须运行
- GitHub Pages版本需要本地服务器提供API
- 如果本地服务器停止，GitHub Pages版本将无法使用FastGPT功能

### 2. 网络连接
- 确保本地服务器可以访问FastGPT API
- 检查防火墙设置

### 3. CORS配置
- 本地服务器已配置CORS支持
- 允许所有来源访问（开发环境）

## 🛠️ 故障排除

### 问题1：GitHub Pages无法连接本地API
**解决方案：**
1. 确认本地服务器正在运行
2. 检查端口3002是否被占用
3. 验证API密钥配置

### 问题2：API调用失败
**解决方案：**
1. 检查FastGPT API密钥是否正确
2. 验证工作流ID是否存在
3. 查看浏览器控制台错误信息

### 问题3：CORS错误
**解决方案：**
1. 确认本地服务器CORS配置正确
2. 检查网络连接
3. 重启本地服务器

## 📊 状态检查

### 检查本地服务器状态
```bash
curl http://localhost:3002/health
```

### 检查API密钥配置
```bash
curl -X POST http://localhost:3002/api/config \
  -H "Content-Type: application/json" \
  -d '{"apiKey": "test"}'
```

## 🎉 推荐使用方式

**开发阶段：** 使用 `http://localhost:3002`  
**演示分享：** 使用 `https://dpxj.github.io/TJ-BOSS_zhishiku0713/`

## 📞 技术支持

如果遇到问题：
1. 检查本地服务器日志
2. 查看浏览器控制台错误
3. 验证API配置
4. 确认网络连接

现在你可以同时享受本地开发的便利和GitHub Pages的分享功能！ 