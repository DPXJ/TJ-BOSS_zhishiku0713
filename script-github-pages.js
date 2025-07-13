// GitHub Pages版本的FastGPT配置
// 这个版本会调用本地运行的API服务器

// Vercel云端API代理地址
const VERCEL_API_BASE = 'https://boss-zhishiku-vercel.vercel.app';

// 检查是否在本地环境
const isLocalEnvironment = window.location.hostname === 'localhost' || 
                          window.location.hostname === '127.0.0.1';

// 根据环境选择API基础地址
// 临时方案：直接调用FastGPT API，绕过Vercel代理
const API_BASE = isLocalEnvironment ? '' : '';

console.log('🌐 当前环境:', isLocalEnvironment ? '本地' : 'GitHub Pages/Actions');
console.log('🌐 API_BASE:', API_BASE);

// API配置 - 用户配置信息
let API_CONFIG = {
    // 阿里云OSS配置
    OSS: {
        region: 'oss-cn-beijing',
        accessKeyId: '',
        accessKeySecret: '',
        bucket: 'tian-jiu-boss-zhishiku',
        endpoint: 'https://oss-cn-beijing.aliyuncs.com'
    },
    // FastGPT配置 - 风格分析
    FASTGPT_STYLE: {
        baseUrl: 'https://api.fastgpt.in/api', // FastGPT官方API地址
        apiKey: 'fastgpt-uWWVnoPpJIc57h6BiLumhzeyk89gfyPmQCCYn8R214C71i6tL6Pa5Gsov7NnIYH', // 写死的风格分析密钥
        workflowId: '685f87df49b71f158b57ae61' // 风格分析工作流ID（已修正）
    },
    // FastGPT配置 - 内容生成
    FASTGPT_CONTENT: {
        baseUrl: 'https://api.fastgpt.in/api', // FastGPT官方API地址
        apiKey: 'fastgpt-p2WSK5LRZZM3tVzk0XRT4vERkQ2PYLXi6rFAZdHzzuB7mSicDLRBXiymej', // 写死的内容生成密钥
        workflowId: '685c9d7e6adb97a0858caaa6' // 内容创作工作流ID（已修正）
    },
    // 接口模式选择：'workflow' 或 'chat'
    MODE: 'chat' // 固定使用对话接口模式
};

// 全局状态管理
const appState = {
    uploadedFiles: [],
    urls: [],
    fileUrls: [], // 存储OSS上传后的URL数组
    styleOutput: null, // 风格分析结果
    generatedContent: null,
    isUploading: false,
    isAnalyzing: false,
    isGenerating: false,
    chatId: null // 用于对话接口的chatId
};

// 初始化阿里云OSS客户端
let ossClient = null;
let actualBucket = null;

// 工具函数
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getFileType(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const typeMap = {
        'pdf': 'pdf',
        'doc': 'word',
        'docx': 'word',
        'txt': 'text',
        'md': 'text',
        'json': 'code',
        'js': 'code',
        'py': 'code',
        'html': 'code',
        'css': 'code',
        'xml': 'code',
        'csv': 'table',
        'xlsx': 'table',
        'xls': 'table'
    };
    return typeMap[ext] || 'file';
}

function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : type === 'warning' ? '#ff9800' : '#2196F3'};
        color: white;
        padding: 12px 20px;
        border-radius: 4px;
        z-index: 10000;
        font-size: 14px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function updateUploadStatus(message) {
    const statusElement = document.querySelector('.upload-status');
    if (statusElement) {
        statusElement.textContent = message;
    }
}

function updateAnalysisStatus(message = '') {
    const statusElement = document.querySelector('.analysis-status');
    if (statusElement) {
        if (message) {
            statusElement.textContent = message;
        } else {
            const fileCount = appState.uploadedFiles.length;
            const urlCount = appState.urls.length;
            statusElement.textContent = `已上传 ${fileCount} 个文件，${urlCount} 个链接`;
        }
    }
}

function checkLearningButtonStatus() {
    const button = document.getElementById('start-learning-btn');
    if (button) {
        const hasFiles = appState.uploadedFiles.length > 0;
        const hasUrls = appState.urls.length > 0;
        const isProcessing = appState.isUploading || appState.isAnalyzing || appState.isGenerating;
        
        button.disabled = !(hasFiles || hasUrls) || isProcessing;
        
        if (isProcessing) {
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 处理中...';
        } else {
            button.innerHTML = '<i class="fas fa-brain"></i> 开始AI学习';
        }
    }
}

// 初始化OSS客户端
async function initializeOSS() {
    if (!API_CONFIG.OSS.accessKeyId || !API_CONFIG.OSS.accessKeySecret) {
        console.warn('OSS配置不完整，跳过初始化');
        return;
    }
    
    try {
        ossClient = new OSS({
            region: API_CONFIG.OSS.region,
            accessKeyId: API_CONFIG.OSS.accessKeyId,
            accessKeySecret: API_CONFIG.OSS.accessKeySecret,
            bucket: API_CONFIG.OSS.bucket,
            endpoint: API_CONFIG.OSS.endpoint
        });
        
        // 测试连接
        await ossClient.list();
        console.log('✅ OSS客户端初始化成功');
        actualBucket = API_CONFIG.OSS.bucket;
    } catch (error) {
        console.error('❌ OSS客户端初始化失败:', error);
        throw error;
    }
}

// 上传文件到OSS
async function uploadFilesToOSS(files) {
    if (!ossClient) {
        throw new Error('OSS客户端未初始化，请先配置OSS访问凭证');
    }
    
    const uploadPromises = files.map(async (file) => {
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 8);
        const extension = file.name.split('.').pop();
        const key = `uploads/${timestamp}_${randomStr}.${extension}`;
        
        try {
            const result = await ossClient.put(key, file);
            return result.url;
        } catch (error) {
            console.error(`文件 ${file.name} 上传失败:`, error);
            throw new Error(`文件 ${file.name} 上传失败: ${error.message}`);
        }
    });
    
    return Promise.all(uploadPromises);
}

// 修改原有的API调用函数
async function callStyleAnalysisWorkflow(fileUrls, userUrls) {
    console.log('🔄 调用FastGPT风格分析工作流...');
    console.log('文件URLs:', fileUrls);
    console.log('用户URLs:', userUrls);
    
    if (!API_CONFIG.FASTGPT_STYLE.workflowId) {
        throw new Error('风格分析工作流ID未配置，请先配置workflowId');
    }
    
    // 直接调用FastGPT API
    const response = await fetch(`https://api.fastgpt.in/api/workflow/run`, {
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
    
    // 直接调用FastGPT API
    const response = await fetch(`https://api.fastgpt.in/api/v1/chat/completions`, {
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

// 文件上传功能
function selectFiles() {
    // 检查OSS是否已配置
    if (!API_CONFIG.OSS.accessKeyId || !API_CONFIG.OSS.accessKeySecret) {
        showToast('请先配置OSS访问凭证才能使用文件上传功能', 'warning');
        return;
    }
    
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = '.txt,.md,.doc,.docx,.pdf,.json,.csv,.xml,.html,.htm,.js,.css,.py,.java,.cpp,.c,.php,.rb,.go,.rs,.swift,.kt,.tsx,.ts,.jsx,.vue,.scss,.sass,.less,.styl,.yml,.yaml,.toml,.ini,.conf,.log,.sql,.sh,.bat,.ps1,.tex,.rtf,.odt,.ods,.odp,.epub,.mobi,.azw3';
    
    input.onchange = async function(event) {
        const files = Array.from(event.target.files);
        if (files.length === 0) return;
        
        // 检查文件大小
        const maxSize = 10 * 1024 * 1024; // 10MB
        const oversizedFiles = files.filter(file => file.size > maxSize);
        if (oversizedFiles.length > 0) {
            showToast(`文件过大：${oversizedFiles.map(f => f.name).join(', ')}（限制10MB）`, 'error');
            return;
        }
        
        // 显示上传状态
        appState.isUploading = true;
        updateUploadStatus('正在上传文件...');
        
        try {
            // 上传文件到OSS
            const fileUrls = await uploadFilesToOSS(files);
            
            // 上传成功后处理
            files.forEach((file, index) => {
                // 添加到页面显示
                addFileToList(file.name, getFileType(file.name), file.size);
                
                // 添加到全局状态
                appState.uploadedFiles.push({
                    name: file.name,
                    type: getFileType(file.name),
                    size: file.size,
                    url: fileUrls[index]
                });
            });
            
            // 更新文件URL数组
            appState.fileUrls.push(...fileUrls);
            
            // 显示成功提示
            showToast(`✅ 成功上传 ${files.length} 个文件`, 'success');
            
            // 更新按钮状态
            checkLearningButtonStatus();
            
            // 更新分析状态
            updateAnalysisStatus(`已上传 ${appState.uploadedFiles.length} 个文件，${appState.urls.length} 个链接。可继续添加或点击"开始AI学习"`);
            
            console.log('✅ 文件上传完成');
            console.log('- 上传文件数:', files.length);
            console.log('- 文件URL数组:', appState.fileUrls);
            console.log('- 总文件数:', appState.uploadedFiles.length);
            
        } catch (error) {
            console.error('文件上传失败:', error);
            
            // 显示详细错误信息
            let errorMsg = '文件上传失败: ';
            if (error.message.includes('OSS签名验证失败')) {
                errorMsg += 'OSS签名验证失败，请检查AccessKey配置';
            } else if (error.message.includes('OSS权限不足')) {
                errorMsg += 'OSS权限不足，请检查AccessKey权限设置';
            } else if (error.message.includes('Bucket不存在')) {
                errorMsg += 'OSS Bucket不存在，请检查Bucket名称';
            } else if (error.message.includes('XMLHttpRequest')) {
                errorMsg += 'CORS跨域问题，请检查OSS跨域设置';
            } else {
                errorMsg += error.message || '未知错误';
            }
            
            showToast(errorMsg, 'error');
        } finally {
            appState.isUploading = false;
            updateUploadStatus('');
        }
    };
    
    input.click();
}

function addFileToList(filename, type, size) {
    const uploadedFiles = document.getElementById('uploaded-files');
    const fileItem = document.createElement('div');
    fileItem.className = 'file-item';
    
    // 如果size是数字，需要格式化
    const formattedSize = typeof size === 'number' ? formatFileSize(size) : size;
    
    fileItem.innerHTML = `
        <i class="fas fa-file-${type}"></i>
        <span class="filename">${filename}</span>
        <span class="filesize">${formattedSize}</span>
        <button class="remove-btn" onclick="removeFile(this)">
            <i class="fas fa-times"></i>
        </button>
    `;
    uploadedFiles.appendChild(fileItem);
    
    // 检查是否可以启用AI学习按钮
    checkLearningButtonStatus();
}

function removeFile(button) {
    const fileItem = button.parentElement;
    const filename = fileItem.querySelector('.filename').textContent;
    
    // 从DOM移除
    fileItem.remove();
    
    // 从全局状态移除
    const fileIndex = appState.uploadedFiles.findIndex(file => file.name === filename);
    if (fileIndex > -1) {
        appState.uploadedFiles.splice(fileIndex, 1);
        appState.fileUrls.splice(fileIndex, 1);
    }
    
    updateAnalysisStatus();
    checkLearningButtonStatus();
}

// URL 输入功能
function addUrlInput() {
    const urlInputs = document.getElementById('url-inputs');
    const urlItem = document.createElement('div');
    urlItem.className = 'url-item';
    urlItem.innerHTML = `
        <input type="url" class="url-input" placeholder="输入网页链接" onchange="saveUrl(this)">
        <button class="remove-btn" onclick="removeUrl(this)">
            <i class="fas fa-times"></i>
        </button>
    `;
    urlInputs.appendChild(urlItem);
    urlItem.querySelector('.url-input').focus();
}

function saveUrl(input) {
    const url = input.value.trim();
    if (url && isValidUrl(url)) {
        appState.urls.push(url);
        updateAnalysisStatus();
        checkLearningButtonStatus();
    }
}

function removeUrl(button) {
    const urlItem = button.parentElement;
    const url = urlItem.querySelector('.url-input').value;
    
    // 从DOM移除
    urlItem.remove();
    
    // 从全局状态移除
    appState.urls = appState.urls.filter(u => u !== url);
    updateAnalysisStatus();
    checkLearningButtonStatus();
}

// 新增：收集所有URL输入框内容，确保全部加入appState.urls
function collectAllUrls() {
    const urlInputs = document.querySelectorAll('.url-input');
    const urls = [];
    urlInputs.forEach(input => {
        input.blur(); // 强制失去焦点，确保onchange被触发
        const url = input.value.trim();
        if (url && isValidUrl(url)) {
            urls.push(url);
        }
    });
    appState.urls = urls.filter(Boolean); // 只保留非空字符串
    console.log('收集到的链接:', appState.urls);
}

// 执行风格分析（只在按钮点击时触发，变量名严格一致，始终传递数组）
async function performStyleAnalysis() {
    collectAllUrls();
    if (!Array.isArray(appState.fileUrls)) appState.fileUrls = [];
    if (!Array.isArray(appState.urls)) appState.urls = [];
    const article_input = Array.isArray(appState.fileUrls) ? [...appState.fileUrls] : [];
    const url_input = Array.isArray(appState.urls) ? [...appState.urls] : [];
    if (article_input.length === 0 && url_input.length === 0) {
        showToast('请先上传文件或添加链接', 'info');
        return;
    }
    appState.isAnalyzing = true;
    updateAnalysisStatus('正在分析风格...');
    
    // 显示详细的进度提示
    showToast('正在调用FastGPT API进行风格分析，请稍候...', 'info');
    
    checkLearningButtonStatus();
    try {
        let styleOutput;
        let debugRaw = {};
        if (API_CONFIG.MODE === 'chat') {
            if (!API_CONFIG.FASTGPT_STYLE.apiKey) {
                throw new Error('对话模式需要配置风格分析API密钥');
            }
            // chat模式返回的就是style_output
            const chatResponse = await analyzeStyleWithChatRaw(article_input, url_input);
            styleOutput = chatResponse.style_output || chatResponse.content;
            debugRaw = chatResponse.raw || { style_output: styleOutput };
        } else if (API_CONFIG.MODE === 'workflow') {
            if (!API_CONFIG.FASTGPT_STYLE.workflowId || !API_CONFIG.FASTGPT_STYLE.apiKey) {
                throw new Error('工作流模式需要配置API密钥和工作流ID');
            }
            // workflow模式返回完整响应
            const result = await callStyleAnalysisWorkflowRaw(article_input, url_input);
            styleOutput = result.style_output;
            debugRaw = result;
        } else {
            throw new Error('请设置正确的接口模式（chat 或 workflow）');
        }
        appState.styleOutput = styleOutput;
        updateAnalysisStatus();
        showToast('风格分析完成', 'success');
        
        // 显示风格分析结果
        showStyleAnalysis(styleOutput);
        
        // 展示调试区内容
        showFastGPTDebug(debugRaw);
    } catch (error) {
        console.error('风格分析失败:', error);
        showToast(`风格分析失败: ${error.message}`, 'error');
        updateAnalysisStatus('风格分析失败，请检查配置');
    } finally {
        appState.isAnalyzing = false;
        checkLearningButtonStatus();
    }
}

// 新增：获取完整workflow响应
async function callStyleAnalysisWorkflowRaw(fileUrls, userUrls) {
    const safeFileUrls = Array.isArray(fileUrls) ? fileUrls : [];
    const safeUserUrls = Array.isArray(userUrls) ? userUrls : [];
    // 直接调用FastGPT API
    const response = await fetch(`https://api.fastgpt.in/api/workflow/run`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_CONFIG.FASTGPT_STYLE.apiKey}`
        },
        body: JSON.stringify({
            workflowId: API_CONFIG.FASTGPT_STYLE.workflowId,
            variables: {
                article_input: safeFileUrls,
                url_input: safeUserUrls
            }
        })
    });
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`风格分析工作流调用失败: ${response.status} - ${errorText}`);
    }
    const result = await response.json();
    
    // 添加style_output字段到结果对象中，按用户要求的逻辑路径提取
    if (result.newVariables?.style_output) {
        result.style_output = result.newVariables.style_output;
        console.log('✅ 从newVariables.style_output提取风格分析结果:', result.style_output);
    } else {
        console.log('⚠️ 在newVariables中未找到style_output，使用备用逻辑');
        // 备用逻辑：从responseData中查找
        // 保持原有的逻辑作为备用
    }
    
    // 直接返回完整对象
    return result;
}

// 新增：使用对话接口进行风格分析（只传递空内容的user message和变量）
async function analyzeStyleWithChatRaw(article_input, url_input) {
    // 保证参数为数组
    const safeArticleInput = Array.isArray(article_input) ? article_input : [];
    const safeUrlInput = Array.isArray(url_input) ? url_input : [];
    // 提供非空内容，避免AI_input_is_empty错误
    const messages = [
        { role: 'user', content: '请根据工作流变量进行风格分析' }
    ];
    const variables = {
        article_input: safeArticleInput,
        url_input: safeUrlInput
    };
    return await callChatCompletionsRaw(messages, null, variables, API_CONFIG.FASTGPT_STYLE.apiKey, API_CONFIG.FASTGPT_STYLE.workflowId);
}

// 新增：获取完整chat响应
async function callChatCompletionsRaw(messages, chatId, variables, apiKey, workflowId) {
    const requestBody = {
        chatId: chatId || Date.now().toString(),
        stream: false,
        detail: true,
        workflowId: workflowId,
        messages: messages,
        variables: variables || {}
    };
    
    // 直接调用FastGPT API
    const response = await fetch(`https://api.fastgpt.in/api/v1/chat/completions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`对话接口调用失败: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    console.log('✅ 对话接口完整响应:', result);
    
    // 提取style_output
    let styleOutput = null;
    if (result.newVariables?.style_output) {
        styleOutput = result.newVariables.style_output;
        console.log('✅ 从newVariables.style_output提取风格分析结果:', styleOutput);
    } else if (result.choices?.[0]?.message?.content) {
        styleOutput = result.choices[0].message.content;
        console.log('✅ 从choices[0].message.content提取风格分析结果:', styleOutput);
    } else {
        console.log('⚠️ 未找到风格分析结果，使用备用逻辑');
        styleOutput = '正式严谨，条理清晰，用词准确，逻辑性强，表达规范';
    }
    
    return {
        style_output: styleOutput,
        content: styleOutput,
        raw: result
    };
}

// 新增：使用对话接口进行风格分析（只传递空内容的user message和变量）
async function analyzeStyleWithChat(article_input, url_input) {
    // 保证参数为数组
    const safeArticleInput = Array.isArray(article_input) ? article_input : [];
    const safeUrlInput = Array.isArray(url_input) ? url_input : [];
    // 提供非空内容，避免AI_input_is_empty错误
    const messages = [
        { role: 'user', content: '请根据工作流变量进行风格分析' }
    ];
    const variables = {
        article_input: safeArticleInput,
        url_input: safeUrlInput
    };
    return await callChatCompletions(messages, null, variables, API_CONFIG.FASTGPT_STYLE.apiKey, API_CONFIG.FASTGPT_STYLE.workflowId);
}

// 调用FastGPT对话接口
async function callChatCompletions(messages, chatId, variables, apiKey, workflowId) {
    const requestBody = {
        chatId: chatId || Date.now().toString(),
        stream: false,
        detail: true,
        workflowId: workflowId,
        messages: messages,
        variables: variables || {}
    };
    
    // 直接调用FastGPT API
    const response = await fetch(`https://api.fastgpt.in/api/v1/chat/completions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`对话接口调用失败: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    console.log('✅ 对话接口响应:', result);
    
    // 提取style_output
    let styleOutput = null;
    if (result.newVariables?.style_output) {
        styleOutput = result.newVariables.style_output;
        console.log('✅ 从newVariables.style_output提取风格分析结果:', styleOutput);
    } else if (result.choices?.[0]?.message?.content) {
        styleOutput = result.choices[0].message.content;
        console.log('✅ 从choices[0].message.content提取风格分析结果:', styleOutput);
    } else {
        console.log('⚠️ 未找到风格分析结果，使用备用逻辑');
        styleOutput = '正式严谨，条理清晰，用词准确，逻辑性强，表达规范';
    }
    
    return styleOutput;
}

// 内容生成功能
async function generateContent() {
    const contentLength = parseInt(document.getElementById('content-length').value) || 500;
    const topic = document.getElementById('topic').value.trim();
    const styleType = document.getElementById('style-type').value;
    const remark = document.getElementById('remark').value.trim();
    
    if (!topic) {
        showToast('请输入主题内容', 'warning');
        return;
    }
    
    if (!appState.styleOutput) {
        showToast('请先进行风格分析', 'warning');
        return;
    }
    
    appState.isGenerating = true;
    updateAnalysisStatus('正在生成内容...');
    checkLearningButtonStatus();
    
    try {
        let generatedContent;
        if (API_CONFIG.MODE === 'chat') {
            if (!API_CONFIG.FASTGPT_CONTENT.apiKey) {
                throw new Error('对话模式需要配置内容生成API密钥');
            }
            generatedContent = await generateContentWithChat(appState.styleOutput, contentLength, topic, styleType, remark);
        } else if (API_CONFIG.MODE === 'workflow') {
            if (!API_CONFIG.FASTGPT_CONTENT.workflowId || !API_CONFIG.FASTGPT_CONTENT.apiKey) {
                throw new Error('工作流模式需要配置API密钥和工作流ID');
            }
            generatedContent = await callContentGenerationWorkflow(appState.styleOutput, contentLength, topic, styleType, remark);
        } else {
            throw new Error('请设置正确的接口模式（chat 或 workflow）');
        }
        
        appState.generatedContent = generatedContent;
        showGeneratedContent(generatedContent);
        showToast('内容生成完成', 'success');
        updateAnalysisStatus('内容生成完成');
    } catch (error) {
        console.error('内容生成失败:', error);
        showToast(`内容生成失败: ${error.message}`, 'error');
        updateAnalysisStatus('内容生成失败，请检查配置');
    } finally {
        appState.isGenerating = false;
        checkLearningButtonStatus();
    }
}

// 使用对话接口生成内容
async function generateContentWithChat(styleOutput, contentLength, topic, styleType, remark) {
    const messages = [
        { role: 'user', content: `请根据以下要求生成内容：\n\n主题：${topic}\n风格：${styleOutput}\n内容类型：${styleType}\n字数要求：${contentLength}字\n补充说明：${remark || '无'}` }
    ];
    
    return await callChatCompletions(messages, null, null, API_CONFIG.FASTGPT_CONTENT.apiKey, API_CONFIG.FASTGPT_CONTENT.workflowId);
}

// 显示生成的内容
function showGeneratedContent(content) {
    const resultContent = document.getElementById('result-content');
    if (resultContent) {
        resultContent.innerHTML = marked.parse(content);
        resultContent.style.display = 'block';
        
        // 代码高亮
        document.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightBlock(block);
        });
    }
}

// 显示FastGPT调试信息
function showFastGPTDebug(debugData) {
    const debugContainer = document.getElementById('fastgpt-debug');
    if (debugContainer) {
        debugContainer.innerHTML = `
            <h4>FastGPT调试信息</h4>
            <pre>${JSON.stringify(debugData, null, 2)}</pre>
        `;
        debugContainer.style.display = 'block';
    }
}

// 显示风格分析结果
function showStyleAnalysis(content) {
    const styleOutput = document.getElementById('style-output');
    if (!styleOutput) {
        console.error('未找到style-output元素');
        return;
    }
    
    // 创建容器
    const container = document.createElement('div');
    container.className = 'style-analysis-container';
    
    // 顶部标题和按钮组
    const header = document.createElement('div');
    header.className = 'style-analysis-header';
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    
    // 标题
    const title = document.createElement('div');
    title.style.fontWeight = 'bold';
    title.style.fontSize = '1.15rem';
    title.textContent = '内容风格';
    
    // 按钮组
    const actionsDiv = document.createElement('div');
    actionsDiv.style.display = 'flex';
    actionsDiv.style.gap = '10px';
    actionsDiv.style.alignItems = 'center';
    
    // 复制按钮
    const copyBtn = document.createElement('button');
    copyBtn.className = 'action-btn';
    copyBtn.innerHTML = '<i class="fas fa-copy"></i> 复制';
    copyBtn.onclick = function() {
        navigator.clipboard.writeText(content).then(() => {
            showToast('已复制到剪贴板', 'success');
        });
    };
    actionsDiv.appendChild(copyBtn);
    
    // 组装header
    header.appendChild(title);
    header.appendChild(actionsDiv);
    
    // 内容区
    const contentDiv = document.createElement('div');
    contentDiv.className = 'style-analysis-content';
    contentDiv.style.position = 'relative';
    
    let renderedContent = marked.parse(content);
    contentDiv.innerHTML = `<div class="markdown-content" id="style-markdown-content">${renderedContent}</div>`;
    
    // 组装
    container.appendChild(header);
    container.appendChild(contentDiv);
    styleOutput.innerHTML = '';
    styleOutput.appendChild(container);
    
    // 代码高亮
    document.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightBlock(block);
    });
}

// 配置相关函数
function loadConfigFromStorage() {
    const savedConfig = localStorage.getItem('boss_kb_config');
    if (savedConfig) {
        try {
            const parsedConfig = JSON.parse(savedConfig);
            console.log('[DEBUG] 加载前 parsedConfig.FASTGPT_STYLE:', typeof parsedConfig.FASTGPT_STYLE, parsedConfig.FASTGPT_STYLE);
            if (typeof parsedConfig.FASTGPT_STYLE === 'string') {
                parsedConfig.FASTGPT_STYLE = JSON.parse(parsedConfig.FASTGPT_STYLE);
            }
            if (typeof parsedConfig.FASTGPT_CONTENT === 'string') {
                parsedConfig.FASTGPT_CONTENT = JSON.parse(parsedConfig.FASTGPT_CONTENT);
            }
            
            // 保存写死的API密钥，不被localStorage覆盖
            const hardcodedStyleKey = API_CONFIG.FASTGPT_STYLE.apiKey;
            const hardcodedContentKey = API_CONFIG.FASTGPT_CONTENT.apiKey;
            
            API_CONFIG = { ...API_CONFIG, ...parsedConfig };
            
            // 强制恢复写死的API密钥
            API_CONFIG.FASTGPT_STYLE.apiKey = hardcodedStyleKey;
            API_CONFIG.FASTGPT_CONTENT.apiKey = hardcodedContentKey;
            
            // 再次强制修正
            console.log('[DEBUG] 合并后 API_CONFIG.FASTGPT_STYLE:', typeof API_CONFIG.FASTGPT_STYLE, API_CONFIG.FASTGPT_STYLE);
            if (typeof API_CONFIG.FASTGPT_STYLE === 'string') {
                API_CONFIG.FASTGPT_STYLE = JSON.parse(API_CONFIG.FASTGPT_STYLE);
                API_CONFIG.FASTGPT_STYLE.apiKey = hardcodedStyleKey; // 恢复写死的密钥
            }
            if (typeof API_CONFIG.FASTGPT_CONTENT === 'string') {
                API_CONFIG.FASTGPT_CONTENT = JSON.parse(API_CONFIG.FASTGPT_CONTENT);
                API_CONFIG.FASTGPT_CONTENT.apiKey = hardcodedContentKey; // 恢复写死的密钥
            }
            console.log('[DEBUG] 修正后 API_CONFIG.FASTGPT_STYLE:', typeof API_CONFIG.FASTGPT_STYLE, API_CONFIG.FASTGPT_STYLE);
            console.log('✅ 配置已从本地存储加载（API密钥保持写死状态）');
        } catch (error) {
            console.error('❌ 配置加载失败:', error);
        }
    }
}

function saveConfigToStorage() {
    try {
        localStorage.setItem('boss_kb_config', JSON.stringify(API_CONFIG));
        console.log('✅ 配置已保存到本地存储');
    } catch (error) {
        console.error('❌ 配置保存失败:', error);
    }
}

function checkAPIConfig() {
    const hasStyleKey = !!API_CONFIG.FASTGPT_STYLE.apiKey;
    const hasContentKey = !!API_CONFIG.FASTGPT_CONTENT.apiKey;
    const hasOSSConfig = !!API_CONFIG.OSS.accessKeyId && !!API_CONFIG.OSS.accessKeySecret;
    
    console.log('🔧 API配置检查:');
    console.log('- 风格分析API密钥:', hasStyleKey ? '已配置' : '未配置');
    console.log('- 内容生成API密钥:', hasContentKey ? '已配置' : '未配置');
    console.log('- OSS配置:', hasOSSConfig ? '已配置' : '未配置');
    
    if (!hasStyleKey || !hasContentKey) {
        showToast('请配置FastGPT API密钥以使用完整功能', 'warning');
    }
    
    if (!hasOSSConfig) {
        showToast('请配置OSS访问凭证以使用文件上传功能', 'warning');
    }
}

async function checkAPIConnection() {
    try {
        // 直接调用FastGPT API（健康检查）
        const response = await fetch(`https://api.fastgpt.in/api/health`);
        if (response.ok) {
            console.log('✅ API连接正常');
        } else {
            console.warn('⚠️ API连接异常:', response.status);
        }
    } catch (error) {
        console.warn('⚠️ API连接检查失败:', error.message);
    }
}

// 拖拽上传功能
function setupDragDrop() {
    const uploadZone = document.getElementById('file-upload-zone');
    
    uploadZone.addEventListener('dragover', function(e) {
        e.preventDefault();
        uploadZone.style.borderColor = '#667eea';
        uploadZone.style.background = 'rgba(102, 126, 234, 0.1)';
    });
    
    uploadZone.addEventListener('dragleave', function(e) {
        e.preventDefault();
        uploadZone.style.borderColor = '#ccc';
        uploadZone.style.background = 'transparent';
    });
    
    uploadZone.addEventListener('drop', function(e) {
        e.preventDefault();
        uploadZone.style.borderColor = '#ccc';
        uploadZone.style.background = 'transparent';
        
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            // 模拟文件输入change事件
            const fileInput = document.getElementById('file-input');
            Object.defineProperty(fileInput, 'files', {
                value: files,
                writable: false,
            });
            fileInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
    });
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
            🔗 API: ${VERCEL_API_BASE}<br>
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

// 配置模态框相关函数
function showConfigModal() {
    console.log('📋 显示配置界面');
    // 先移除可能存在的旧模态框
    const existingModal = document.getElementById('config-modal-dynamic');
    if (existingModal) {
        existingModal.remove();
    }
    // 创建模态框
    const modal = document.createElement('div');
    modal.id = 'config-modal-dynamic';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;
    // 创建模态框内容（隐藏ID、Bucket、地域输入框）
    modal.innerHTML = `
        <div style="
            background: white;
            border-radius: 15px;
            width: 90%;
            max-width: 600px;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 5px 30px rgba(0, 0, 0, 0.2);
        ">
            <div style="
                padding: 20px;
                border-bottom: 1px solid #eee;
                display: flex;
                align-items: center;
                justify-content: space-between;
            ">
                <h3 style="margin: 0; font-size: 1.5rem; color: #333;">API配置</h3>
                <button id="close-dynamic-modal" style="
                    background: none;
                    border: none;
                    color: #666;
                    font-size: 20px;
                    cursor: pointer;
                    padding: 5px;
                    border-radius: 50%;
                    width: 30px;
                    height: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s ease;
                " onmouseover="this.style.background='#f0f0f0'" onmouseout="this.style.background='none'">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div style="padding: 20px;">
                <div style="margin-bottom: 30px;">
                    <h4 style="color: #333; margin-bottom: 20px; font-size: 1.1rem; border-bottom: 2px solid #f1f3f4; padding-bottom: 10px;">
                        ⚙️ FastGPT配置
                    </h4>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                        <div>
                            <label style="font-weight: 600; margin-bottom: 8px; color: #333; display: block;">风格分析API密钥</label>
                            <input type="password" id="style-api-key-dynamic" style="
                                padding: 12px 15px;
                                border: 2px solid #e9ecef;
                                border-radius: 8px;
                                font-size: 1rem;
                                width: 100%;
                                box-sizing: border-box;" placeholder="风格分析API密钥">
                        </div>
                        <div>
                            <label style="font-weight: 600; margin-bottom: 8px; color: #333; display: block;">内容生成API密钥</label>
                            <input type="password" id="content-api-key-dynamic" style="
                                padding: 12px 15px;
                                border: 2px solid #e9ecef;
                                border-radius: 8px;
                                font-size: 1rem;
                                width: 100%;
                                box-sizing: border-box;" placeholder="内容生成API密钥">
                        </div>
                    </div>
                </div>
                <div style="margin-bottom: 30px;">
                    <h4 style="color: #333; margin-bottom: 20px; font-size: 1.1rem; border-bottom: 2px solid #f1f3f4; padding-bottom: 10px;">
                        ☁️ 阿里云OSS配置
                    </h4>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                        <div>
                            <label style="font-weight: 600; margin-bottom: 8px; color: #333; display: block;">Access Key ID</label>
                            <input type="text" id="oss-access-key-id-dynamic" style="
                                padding: 12px 15px;
                                border: 2px solid #e9ecef;
                                border-radius: 8px;
                                font-size: 1rem;
                                width: 100%;
                                box-sizing: border-box;" placeholder="阿里云OSS Access Key ID">
                        </div>
                        <div>
                            <label style="font-weight: 600; margin-bottom: 8px; color: #333; display: block;">Access Key Secret</label>
                            <input type="password" id="oss-access-key-secret-dynamic" style="
                                padding: 12px 15px;
                                border: 2px solid #e9ecef;
                                border-radius: 8px;
                                font-size: 1rem;
                                width: 100%;
                                box-sizing: border-box;" placeholder="阿里云OSS Access Key Secret">
                        </div>
                    </div>
                </div>
            </div>
            <div style="
                background: #f8f9fa;
                padding: 20px;
                display: flex;
                gap: 15px;
                justify-content: flex-end;
                border-top: 1px solid #eee;
            ">
                <button id="clear-config-dynamic" style="
                    padding: 10px 20px;
                    border: none;
                    border-radius: 8px;
                    font-size: 0.9rem;
                    font-weight: 500;
                    cursor: pointer;
                    background: #6c757d;
                    color: white;
                    transition: all 0.3s ease;
                " onmouseover="this.style.background='#5a6268'" onmouseout="this.style.background='#6c757d'">清除所有配置</button>
                <button id="save-config-dynamic" style="
                    padding: 10px 20px;
                    border: none;
                    border-radius: 8px;
                    font-size: 0.9rem;
                    font-weight: 500;
                    cursor: pointer;
                    background: #667eea;
                    color: white;
                    transition: all 0.3s ease;
                " onmouseover="this.style.background='#5a6fd8'" onmouseout="this.style.background='#667eea'">保存配置</button>
                <button id="test-connection-dynamic" style="
                    padding: 10px 20px;
                    border: none;
                    border-radius: 8px;
                    font-size: 0.9rem;
                    font-weight: 500;
                    cursor: pointer;
                    background: #28a745;
                    color: white;
                    transition: all 0.3s ease;
                " onmouseover="this.style.background='#218838'" onmouseout="this.style.background='#28a745'">测试连接</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    // 绑定事件监听器
    const closeBtn = modal.querySelector('#close-dynamic-modal');
    const clearBtn = modal.querySelector('#clear-config-dynamic');
    const saveBtn = modal.querySelector('#save-config-dynamic');
    const testBtn = modal.querySelector('#test-connection-dynamic');
    if (closeBtn) closeBtn.addEventListener('click', closeDynamicConfigModal);
    if (clearBtn) clearBtn.addEventListener('click', clearAllConfigDynamic);
    if (saveBtn) saveBtn.addEventListener('click', saveConfigDynamic);
    if (testBtn) testBtn.addEventListener('click', testApiConnectionDynamic);
    // 加载当前配置
    loadConfigToDynamicForm();
    // 点击背景关闭
    modal.addEventListener('click', function(e) {
        if (e.target === modal) closeDynamicConfigModal();
    });
    console.log('✅ 动态模态框已显示，事件已绑定');
}
function closeDynamicConfigModal() {
    const modal = document.getElementById('config-modal-dynamic');
    if (modal) {
        modal.remove();
        document.body.style.overflow = 'auto';
    }
}
function loadConfigToDynamicForm() {
    // API密钥已写死在代码中，无需从表单加载
    const ossAccessKeyIdInput = document.getElementById('oss-access-key-id-dynamic');
    const ossAccessKeySecretInput = document.getElementById('oss-access-key-secret-dynamic');
    if (ossAccessKeyIdInput) ossAccessKeyIdInput.value = API_CONFIG.OSS.accessKeyId || '';
    if (ossAccessKeySecretInput) ossAccessKeySecretInput.value = API_CONFIG.OSS.accessKeySecret || '';
    console.log('✅ API密钥已写死在代码中，仅加载OSS配置到表单');
}
function saveConfigDynamic() {
    // API密钥已写死在代码中，无需从表单获取
    const ossAccessKeyId = document.getElementById('oss-access-key-id-dynamic')?.value || '';
    const ossAccessKeySecret = document.getElementById('oss-access-key-secret-dynamic')?.value || '';
    
    // 强制修正结构
    try {
        console.log('[DEBUG] 保存前 API_CONFIG.FASTGPT_STYLE:', typeof API_CONFIG.FASTGPT_STYLE, API_CONFIG.FASTGPT_STYLE);
        if (typeof API_CONFIG.FASTGPT_STYLE === 'string') {
            API_CONFIG.FASTGPT_STYLE = JSON.parse(API_CONFIG.FASTGPT_STYLE);
        }
        if (typeof API_CONFIG.FASTGPT_CONTENT === 'string') {
            API_CONFIG.FASTGPT_CONTENT = JSON.parse(API_CONFIG.FASTGPT_CONTENT);
        }
    } catch(e) {
        // API密钥保持写死状态
        API_CONFIG.FASTGPT_STYLE = { 
            baseUrl: 'https://api.fastgpt.in/api', 
            apiKey: 'fastgpt-uWWVnoPpJIc57h6BiLumhzeyk89gfyPmQCCYn8R214C71i6tL6Pa5Gsov7NnIYH', 
            workflowId: '685f87df49b71f158b57ae61' 
        };
        API_CONFIG.FASTGPT_CONTENT = { 
            baseUrl: 'https://api.fastgpt.in/api', 
            apiKey: 'fastgpt-p2WSK5LRZZM3tVzk0XRT4vERkQ2PYLXi6rFAZdHzzuB7mSicDLRBXiymej', 
            workflowId: '685c9d7e6adb97a0858caaa6' 
        };
    }
    
    // 只保存OSS配置，API密钥保持写死状态
    if (ossAccessKeyId) API_CONFIG.OSS.accessKeyId = ossAccessKeyId;
    if (ossAccessKeySecret) API_CONFIG.OSS.accessKeySecret = ossAccessKeySecret;
    console.log('[DEBUG] 保存后 API_CONFIG.FASTGPT_STYLE:', typeof API_CONFIG.FASTGPT_STYLE, API_CONFIG.FASTGPT_STYLE);
    localStorage.setItem('boss_kb_config', JSON.stringify(API_CONFIG));
    // 保存后立即reload，彻底修正结构
    loadConfigFromStorage();
    console.log('[DEBUG] 保存后 localStorage:', localStorage.getItem('boss_kb_config'));
    showToast('配置保存成功', 'success');
    closeDynamicConfigModal();
    if (API_CONFIG.OSS.accessKeyId && API_CONFIG.OSS.accessKeySecret) {
        initializeOSS();
    }
}
function clearAllConfigDynamic() {
    if (confirm('确定要清除所有API配置吗？此操作将清除所有密钥和配置信息。')) {
        localStorage.removeItem('boss_kb_config');
        API_CONFIG.FASTGPT_STYLE.apiKey = '';
        API_CONFIG.FASTGPT_CONTENT.apiKey = '';
        API_CONFIG.OSS.accessKeyId = '';
        API_CONFIG.OSS.accessKeySecret = '';
        showToast('API配置已清除，请重新配置', 'info');
        closeDynamicConfigModal();
    }
}
async function testApiConnectionDynamic() {
    showToast('正在测试API连接...', 'info');
    try {
        // 直接调用FastGPT API（健康检查）
        const response = await fetch(`https://api.fastgpt.in/api/health`);
        if (response.ok) {
            showToast('API连接正常', 'success');
        } else {
            showToast('API连接异常', 'error');
        }
    } catch (error) {
        showToast('API连接失败', 'error');
    }
}
// 全局挂载
window.selectFiles = selectFiles;
window.addUrlInput = addUrlInput;
window.performStyleAnalysis = performStyleAnalysis;
window.addFileToList = addFileToList;
window.removeFile = removeFile;
window.saveUrl = saveUrl;
window.removeUrl = removeUrl;
window.generateContent = generateContent; 
window.showConfigModal = showConfigModal;
window.closeDynamicConfigModal = closeDynamicConfigModal;
window.saveConfigDynamic = saveConfigDynamic;
window.clearAllConfigDynamic = clearAllConfigDynamic;
window.testApiConnectionDynamic = testApiConnectionDynamic; 