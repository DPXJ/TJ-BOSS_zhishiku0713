# FastGPT 工作流配置完整指南

## 🎯 项目概述

本项目现已支持两种 FastGPT 接口模式：
- **对话接口模式**：使用 `/v1/chat/completions` (推荐新手)
- **工作流接口模式**：使用 `/workflow/run` (功能强大)

## 🔑 API 密钥要求

根据 FastGPT 官方文档，有两种密钥类型：

### 通用密钥 vs 应用密钥

| 密钥类型 | 获取位置 | 对话接口 | 工作流接口 | 推荐度 |
|---------|---------|---------|-----------|-------|
| 通用密钥 | 账户设置 → API密钥 | ❌ 不支持 | ✅ 支持 | ⭐⭐ |
| 应用密钥 | 我的应用 → 选择应用 → API密钥 | ✅ 支持 | ✅ 支持 | ⭐⭐⭐⭐⭐ |

**强烈推荐使用应用密钥**，兼容性最好！

## 🚀 快速配置方案

### 方案一：对话接口模式（推荐新手）

#### 优势
- ✅ 配置简单，只需API密钥
- ✅ 快速上手，无需创建工作流
- ✅ 错误提示清晰
- ✅ 支持自定义用户ID

#### 配置步骤
1. **获取应用密钥**：
   - 登录 FastGPT：https://api.fastgpt.in
   - 进入"我的应用" → 选择应用 → "API密钥"
   - 复制以 `fastgpt-` 开头的应用密钥

2. **浏览器控制台配置**：
   ```javascript
   // 切换到对话模式
   setMode("chat")
   
   // 设置API密钥
   setApiKey("fastgpt-你的应用密钥")
   
   // 测试连接
   testApi()
   ```

3. **验证配置**：
   ```javascript
   showConfig() // 查看配置状态
   ```

#### API调用示例
```bash
curl --location --request POST 'https://api.fastgpt.in/api/v1/chat/completions' \
--header 'Authorization: Bearer fastgpt-你的应用密钥' \
--header 'Content-Type: application/json' \
--data-raw '{
    "chatId": "111",
    "stream": false,
    "detail": false,
    "messages": [
        {
            "content": "导演是谁",
            "role": "user"
        }
    ],
    "customUid": "可选的自定义用户ID"
}'
```

### 方案二：工作流接口模式（功能强大）

#### 优势
- ✅ 支持复杂的多步骤处理
- ✅ 可配置专业的文档分析流程
- ✅ 支持文件上传和URL分析
- ✅ 风格分析更精准

#### 配置步骤
1. **创建工作流**：
   - 在 FastGPT 应用中创建工作流
   - 配置输入输出节点
   - 获取工作流ID

2. **浏览器控制台配置**：
   ```javascript
   // 切换到工作流模式
   setMode("workflow")
   
   // 设置API密钥
   setApiKey("fastgpt-你的密钥")
   
   // 配置风格分析工作流
   setStyleWorkflowId("你的风格分析工作流ID")
   
   // 配置内容生成工作流
   setContentWorkflowId("你的内容生成工作流ID")
   
   // 查看配置
   showConfig()
   ```

## 🔧 完整配置命令

### 查看和配置
```javascript
// 查看快速配置指南
quickSetup()

// 查看当前配置状态
showConfig()

// 切换接口模式
setMode("chat")          // 切换到对话模式
setMode("workflow")      // 切换到工作流模式

// 统一设置API密钥（推荐）
setApiKey("fastgpt-你的应用密钥")

// 单独设置密钥（高级用法）
setStyleKey("fastgpt-风格分析密钥")
setContentKey("fastgpt-内容生成密钥")

// 配置工作流ID
setStyleWorkflowId("风格分析工作流ID")
setContentWorkflowId("内容生成工作流ID")

// 测试API连接
testApi()
```

## ⚡ 功能特性

### 对话接口模式特性
- **风格分析**：AI自动分析文档链接的写作风格
- **内容生成**：根据分析的风格生成指定类型的内容
- **自定义用户ID**：支持传入自定义用户标识
- **错误处理**：智能识别密钥类型错误

### 工作流接口模式特性
- **文件上传**：支持上传文件到阿里云OSS
- **URL分析**：支持分析网页链接内容
- **多步骤处理**：工作流可配置复杂的处理逻辑
- **专业分析**：更精准的风格识别和内容生成

## 🛠️ 故障排除

### 常见错误及解决方案

#### 1. "Key is error. You need to use the app key rather than the account key."
**原因**：使用了账户密钥而不是应用密钥
**解决方案**：
```javascript
// 确保从应用页面获取密钥，不是账户设置页面
setApiKey("fastgpt-应用专用密钥")
```

#### 2. "请配置FastGPT API密钥和工作流ID，或切换到对话模式"
**原因**：工作流模式下缺少工作流ID配置
**解决方案**：
```javascript
// 方案1：切换到对话模式
setMode("chat")

// 方案2：配置工作流ID
setStyleWorkflowId("你的工作流ID")
setContentWorkflowId("你的工作流ID")
```

#### 3. API测试失败
**排查步骤**：
```javascript
// 1. 检查配置
showConfig()

// 2. 确认密钥格式
// 正确格式：fastgpt-xxxxxxxx
// 错误格式：其他格式

// 3. 测试连接
testApi()

// 4. 切换模式重试
setMode("chat")  // 或 setMode("workflow")
```

## 📊 接口模式对比

| 功能 | 对话接口模式 | 工作流接口模式 |
|-----|-------------|---------------|
| 配置难度 | ⭐⭐ 简单 | ⭐⭐⭐⭐ 复杂 |
| 功能丰富度 | ⭐⭐⭐ 基础 | ⭐⭐⭐⭐⭐ 丰富 |
| 风格分析 | ⭐⭐⭐ 自动分析 | ⭐⭐⭐⭐⭐ 专业工作流 |
| 文件上传 | ❌ 不支持 | ✅ 支持OSS上传 |
| URL分析 | ✅ 基础支持 | ✅ 深度分析 |
| 错误处理 | ⭐⭐⭐⭐ 友好 | ⭐⭐⭐ 一般 |
| 推荐场景 | 个人使用、快速体验 | 企业应用、专业需求 |

## 🎯 推荐配置方案

### 新手用户（推荐）
```javascript
// 第一次使用推荐配置
setMode("chat")
setApiKey("fastgpt-你的应用密钥")
testApi()
```

### 高级用户
```javascript
// 企业级功能完整配置
setMode("workflow")
setApiKey("fastgpt-你的密钥")
setStyleWorkflowId("风格分析工作流ID")
setContentWorkflowId("内容生成工作流ID")
```

### 混合使用
```javascript
// 可以随时切换模式
setMode("chat")     // 快速测试
setMode("workflow") // 专业功能
```

## 🎁 备用方案

即使没有配置任何API，系统也提供：
- ✅ 6种专业文档模板
- ✅ 高质量商务语言风格
- ✅ 完整的编辑和导出功能
- ✅ 本地化数据存储

## 📞 获取支持

- **快速指南**：在控制台输入 `quickSetup()`
- **配置查看**：在控制台输入 `showConfig()`
- **API测试**：在控制台输入 `testApi()`
- **官方文档**：https://doc.fastgpt.in

---

**总结**：推荐新手使用对话接口模式，专业用户使用工作流接口模式。系统支持动态切换，无需重新配置。 