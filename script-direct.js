// 直接调用FastGPT API的配置
const DIRECT_API_CONFIG = {
    FASTGPT_BASE_URL: 'https://api.fastgpt.in',
    FASTGPT_STYLE: {
        apiKey: 'your-style-api-key',
        workflowId: 'your-style-workflow-id'
    },
    FASTGPT_CONTENT: {
        apiKey: 'your-content-api-key',
        workflowId: 'your-content-workflow-id'
    }
};

// 直接调用风格分析工作流
async function callStyleAnalysisWorkflowDirect(fileUrls, userUrls) {
    console.log('🔄 直接调用FastGPT风格分析工作流...');
    
    if (!DIRECT_API_CONFIG.FASTGPT_STYLE.workflowId) {
        throw new Error('风格分析工作流ID未配置');
    }
    
    const response = await fetch(`${DIRECT_API_CONFIG.FASTGPT_BASE_URL}/api/workflow/run`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${DIRECT_API_CONFIG.FASTGPT_STYLE.apiKey}`
        },
        body: JSON.stringify({
            workflowId: DIRECT_API_CONFIG.FASTGPT_STYLE.workflowId,
            variables: {
                article_input: fileUrls,
                url_input: userUrls
            }
        })
    });
    
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`风格分析失败: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    console.log('✅ 直接调用风格分析响应:', result);
    
    // 提取style_output
    let styleOutput = null;
    if (result?.style_output) {
        styleOutput = result.style_output;
    } else if (result?.data?.style_output) {
        styleOutput = result.data.style_output;
    } else {
        throw new Error('无法找到style_output变量');
    }
    
    return styleOutput;
}

// 直接调用内容生成工作流
async function callContentGenerationWorkflowDirect(styleOutput, contentLength, topic, styleType, remark) {
    console.log('🔄 直接调用FastGPT内容生成工作流...');
    
    if (!DIRECT_API_CONFIG.FASTGPT_CONTENT.workflowId) {
        throw new Error('内容生成工作流ID未配置');
    }
    
    const requestBody = {
        chatId: Date.now().toString(),
        stream: false,
        detail: true,
        workflowId: DIRECT_API_CONFIG.FASTGPT_CONTENT.workflowId,
        messages: [{ role: 'user', content: '' }],
        variables: {
            style_output: styleOutput,
            content_length: contentLength,
            topic: topic,
            style_type: styleType,
            remark: remark || ''
        }
    };
    
    const response = await fetch(`${DIRECT_API_CONFIG.FASTGPT_BASE_URL}/api/v1/chat/completions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${DIRECT_API_CONFIG.FASTGPT_CONTENT.apiKey}`
        },
        body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`内容生成失败: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    console.log('✅ 直接调用内容生成响应:', result);
    
    // 提取生成的内容
    if (result?.newVariables?.AIcontent_output) {
        return result.newVariables.AIcontent_output;
    }
    
    if (result?.choices?.[0]?.message?.content) {
        return result.choices[0].message.content;
    }
    
    throw new Error('无法从响应中获取生成的内容');
}

// 直接调用聊天接口
async function callChatCompletionsDirect(messages, variables = null, workflowId = null) {
    console.log('🔄 直接调用FastGPT聊天接口...');
    
    const requestBody = {
        chatId: Date.now().toString(),
        stream: false,
        detail: true,
        messages: messages
    };
    
    if (variables) {
        requestBody.variables = variables;
    }
    
    if (workflowId) {
        requestBody.workflowId = workflowId;
    }
    
    const response = await fetch(`${DIRECT_API_CONFIG.FASTGPT_BASE_URL}/api/v1/chat/completions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${DIRECT_API_CONFIG.FASTGPT_CONTENT.apiKey}`
        },
        body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`聊天接口调用失败: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    console.log('✅ 直接调用聊天响应:', result);
    
    return result;
}

// 配置函数
function setDirectAPIConfig(config) {
    Object.assign(DIRECT_API_CONFIG, config);
    console.log('✅ 直接API配置已更新:', DIRECT_API_CONFIG);
}

// 测试连接
async function testDirectAPIConnection() {
    try {
        console.log('🔄 测试直接API连接...');
        
        const response = await fetch(`${DIRECT_API_CONFIG.FASTGPT_BASE_URL}/api/v1/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${DIRECT_API_CONFIG.FASTGPT_CONTENT.apiKey}`
            },
            body: JSON.stringify({
                chatId: 'test',
                stream: false,
                messages: [{ role: 'user', content: 'Hello' }]
            })
        });
        
        if (response.ok) {
            console.log('✅ 直接API连接测试成功');
            return true;
        } else {
            console.error('❌ 直接API连接测试失败:', response.status);
            return false;
        }
    } catch (error) {
        console.error('❌ 直接API连接测试异常:', error);
        return false;
    }
}

// 导出函数供其他模块使用
window.DirectFastGPT = {
    callStyleAnalysisWorkflowDirect,
    callContentGenerationWorkflowDirect,
    callChatCompletionsDirect,
    setDirectAPIConfig,
    testDirectAPIConnection,
    DIRECT_API_CONFIG
}; 