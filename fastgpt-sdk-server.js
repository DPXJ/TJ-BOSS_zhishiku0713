const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = 3001;

// 启用CORS和JSON解析
app.use(cors());
app.use(express.json());

// 提供静态文件服务
app.use(express.static(path.join(__dirname, '.')));

// FastGPT API配置
const FASTGPT_CONFIG = {
    baseURL: 'https://api.fastgpt.in',
    apiKey: process.env.FASTGPT_API_KEY || 'your-api-key-here'
};

// 工作流运行接口
app.post('/api/fastgpt/workflow/run', async (req, res) => {
    try {
        const { workflowId, variables } = req.body;
        
        console.log('🔄 使用SDK风格调用工作流:', workflowId);
        console.log('📝 变量:', variables);
        
        const response = await fetch(`${FASTGPT_CONFIG.baseURL}/api/workflow/run`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${FASTGPT_CONFIG.apiKey}`
            },
            body: JSON.stringify({
                workflowId,
                variables
            })
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ 工作流调用失败:', response.status, errorText);
            return res.status(response.status).json({ 
                error: 'Workflow execution failed',
                status: response.status,
                message: errorText.substring(0, 500)
            });
        }
        
        const result = await response.json();
        console.log('✅ SDK风格工作流响应:', result);
        res.json(result);
        
    } catch (error) {
        console.error('❌ SDK风格工作流错误:', error);
        res.status(500).json({ 
            error: 'SDK workflow error', 
            message: error.message 
        });
    }
});

// 聊天完成接口
app.post('/api/fastgpt/v1/chat/completions', async (req, res) => {
    try {
        const { messages, variables, workflowId, chatId } = req.body;
        
        console.log('🔄 使用SDK风格调用聊天接口');
        console.log('📝 消息:', messages);
        
        const requestBody = {
            messages,
            stream: false,
            detail: true
        };
        
        if (variables) {
            requestBody.variables = variables;
        }
        
        if (workflowId) {
            requestBody.workflowId = workflowId;
        }
        
        if (chatId) {
            requestBody.chatId = chatId;
        }
        
        const response = await fetch(`${FASTGPT_CONFIG.baseURL}/api/v1/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${FASTGPT_CONFIG.apiKey}`
            },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ 聊天接口调用失败:', response.status, errorText);
            return res.status(response.status).json({ 
                error: 'Chat completion failed',
                status: response.status,
                message: errorText.substring(0, 500)
            });
        }
        
        const result = await response.json();
        console.log('✅ SDK风格聊天响应:', result);
        res.json(result);
        
    } catch (error) {
        console.error('❌ SDK风格聊天错误:', error);
        res.status(500).json({ 
            error: 'SDK chat error', 
            message: error.message 
        });
    }
});

// 健康检查接口
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        message: 'FastGPT SDK风格服务器运行正常',
        config: {
            baseURL: FASTGPT_CONFIG.baseURL,
            hasApiKey: !!FASTGPT_CONFIG.apiKey && FASTGPT_CONFIG.apiKey !== 'your-api-key-here'
        }
    });
});

// 配置接口
app.post('/api/config', (req, res) => {
    const { apiKey } = req.body;
    if (apiKey) {
        FASTGPT_CONFIG.apiKey = apiKey;
        console.log('✅ API密钥已更新');
        res.json({ success: true, message: 'API密钥已更新' });
    } else {
        res.status(400).json({ error: 'API密钥不能为空' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 FastGPT SDK风格服务器启动成功`);
    console.log(`📡 服务地址: http://localhost:${PORT}`);
    console.log(`🔧 基础URL: ${FASTGPT_CONFIG.baseURL}`);
    console.log(`🔑 API密钥: ${FASTGPT_CONFIG.apiKey === 'your-api-key-here' ? '未设置' : '已设置'}`);
    console.log(`💡 健康检查: http://localhost:${PORT}/health`);
    console.log(`⚙️ 配置接口: POST http://localhost:${PORT}/api/config`);
});

module.exports = app; 