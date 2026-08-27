# 🗺️ 我的足迹地图

交互式个人旅行地图，用 Leaflet.js 构建，记录每一段旅程的照片与故事。

<p align="center">
  <img src="https://img.shields.io/badge/stack-Leaflet%20%2B%20Vite-brightgreen" alt="Stack">
  <img src="https://img.shields.io/badge/deploy-GitHub%20Pages-blue" alt="Deploy">
  <img src="https://img.shields.io/badge/style-Griffin%20Editorial%20Dark-cyan" alt="Style">
</p>

## ✨ 功能

- 🗺️ **交互式地图** — 发光标记点，hover 放大，点击聚焦并展示详情
- 🧭 **旅行故事** — 左侧导航列表展示地点、日期、标签与描述
- 🖼️ **照片画廊** — 侧栏 2 列网格 + 点击 Lightbox 全屏查看（支持 ←/→/Esc）
- ⏱️ **时间线播放器** — 底部进度条，按日期自动播放（1.8s/步）
- 🛤️ **路线连线** — 路线组之间的流动虚线动画
- 🏷️ **标签筛选** — 顶部胶囊标签，筛选地图标记
- 🌍 **3D 地球** — Globe.GL 一键切换（CDN 懒加载）
- 🗂️ **多底图** — 探索（默认深色）/ 标准 / 卫星三种样式
- 🌗 **双主题** — 暗黑（默认）与白昼风格一键切换，选择自动保存
- 🔗 **URL 路由** — `/#/beijing` 直达地点，支持分享链接与前进/后退
- 📱 **响应式** — 桌面左侧导航 / 移动端底部抽屉
- 🚀 **自动部署** — GitHub Actions 推送即上线

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
├── config.js                  # 地图默认配置、底图、路线组
├── data/
│   └── locations.json         # ⭐ 所有地点数据（增删改只动这里）
├── components/
│   ├── Map.js                 # Leaflet 地图 + 标记
│   ├── Sidebar.js             # 地点详情面板
│   ├── PhotoGallery.js        # 照片网格
│   ├── Lightbox.js            # 全屏照片查看器
│   ├── Timeline.js            # 时间线播放器
│   ├── RouteLines.js          # 路线连线
│   ├── TagFilter.js           # 标签筛选
│   ├── GlobeView.js           # 3D 地球
│   ├── StatsPanel.js          # 统计面板
│   ├── StyleSwitcher.js       # 底图切换
│   └── ThemeSwitcher.js       # 暗黑/白昼主题切换
├── styles/                    # variables.css 为设计 token 入口
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

## 🎨 设计规范（Griffin Editorial）

- 深色底色 `#0C0C0B` + 暖色系（米白 `#E6E1D9` / 金色 `#D4A853` / 陶土 `#C2856A`），不用蓝色与紫色
- 双主题：默认暗黑，`data-theme="light"` 切换为暖纸色白昼风格，选择保存在 localStorage
- 标题用 Noto Serif SC，正文用系统无衬线，数字用 JetBrains Mono
- 无毛玻璃、无重阴影，边框统一 1px 发丝线，圆角最大 4px（胶囊除外）
- 背景点阵纹理；默认底图为 Esri 浅灰画布反色成深色（CARTO 免费瓦片已强制 API key 并加水印，故弃用）
- 完整设计 token 见 `src/styles/variables.css`

## 🚢 部署

推送 `master` 分支后由 GitHub Actions 自动构建并发布到 GitHub Pages（见 `.github/workflows/deploy.yml`）。也可以在本地 `npm run build`，把 `dist/` 放到任意静态托管。

## 📄 许可

MIT
