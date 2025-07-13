# FastGPT 代理服务器使用指南

## 🎯 为什么需要代理服务器？

由于浏览器的 **CORS 跨域限制**，前端无法直接调用 FastGPT API。代理服务器解决了这个问题：

```
前端 → 代理服务器 → FastGPT API
```

## 🚀 快速启动

### 方法一：使用批处理文件（Windows）
```bash
# 双击运行
start-proxy.bat
```

### 方法二：手动启动
```bash
# 1. 安装依赖
npm install

# 2. 启动服务器
npm start
```

## 🔧 代理服务器功能

### 支持的接口
- ✅ **工作流接口**：`POST /api/fastgpt/workflow/run`
- ✅ **对话接口**：`POST /api/fastgpt/v1/chat/completions`
- ✅ **健康检查**：`GET /health`

### 请求转换
```javascript
// 原始请求（被CORS阻止）
fetch('https://api.fastgpt.in/api/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer xxx' }
})

// 通过代理（正常工作）
fetch('http://localhost:3001/api/fastgpt/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer xxx' }
})
```

## 📡 服务器状态

启动后访问 http://localhost:3001/health 检查状态：

```json
{
    "status": "ok",
    "message": "FastGPT代理服务器运行正常"
}
```

## 🛠️ 前端配置

代理启动后，前端会自动使用代理地址：

```javascript
// 自动配置的代理地址
API_CONFIG.FASTGPT_STYLE.baseUrl = 'http://localhost:3001/api/fastgpt'
API_CONFIG.FASTGPT_CONTENT.baseUrl = 'http://localhost:3001/api/fastgpt'
```

## 🔍 调试和日志

代理服务器会显示详细日志：

```
🔄 代理请求: https://api.fastgpt.in/api/v1/chat/completions
📝 请求体: { chatId: "123", messages: [...] }
✅ FastGPT响应成功
```

## 🚨 常见问题

### 1. 端口占用
```bash
# 错误：端口3001已被占用
Error: listen EADDRINUSE: address already in use :::3001

# 解决方案：
netstat -ano | findstr :3001
taskkill /PID <进程ID> /F
```

### 2. 代理无法访问
```bash
# 检查防火墙设置
# 确保 localhost:3001 端口开放
```

### 3. FastGPT API错误
```bash
# 检查API密钥是否正确
# 查看代理服务器日志获取详细错误信息
```

## 📊 性能监控

代理服务器提供详细的请求日志：
- 🔄 请求开始
- 📝 请求参数
- ✅ 成功响应
- ❌ 错误详情

## 🔒 安全考虑

1. **本地运行**：代理服务器仅在本地运行，不暴露到公网
2. **API密钥保护**：密钥在服务端处理，不暴露在浏览器中
3. **CORS安全**：仅允许本地前端访问

## 🎯 生产环境部署

如需部署到生产环境：

1. **修改端口和域名**
2. **添加HTTPS支持**
3. **配置环境变量**
4. **添加访问控制**

```javascript
// 生产环境配置示例
const PRODUCTION_CONFIG = {
    port: process.env.PORT || 8080,
    fastgptBaseUrl: process.env.FASTGPT_BASE_URL || 'https://api.fastgpt.in/api',
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000']
};
```

---

**总结**：代理服务器完美解决了CORS跨域问题，让FastGPT API调用变得简单可靠！ 