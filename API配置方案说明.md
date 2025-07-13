# FastGPT API 配置方案说明

## 🎯 概述

由于GitHub Pages只能托管静态文件，无法运行Node.js代理服务器，我们提供了三种替代方案来解决CORS跨域问题。

## 📋 方案对比

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|----------|
| **方案1: FastGPT SDK** | 官方支持、功能完整、类型安全 | 需要服务器环境 | 本地开发、自有服务器 |
| **方案2: 直接调用** | 简单直接、无需代理 | 需要CORS支持、密钥暴露 | FastGPT支持CORS时 |
| **方案3: Vercel部署** | 免费、自动部署、全球CDN | 需要Vercel账号 | 生产环境、静态托管 |

---

## 🚀 方案1: 使用FastGPT官方SDK

### 安装依赖
```bash
npm install @fastgpt/sdk
```

### 启动SDK服务器
```bash
# 使用SDK服务器替代原代理服务器
node fastgpt-sdk-server.js
```

### 配置环境变量
```bash
# 设置API密钥
export FASTGPT_API_KEY="your-api-key-here"
```

### 使用方式
前端代码无需修改，继续使用 `/api/fastgpt/*` 路径。

---

## 🌐 方案2: 直接调用FastGPT API

### 前提条件
FastGPT API需要支持CORS，或者使用浏览器扩展禁用CORS。

### 配置步骤

1. **引入直接调用脚本**
```html
<script src="script-direct.js"></script>
```

2. **配置API密钥**
```javascript
// 在浏览器控制台执行
DirectFastGPT.setDirectAPIConfig({
    FASTGPT_STYLE: {
        apiKey: 'your-style-api-key',
        workflowId: 'your-style-workflow-id'
    },
    FASTGPT_CONTENT: {
        apiKey: 'your-content-api-key',
        workflowId: 'your-content-workflow-id'
    }
});
```

3. **测试连接**
```javascript
DirectFastGPT.testDirectAPIConnection().then(success => {
    console.log('连接测试:', success ? '成功' : '失败');
});
```

4. **使用直接调用函数**
```javascript
// 风格分析
const styleOutput = await DirectFastGPT.callStyleAnalysisWorkflowDirect(fileUrls, userUrls);

// 内容生成
const content = await DirectFastGPT.callContentGenerationWorkflowDirect(
    styleOutput, contentLength, topic, styleType, remark
);
```

### 浏览器CORS解决方案

#### 方法1: 使用浏览器扩展
- Chrome: 安装 "CORS Unblock" 扩展
- Firefox: 安装 "CORS Everywhere" 扩展

#### 方法2: 启动Chrome时禁用安全策略
```bash
# Windows
chrome.exe --disable-web-security --user-data-dir="C:/temp/chrome_dev"

# macOS
open -n -a /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --args --user-data-dir="/tmp/chrome_dev_test" --disable-web-security

# Linux
google-chrome --disable-web-security --user-data-dir="/tmp/chrome_dev_test"
```

---

## ☁️ 方案3: Vercel Serverless部署

### 部署步骤

1. **安装Vercel CLI**
```bash
npm install -g vercel
```

2. **登录Vercel**
```bash
vercel login
```

3. **部署项目**
```bash
vercel
```

4. **配置环境变量**
在Vercel控制台设置环境变量：
- `FASTGPT_API_KEY`: 你的FastGPT API密钥

### 使用方式
部署后，前端代码中的API路径会自动指向Vercel的Serverless Function。

---

## 🔧 推荐配置流程

### 开发环境
1. 使用 **方案1 (SDK)** 进行本地开发
2. 运行 `node fastgpt-sdk-server.js`
3. 访问 `http://localhost:3001`

### 生产环境
1. 使用 **方案3 (Vercel)** 进行部署
2. 获得类似 `https://your-project.vercel.app` 的地址
3. 在GitHub Pages中引用Vercel部署的API

### 临时测试
1. 使用 **方案2 (直接调用)** 配合浏览器扩展
2. 快速测试API功能
3. 注意API密钥安全

---

## ⚠️ 安全注意事项

### API密钥保护
- 不要在客户端代码中硬编码API密钥
- 使用环境变量或服务器端配置
- 考虑使用临时令牌或STS

### CORS配置
- 只允许必要的域名访问
- 避免使用 `Access-Control-Allow-Origin: *`
- 在生产环境中严格限制来源

### 错误处理
- 不要在错误响应中暴露敏感信息
- 记录详细的服务器端日志
- 实现适当的重试机制

---

## 🛠️ 故障排除

### 常见问题

1. **CORS错误**
   - 检查API服务器是否支持CORS
   - 确认请求头设置正确
   - 使用浏览器扩展临时解决

2. **API密钥无效**
   - 验证密钥格式和权限
   - 检查API配额和限制
   - 确认工作流ID正确

3. **网络超时**
   - 增加请求超时时间
   - 实现重试机制
   - 检查网络连接

### 调试技巧
- 使用浏览器开发者工具查看网络请求
- 检查服务器端日志
- 使用Postman测试API接口

---

## 📞 技术支持

如果遇到问题，请：
1. 查看FastGPT官方文档
2. 检查API状态页面
3. 联系技术支持团队 