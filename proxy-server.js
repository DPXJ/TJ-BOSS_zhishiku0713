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

// FastGPT 代理路由
app.post('/api/fastgpt/*', async (req, res) => {
    try {
        const fastgptPath = req.path.replace('/api/fastgpt', '');
        const fastgptUrl = `https://api.fastgpt.in/api${fastgptPath}`;
        
        console.log('🔄 代理请求:', fastgptUrl);
        console.log('📝 请求体:', req.body);
        
        const response = await fetch(fastgptUrl, {
            method: req.method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': req.headers.authorization
            },
            body: JSON.stringify(req.body)
        });
        
        // 检查响应内容类型
        const contentType = response.headers.get('content-type');
        console.log('📄 响应Content-Type:', contentType);
        console.log('📊 响应状态:', response.status, response.statusText);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ FastGPT错误响应:', response.status, errorText.substring(0, 500));
            return res.status(response.status).json({ 
                error: 'FastGPT API Error',
                status: response.status,
                message: errorText.substring(0, 500),
                contentType: contentType
            });
        }
        
        // 尝试解析JSON
        let data;
        const responseText = await response.text();
        console.log('📝 原始响应内容:', responseText.substring(0, 200) + '...');
        
        try {
            data = JSON.parse(responseText);
        } catch (parseError) {
            console.error('❌ JSON解析失败:', parseError.message);
            console.error('📄 响应内容:', responseText.substring(0, 500));
            return res.status(500).json({
                error: 'Invalid JSON Response',
                message: 'FastGPT返回了非JSON格式的响应',
                contentType: contentType,
                responsePreview: responseText.substring(0, 500)
            });
        }
        
        console.log('✅ FastGPT响应成功');
        res.json(data);
        
    } catch (error) {
        console.error('❌ 代理服务器错误:', error);
        res.status(500).json({ 
            error: 'Proxy server error', 
            message: error.message 
        });
    }
});

// 健康检查接口
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'FastGPT代理服务器运行正常' });
});

app.listen(PORT, () => {
    console.log(`🚀 FastGPT代理服务器启动成功`);
    console.log(`📡 服务地址: http://localhost:${PORT}`);
    console.log(`🔧 代理路径: /api/fastgpt/*`);
    console.log(`💡 健康检查: http://localhost:${PORT}/health`);
});

module.exports = app; 