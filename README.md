# RemoteOps Industrial (赛博工业远程操控系统)

> **Pro Max Edition** - 专为低延迟远程操控设计的现代化工业前端系统。

## 🌟 项目亮点 (Highlights)

### 1. 极致视觉体验 (Cyberpunk Industrial)
我们抛弃了传统的 B 端呆板设计，采用了 **"赛博工业 (Cyber-Industrial)"** 视觉语言：
*   **沉浸式暗黑主题**: `#0f172a` 深空灰背景，搭配霓虹蓝 `#3b82f6` 与警告橙 `#f97316`。
*   **HUD 抬头显示**: 登录页与控制台采用战斗机 HUD 风格的边框与数据覆盖层。
*   **Fira Code 数据流**: 关键指标采用等宽编程字体，提供精密工业仪表的质感。
*   **动态扫描线**: 视频背景叠加 CRT 扫描线特效，增强临场感。

### 2. 毫秒级低延迟架构 (Low Latency)
专为远程驾驶/操控场景优化，端到端延迟 **<300ms**。
*   **视频流**: 放弃传统的 HLS/FLV，采用 **WebRTC** 直连技术。
    *   架构: `RTSP Camera` -> `go2rtc Gateway` -> `Browser (WebRTC)`
*   **信令**: 使用 **WebSocket** 传输控制指令，支持高频（30Hz）摇杆数据采样。

### 3. 移动端原生级适配 (Mobile First)
虽然是 Web 技术栈，但提供了原生 App 级的操控体验：
*   **多点触控 (Multi-touch)**: 支持左右手同时操作（左手行走、右手挖掘）。
*   **触觉反馈 (Haptics)**: 关键操作触发手机线性马达震动。
*   **自适应布局**: 智能检测横竖屏，强制引导横屏操作以获得最大视野。

---

## 🛠 技术栈 (Tech Stack)
*   **Framework**: React 18 + TypeScript + Vite
*   **Styling**: Tailwind CSS + Custom Animations
*   **Video**: Native WebRTC API (`RTCPeerConnection`)
*   **State**: React Hooks (Custom `useVehicleControl`)

---

## 🚀 快速开始 (Quick Start)

### 1. 环境准备
确保本地运行了后端 API 服务（Port 5001）和流媒体网关（如 `go2rtc`）。

### 2. 安装依赖
```bash
npm install
```

### 3. 启动开发服务器
```bash
npm run dev
```
访问 http://localhost:3000 即可体验。

---

## 📱 部署指南 (Deployment)

### 混合 App 打包 (Hybrid App)
本通过 WebView 嵌入 App 时，请确保：
1.  开启 `Hardware Acceleration` (硬件加速)。
2.  允许 `Autoplay` (视频自动播放)。
3.  授予 `Vibration` (震动) 权限。

### 流媒体服务配置
推荐使用 `go2rtc` 作为 RTSP 转 WebRTC 网关。配置文件模板见 `docs/go2rtc.yaml`。

---

## 📸 界面预览
*   **登录页**: HUD 风格身份验证。
*   **大厅**: 网格化设备状态监控。
*   **驾驶舱**: FPV/TPV 双视角切换 + 实时遥测数据。
