// 在浏览器控制台中运行的调试脚本
// 复制整个脚本到控制台中执行

console.log('🔍 开始调试老板专属知识库...');

// 检查全局变量
console.log('🔍 检查全局变量:');
console.log('- typeof appState:', typeof appState);
console.log('- typeof performStyleAnalysis:', typeof performStyleAnalysis);
console.log('- typeof collectAllUrls:', typeof collectAllUrls);

// 检查appState内容
if (typeof appState !== 'undefined') {
    console.log('🔍 appState内容:');
    console.log('- fileUrls:', appState.fileUrls);
    console.log('- urls:', appState.urls);
    console.log('- uploadedFiles:', appState.uploadedFiles);
    console.log('- isAnalyzing:', appState.isAnalyzing);
    console.log('- isUploading:', appState.isUploading);
} else {
    console.log('❌ appState未定义');
}

// 检查按钮状态
const learningBtn = document.getElementById('start-learning-btn');
if (learningBtn) {
    console.log('🔍 学习按钮状态:');
    console.log('- disabled:', learningBtn.disabled);
    console.log('- onclick:', learningBtn.onclick);
    console.log('- 按钮文本:', learningBtn.textContent);
} else {
    console.log('❌ 找不到学习按钮');
}

// 检查文件上传区域
const fileUploadZone = document.getElementById('file-upload-zone');
if (fileUploadZone) {
    console.log('🔍 文件上传区域存在');
} else {
    console.log('❌ 找不到文件上传区域');
}

// 模拟文件上传测试
function simulateFileUpload() {
    console.log('🔍 模拟文件上传测试...');
    if (typeof appState !== 'undefined') {
        appState.fileUrls = ['https://example.com/test1.pdf'];
        appState.uploadedFiles = [{
            name: 'test1.pdf',
            type: 'pdf',
            size: 1024,
            url: 'https://example.com/test1.pdf'
        }];
        console.log('✅ 模拟文件上传完成');
        console.log('- fileUrls:', appState.fileUrls);
        console.log('- uploadedFiles:', appState.uploadedFiles);
        
        // 检查按钮状态
        if (typeof checkLearningButtonStatus === 'function') {
            checkLearningButtonStatus();
            console.log('✅ 按钮状态已更新');
        }
    } else {
        console.log('❌ appState未定义，无法模拟');
    }
}

// 测试performStyleAnalysis函数
function testPerformStyleAnalysis() {
    console.log('🔍 测试performStyleAnalysis函数...');
    if (typeof performStyleAnalysis === 'function') {
        try {
            // 确保有测试数据
            if (typeof appState !== 'undefined' && appState.fileUrls.length === 0) {
                appState.fileUrls = ['https://example.com/test1.pdf'];
            }
            
            performStyleAnalysis();
            console.log('✅ performStyleAnalysis函数调用成功');
        } catch (error) {
            console.log('❌ performStyleAnalysis函数调用失败:', error);
        }
    } else {
        console.log('❌ performStyleAnalysis函数不存在');
    }
}

// 提供调试函数
window.debugFunctions = {
    simulateFileUpload,
    testPerformStyleAnalysis,
    checkState: () => {
        console.log('🔍 当前状态:');
        console.log('- appState.fileUrls:', appState?.fileUrls);
        console.log('- appState.urls:', appState?.urls);
        console.log('- appState.isAnalyzing:', appState?.isAnalyzing);
    }
};

console.log('🔍 调试脚本加载完成');
console.log('🔍 可用的调试函数:');
console.log('- debugFunctions.simulateFileUpload() - 模拟文件上传');
console.log('- debugFunctions.testPerformStyleAnalysis() - 测试风格分析函数');
console.log('- debugFunctions.checkState() - 检查当前状态');
console.log('🔍 使用方法：在控制台中输入 debugFunctions.simulateFileUpload() 然后按回车'); 