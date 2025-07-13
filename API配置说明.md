# API配置说明

## 🔧 新的配置方式

系统现在采用**安全的配置界面**，无需在代码中暴露敏感信息！

## 🚀 使用步骤

### 1. 打开页面
访问 `index.html`，系统会自动检测配置状态

### 2. 配置API信息
首次使用时会弹出配置界面，请按提示输入：

**阿里云OSS配置：**
- AccessKey ID：您的阿里云AccessKey ID
- AccessKey Secret：您的阿里云AccessKey Secret
- 其他信息（地域、Bucket等）已预设

**FastGPT配置：**
- API Key：您的FastGPT API密钥
- 工作流ID已预设

### 3. 保存配置
- 点击"保存配置"完成设置
- 配置信息安全存储在浏览器本地
- 或点击"跳过"使用模板模式

## 🔒 安全特性

✅ **敏感信息不会提交到Git仓库**
✅ **本地存储，不会上传到服务器**  
✅ **支持重新配置和清除**
✅ **模板模式作为备用方案**

## 📋 配置信息参考

如需配置，请准备以下信息：

### 阿里云OSS
- 地域：北京（oss-cn-beijing）
- Bucket：tian-jiu-boss-zhishiku
- 需要您的AccessKey ID和Secret

### FastGPT
- API地址：https://api.fastgpt.in/api
- 需要您的API密钥
- 工作流ID已预设

## 🛠️ 功能说明

**完整模式**（配置API后）：
- ✅ 文件上传到OSS
- ✅ 智能风格分析
- ✅ AI内容生成
- ✅ 支持所有文档类型

**模板模式**（跳过配置）：
- ✅ 本地模板生成
- ✅ 6种文档类型
- ✅ 基础编辑功能
- ❌ 无法上传文件
- ❌ 无法学习个人风格

## 🔄 重新配置

如需重新配置API信息：
1. 打开浏览器开发者工具（F12）
2. 在控制台输入：`localStorage.clear()`
3. 刷新页面即可重新配置

## 📝 使用说明

配置完成后，系统将自动：
1. 连接阿里云OSS进行文件上传
2. 调用FastGPT进行风格分析和内容生成
3. 提供完整的AI写作助手功能

如有问题，请检查：
- 网络连接是否正常
- API密钥是否正确
- OSS权限是否充足

## 概述

本系统集成了阿里云OSS文件上传和FastGPT工作流调用功能。使用前需要配置相关的API密钥和工作流信息。

## 需要提供的配置信息

### 1. 阿里云OSS配置

您需要提供以下OSS配置信息：

- **region**: OSS地域，如 `oss-cn-hangzhou`
- **accessKeyId**: 阿里云AccessKey ID
- **accessKeySecret**: 阿里云AccessKey Secret
- **bucket**: OSS存储桶名称
- **endpoint**: OSS访问域名，如 `https://oss-cn-hangzhou.aliyuncs.com`

### 2. FastGPT配置

您需要提供以下FastGPT配置信息：

- **baseUrl**: FastGPT API地址，如 `https://api.fastgpt.in`
- **apiKey**: FastGPT API密钥
- **workflows.styleAnalysis**: 风格分析工作流ID
- **workflows.contentGeneration**: 内容生成工作流ID

## 配置方法

打开浏览器控制台（F12），然后执行以下代码：

```javascript
setAPIConfig({
    OSS: {
        region: 'oss-cn-hangzhou',
        accessKeyId: '您的AccessKeyId',
        accessKeySecret: '您的AccessKeySecret',
        bucket: '您的bucket名称',
        endpoint: 'https://oss-cn-hangzhou.aliyuncs.com'
    },
    FASTGPT: {
        baseUrl: 'https://api.fastgpt.in',
        apiKey: '您的FastGPT API密钥',
        workflows: {
            styleAnalysis: '风格分析工作流ID',
            contentGeneration: '内容生成工作流ID'
        }
    }
});
```

## 工作流程

### 1. 文件上传流程
1. 用户上传多个文件
2. 系统调用阿里云OSS API上传文件
3. 返回文件的URL数组

### 2. 风格分析流程
1. 将文件URL数组作为 `article_input` 变量
2. 调用FastGPT风格分析工作流
3. 返回 `style_output` 风格分析结果

### 3. 内容生成流程
1. 传入以下变量到内容生成工作流：
   - `style_output`: 风格分析结果
   - `content_length`: 字数要求（数值）
   - `topic`: 主题
   - `style_type`: 内容类型
   - `remark`: 补充说明
2. 返回 `AIcontent_output` 生成的内容

## FastGPT工作流设置

### 工作流A（风格分析）
- **输入变量**: `article_input` (数组类型，包含文件URL)
- **输出变量**: `style_output` (字符串类型，描述风格特征)

### 工作流B（内容生成）
- **输入变量**:
  - `style_output` (字符串类型)
  - `content_length` (数值类型)
  - `topic` (字符串类型)
  - `style_type` (字符串类型)
  - `remark` (字符串类型)
- **输出变量**: `AIcontent_output` (字符串类型，生成的内容)

## 阿里云OSS配置详细说明

### CORS跨域配置（重要！）

在阿里云OSS控制台中，需要配置CORS规则：

1. 登录阿里云OSS控制台
2. 选择您的bucket: `tian-jiu-boss-zhishiku`
3. 进入"权限管理" > "跨域设置"
4. 添加跨域规则：

```
来源: *
允许Methods: PUT, POST, GET, DELETE, HEAD, OPTIONS
允许Headers: *
暴露Headers: ETag, x-oss-request-id
缓存时间: 120
```

### Bucket权限设置

确保bucket有以下权限设置：
- **读写权限**: 公共读写 或 私有（推荐私有+正确的AccessKey权限）
- **防盗链**: 关闭或正确配置
- **访问日志**: 可选开启用于调试

### AccessKey权限检查

确保您的AccessKey具有以下权限：

#### 方法一：使用预设权限策略（推荐）
1. 登录阿里云控制台 -> 访问控制RAM
2. 找到您的用户：`tianjiu@1077781008063813.onaliyun.com`
3. 点击"添加权限"
4. 选择权限策略：`AliyunOSSFullAccess`（OSS完全访问权限）

#### 方法二：自定义权限策略
如果需要更精确的权限控制，可以创建自定义策略：

```json
{
    "Version": "1",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "oss:PutObject",
                "oss:GetObject",
                "oss:DeleteObject",
                "oss:ListObjects",
                "oss:GetBucketInfo",
                "oss:ListBuckets"
            ],
            "Resource": [
                "acs:oss:*:*:tian-jiu-boss-zhishiku",
                "acs:oss:*:*:tian-jiu-boss-zhishiku/*"
            ]
        }
    ]
}
```

#### 权限检查步骤：
1. 登录 [阿里云RAM控制台](https://ram.console.aliyun.com/)
2. 左侧菜单选择"身份管理" > "用户"
3. 找到用户：`tianjiu@1077781008063813.onaliyun.com`
4. 查看该用户的权限策略列表
5. 确认包含OSS相关权限

### 常见错误及解决方案

1. **XMLHttpRequest error**: 通常是CORS配置问题
2. **403 Forbidden**: AccessKey权限不足或bucket权限设置问题  
3. **404 Not Found**: Bucket名称错误或地域设置错误
4. **NetworkError**: 网络连接问题或防火墙拦截

## 安全说明

⚠️ **重要提醒**：在生产环境中，不应该在前端直接使用阿里云AccessKey，建议使用STS临时凭证或后端代理的方式上传文件。

当前实现仅供开发测试使用。

## 错误处理

系统会在以下情况显示错误提示：

1. API配置不完整
2. 文件上传失败
3. 工作流调用失败
4. 网络连接问题

## 使用示例

1. 配置API信息
2. 上传参考文件（PDF、Word、TXT等）
3. 系统自动进行风格分析
4. 填写生成要求（主题、字数、内容类型等）
5. 点击生成获得AI生成的内容
6. 可以编辑、复制或保存生成的内容

## 技术支持

如果遇到问题，请检查：

1. 浏览器控制台是否有错误信息
2. API配置是否正确
3. 网络连接是否正常
4. FastGPT工作流是否正常运行 