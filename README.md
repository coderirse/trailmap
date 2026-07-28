# 🗺️ 我的足迹地图

交互式个人旅行地图，用 Leaflet.js 构建，记录每一段旅程的照片与故事。

<p align="center">
  <img src="https://img.shields.io/badge/stack-Leaflet%20%2B%20Vite-brightgreen" alt="Stack">
  <img src="https://img.shields.io/badge/deploy-GitHub%20Pages-blue" alt="Deploy">
  <img src="https://img.shields.io/badge/style-glassmorphism%20dark%20theme-cyan" alt="Style">
</p>

## ✨ 功能

- 📍 **交互式地图** — 自定义发光标记点，hover 放大，点击展示详情
- 📝 **旅行故事** — 侧边栏展示地点描述、日期、标签
- 🖼️ **照片画廊** — 侧边栏 2 列网格 + 点击 Lightbox 全屏查看
- ⌨️ **键盘导航** — Lightbox 支持 ← → Esc 操作
- 🌗 **双主题** — Glassmorphism 深色主题（默认）+ 浅色主题
- 📱 **响应式** — 桌面侧边栏浮动面板 / 移动端底部滑入
- 🔗 **URL 路由** — `/#/beijing` 直达地点，支持分享链接
- ⚡ **自动部署** — GitHub Actions，推送即上线

## 🚀 快速开始

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # 构建到 dist/
```

## 📂 项目结构

```
src/
├── main.js                    # 入口：初始化组件、路由
├── config.js                  # 地图配置
├── data/
│   └── locations.json         # ★ 所有地点数据（增删改只动这里）
├── components/
│   ├── Map.js                 # Leaflet 地图 + 标记
│   ├── Sidebar.js             # 地点详情面板
│   ├── PhotoGallery.js        # 照片网格
│   └── Lightbox.js            # 全屏照片查看器
├── styles/
│   ├── variables.css          # CSS 变量（主题系统）
│   ├── base.css               # 基础样式
│   ├── map.css                # 地图 + 标记 + 浮动标题
│   ├── sidebar.css            # 侧边栏玻璃面板
│   └── lightbox.css           # 照片灯箱
├── utils/
│   ├── EventBus.js            # 发布/订阅（组件通信）
│   ├── DataStore.js           # 数据抽象层
│   ├── helpers.js             # DOM 工具 + hash 路由
│   └── geo.js                 # 地理计算工具
└── plugins/
    └── BasePlugin.js          # 插件基类
```

## ➕ 添加新地点

编辑 `src/data/locations.json`，照片放入 `public/photos/<id>/`：

```json
{
  "id": "chengdu",
  "name": "成都",
  "lat": 30.5728,
  "lng": 104.0668,
  "date": "2025-03",
  "tags": ["旅行", "美食"],
  "description": "在成都...",
  "photos": [
    { "src": "./photos/chengdu/01.jpg", "caption": "锦里" }
  ]
}
```

## 🎨 设计特色

- **Glass Explorer 主题** — 深海军蓝底色 + 极光青点缀，全玻璃拟态面板
- **发光标记** — 青色脉冲波纹动画，选中变为琥珀色
- **毛玻璃控件** — 地图缩放、归属信息均为半透明玻璃风格
- **自定义滚动条** — 侧边栏使用细条半透明滚动条

## 📄 许可

MIT
