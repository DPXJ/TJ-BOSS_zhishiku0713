@echo off
echo 🚀 启动 FastGPT 代理服务器...
echo.

REM 检查是否安装了Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误: 未检测到 Node.js
    echo 💡 请先安装 Node.js: https://nodejs.org/
    pause
    exit /b 1
)

REM 检查是否安装了依赖
if not exist node_modules (
    echo 📦 正在安装依赖...
    npm install
    if errorlevel 1 (
        echo ❌ 依赖安装失败
        pause
        exit /b 1
    )
)

echo ✅ 启动代理服务器...
echo 📡 服务地址: http://localhost:3001
echo 💡 健康检查: http://localhost:3001/health
echo 🔧 代理路径: /api/fastgpt/*
echo.
echo 📝 启动后请在浏览器中打开您的应用
echo 🛑 按 Ctrl+C 停止服务器
echo.

npm start
pause 