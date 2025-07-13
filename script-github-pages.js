// GitHub Pages版本的FastGPT配置
// 这个版本会调用本地运行的API服务器

// 本地API服务器地址
const LOCAL_API_BASE = 'http://localhost:3002';

// 检查是否在本地环境
const isLocalEnvironment = window.location.hostname === 'localhost' || 
                          window.location.hostname === '127.0.0.1';

// 根据环境选择API基础地址
const API_BASE = isLocalEnvironment ? '' : LOCAL_API_BASE;

console.log('🌐 当前环境:', isLocalEnvironment ? '本地' : 'GitHub Pages');
console.log('🔗 API基础地址:', API_BASE || '相对路径');

// 修改原有的API调用函数
async function callStyleAnalysisWorkflow(fileUrls, userUrls) {
    console.log('🔄 调用FastGPT风格分析工作流...');
    console.log('文件URLs:', fileUrls);
    console.log('用户URLs:', userUrls);
    
    if (!API_CONFIG.FASTGPT_STYLE.workflowId) {
        throw new Error('风格分析工作流ID未配置，请先配置workflowId');
    }
    
    const response = await fetch(`${API_BASE}/api/fastgpt/workflow/run`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_CONFIG.FASTGPT_STYLE.apiKey}`
        },
        body: JSON.stringify({
            workflowId: API_CONFIG.FASTGPT_STYLE.workflowId,
            variables: {
                article_input: fileUrls,
                url_input: userUrls
            }
        })
    });
    
    if (!response.ok) {
        const errorText = await response.text();
        console.error('FastGPT工作流错误响应:', response.status, errorText);
        throw new Error(`风格分析工作流调用失败: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    console.log('✅ FastGPT风格分析工作流响应:', result);
    
    // 提取style_output
    let styleOutput = null;
    if (result && result.style_output) {
        styleOutput = result.style_output;
    } else if (result && result.data && result.data.style_output) {
        styleOutput = result.data.style_output;
    } else {
        throw new Error('无法找到style_output变量');
    }
    
    return styleOutput;
}

async function callContentGenerationWorkflow(styleOutput, contentLength, topic, styleType, remark) {
    console.log('🔄 调用FastGPT内容生成工作流...');
    
    if (!API_CONFIG.FASTGPT_CONTENT.workflowId) {
        throw new Error('内容生成工作流ID未配置，请先配置workflowId');
    }
    
    const requestBody = {
        chatId: Date.now().toString(),
        stream: false,
        detail: true,
        workflowId: API_CONFIG.FASTGPT_CONTENT.workflowId,
        messages: [{ role: 'user', content: '' }],
        variables: {
            style_output: styleOutput,
            content_length: contentLength,
            topic: topic,
            style_type: styleType,
            remark: remark || ''
        }
    };
    
    const response = await fetch(`${API_BASE}/api/fastgpt/v1/chat/completions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_CONFIG.FASTGPT_CONTENT.apiKey}`
        },
        body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`内容生成工作流调用失败: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    console.log('✅ FastGPT内容生成工作流响应:', result);
    
    if (result?.newVariables?.AIcontent_output) {
        return result.newVariables.AIcontent_output;
    }
    
    if (result?.choices?.[0]?.message?.content) {
        return result.choices[0].message.content;
    }
    
    throw new Error('无法从工作流获取内容生成结果');
}

// 添加环境检测和提示
function showEnvironmentInfo() {
    const infoDiv = document.createElement('div');
    infoDiv.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        background: ${isLocalEnvironment ? '#4CAF50' : '#FF9800'};
        color: white;
        padding: 10px;
        border-radius: 5px;
        font-size: 12px;
        z-index: 10000;
        max-width: 300px;
    `;
    
    if (isLocalEnvironment) {
        infoDiv.innerHTML = `
            ✅ 本地环境<br>
            🔗 API: 相对路径<br>
            🚀 功能完整可用
        `;
    } else {
        infoDiv.innerHTML = `
            ⚠️ GitHub Pages环境<br>
            🔗 API: ${LOCAL_API_BASE}<br>
            💡 需要本地服务器运行
        `;
    }
    
    document.body.appendChild(infoDiv);
    
    // 5秒后自动隐藏
    setTimeout(() => {
        infoDiv.style.opacity = '0';
        setTimeout(() => infoDiv.remove(), 1000);
    }, 5000);
}

// 页面加载时显示环境信息
document.addEventListener('DOMContentLoaded', showEnvironmentInfo);

// 导出修改后的函数
window.GitHubPagesFastGPT = {
    callStyleAnalysisWorkflow,
    callContentGenerationWorkflow,
    isLocalEnvironment,
    API_BASE
}; 