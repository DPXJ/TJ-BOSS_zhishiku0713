const fetch = require('node-fetch');

module.exports = async (req, res) => {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // 处理预检请求
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  try {
    const { path } = req.query;
    const fastgptPath = path || req.url.replace('/api/fastgpt-proxy', '');
    const fastgptUrl = `https://api.fastgpt.in/api${fastgptPath}`;
    
    console.log('🔄 Vercel代理请求:', fastgptUrl);
    console.log('📝 请求体:', req.body);
    
    const response = await fetch(fastgptUrl, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': req.headers.authorization
      },
      body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined
    });
    
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
    console.error('❌ Vercel代理服务器错误:', error);
    res.status(500).json({ 
      error: 'Proxy server error', 
      message: error.message 
    });
  }
}; 