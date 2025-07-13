# FastGPT API 配置完整指南

## 🎯 重要说明

根据 FastGPT 官方文档，本项目支持两种API接口：
- **工作流接口** (推荐)：用于复杂的文档分析和内容生成
- **对话接口**：用于简单的AI对话

## 🔑 API 密钥类型详解

### 1. 通用密钥 (Account Key)
- ❌ **不能用于**：调用应用对话接口 `/v1/chat/completions`
- ✅ **可以用于**：管理账户、创建应用、调用工作流接口
- 📍 **获取位置**：账户设置 → API密钥

### 2. 应用密钥 (App Key) ⭐️ 推荐
- ✅ **可以用于**：调用 `/v1/chat/completions` 对话接口
- ✅ **可以用于**：调用该应用的工作流接口
- 📍 **获取位置**：我的应用 → 选择具体应用 → API密钥

## 🚀 快速配置步骤

### 方法一：获取应用密钥 (推荐)

1. **登录 FastGPT 平台**：https://api.fastgpt.in 或 https://fastgpt.in

2. **进入应用管理**：
   - 点击 "我的应用" 或 "应用管理"

3. **选择或创建应用**：
   - 如果已有应用：点击进入具体应用
   - 如果没有应用：先创建一个新应用

4. **获取应用密钥**：
   - 在应用页面找到 "API密钥" 或 "API Key"
   - 复制显示的应用专用密钥（以 `fastgpt-` 开头）

5. **配置密钥**：
   ```javascript
   // 在浏览器控制台执行
   setStyleKey('fastgpt-你的应用密钥')
   setContentKey('fastgpt-你的应用密钥')
   ```

### 方法二：获取工作流ID (可选，用于工作流接口)

1. **创建或选择工作流**：
   - 在应用中创建工作流
   - 配置输入输出节点

2. **获取工作流ID**：
   - 在工作流编辑页面找到工作流ID
   - 通常在URL中或设置页面

3. **配置工作流**：
   ```javascript
   // 配置风格分析工作流
   setStyleWorkflowId('你的风格分析工作流ID')
   
   // 配置内容生成工作流
   setContentWorkflowId('你的内容生成工作流ID')
   ```

## 📡 API 接口配置

### 基础配置
```javascript
// 基础URL
baseUrl: "https://api.fastgpt.in/api"

// 请求头
headers: {
    Authorization: "Bearer {{apikey}}",
    "Content-Type": "application/json"
}
```

### 支持的接口类型

#### 1. 工作流接口 (当前使用)
```javascript
// 调用工作流
POST /workflow/run

// 请求体示例
{
    "workflowId": "your-workflow-id",
    "variables": {
        "input": "用户输入"
    }
}
```

#### 2. 对话接口 (新增支持)
```javascript
// 应用对话
POST /v1/chat/completions

// 请求体示例
{
    "chatId": "111",
    "stream": false,
    "detail": false,
    "messages": [
        {
            "content": "你的问题",
            "role": "user"
        }
    ]
}
```

## 🔧 完整配置示例

### 在浏览器控制台执行：

```javascript
// 1. 配置应用密钥 (必需)
setStyleKey('fastgpt-你的应用密钥')
setContentKey('fastgpt-你的应用密钥')

// 2. 配置工作流ID (可选，用于高级功能)
setStyleWorkflowId('你的风格分析工作流ID')
setContentWorkflowId('你的内容生成工作流ID')

// 3. 查看配置状态
showConfig()
```

## ✅ 验证配置

正确配置后的特征：
- ✅ API密钥以 `fastgpt-` 开头
- ✅ 可以在应用页面找到该密钥
- ✅ 系统显示"FastGPT工作流已配置，功能完整"

## 🔄 自定义用户ID支持

从 v4.8.13 开始，支持传入自定义用户ID：

```javascript
// 对话接口示例
{
    "chatId": "111",
    "stream": false,
    "detail": false,
    "messages": [
        {
            "content": "导演是谁",
            "role": "user"
        }
    ],
    "customUid": "your-custom-user-id"
}
```

## 🛠️ 故障排除

### 常见错误及解决方案

1. **"Key is error. You need to use the app key rather than the account key."**
   - 🔧 解决：使用应用密钥而不是账户密钥

2. **"Workflow not found"**
   - 🔧 解决：检查工作流ID是否正确

3. **"Authorization failed"**
   - 🔧 解决：检查API密钥格式和权限

## 🎁 备用方案

即使没有配置API，系统也提供高质量模板：
- ✅ 6种专业文档类型
- ✅ 标准商务语言风格
- ✅ 完整编辑和导出功能

## 📞 获取支持

- **FastGPT官方文档**：查看最新API说明
- **控制台调试**：使用 `showConfig()` 查看配置状态
- **测试配置**：先上传文件测试，再进行内容生成

---

**总结**：优先使用应用密钥，确保从应用页面获取。系统支持多种接口，可根据需要选择最适合的方案。 