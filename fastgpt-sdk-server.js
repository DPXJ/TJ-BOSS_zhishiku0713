const express = require('express');
const cors = require('cors');
const { FastGPT } = require('@fastgpt/sdk');
const path = require('path');

const app = express();
const PORT = 3001;

// 启用CORS和JSON解析
app.use(cors());
app.use(express.json());

// 提供静态文件服务
app.use(express.static(path.join(__dirname, '.')));

// 初始化FastGPT SDK
const fastgpt = new FastGPT({
    apiKey: process.env.FASTGPT_API_KEY || 'your-api-key-here',
    baseURL: 'https://api.fastgpt.in'
});

// 工作流运行接口
app.post('/api/fastgpt/workflow/run', async (req, res) => {
    try {
        const { workflowId, variables } = req.body;
        
        console.log('🔄 使用SDK调用工作流:', workflowId);
        console.log('📝 变量:', variables);
        
        const result = await fastgpt.workflow.run({
            workflowId,
            variables
        });
        
        console.log('✅ SDK工作流响应:', result);
        res.json(result);
        
    } catch (error) {
        console.error('❌ SDK工作流错误:', error);
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
        
        console.log('🔄 使用SDK调用聊天接口');
        console.log('📝 消息:', messages);
        
        const result = await fastgpt.chat.completions({
            messages,
            variables,
            workflowId,
            chatId,
            stream: false
        });
        
        console.log('✅ SDK聊天响应:', result);
        res.json(result);
        
    } catch (error) {
        console.error('❌ SDK聊天错误:', error);
        res.status(500).json({ 
            error: 'SDK chat error', 
            message: error.message 
        });
    }
});

// 健康检查接口
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'FastGPT SDK服务器运行正常' });
});

app.listen(PORT, () => {
    console.log(`🚀 FastGPT SDK服务器启动成功`);
    console.log(`📡 服务地址: http://localhost:${PORT}`);
    console.log(`🔧 SDK版本: ${require('@fastgpt/sdk/package.json').version}`);
    console.log(`💡 健康检查: http://localhost:${PORT}/health`);
});

module.exports = app; 