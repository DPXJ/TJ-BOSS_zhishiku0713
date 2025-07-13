const fetch = require('node-fetch');

// 配置你的FastGPT API密钥
const API_KEY = 'your-fastgpt-api-key-here'; // 替换为你的实际API密钥

async function setupApiKey() {
    try {
        console.log('🔄 正在配置API密钥...');
        
        const response = await fetch('http://localhost:3001/api/config', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                apiKey: API_KEY
            })
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log('✅ API密钥配置成功:', result.message);
        } else {
            console.error('❌ API密钥配置失败:', response.status);
        }
    } catch (error) {
        console.error('❌ 配置过程中出错:', error.message);
        console.log('💡 请确保服务器正在运行 (npm start:sdk)');
    }
}

// 测试连接
async function testConnection() {
    try {
        console.log('🔄 测试服务器连接...');
        
        const response = await fetch('http://localhost:3001/health');
        
        if (response.ok) {
            const result = await response.json();
            console.log('✅ 服务器连接正常:', result.message);
            console.log('📊 配置状态:', result.config);
        } else {
            console.error('❌ 服务器连接失败:', response.status);
        }
    } catch (error) {
        console.error('❌ 连接测试失败:', error.message);
    }
}

// 运行配置
async function main() {
    console.log('🚀 FastGPT API密钥配置工具');
    console.log('================================');
    
    await testConnection();
    console.log('');
    await setupApiKey();
    
    console.log('');
    console.log('📋 配置完成！现在你可以：');
    console.log('1. 访问 http://localhost:3001 使用应用');
    console.log('2. 在浏览器控制台配置工作流ID');
    console.log('3. 开始使用FastGPT功能');
}

// 如果直接运行此脚本
if (require.main === module) {
    main();
}

module.exports = { setupApiKey, testConnection }; 