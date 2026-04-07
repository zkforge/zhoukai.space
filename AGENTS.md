# 项目：个人博客

## 项目概述

这是一个基于 Astro 框架的个人博客网站，使用 AstroPaper 主题。

## 开发命令

- `pnpm install` - 安装依赖
- `pnpm run dev` - 启动开发服务器（localhost:4321）
- `pnpm run build` - 构建生产版本（包含类型检查、构建和搜索索引生成）

## 项目架构

### 内容管理
- 博客文章存储在 `src/data/blog/` 目录
- 使用 Astro Content Collections 管理内容
- 支持标签系统、草稿状态、特色文章
- 自动生成 RSS 订阅和站点地图

### 目录结构
```
src/
├── components/     # 可复用组件（卡片、按钮、页脚等）
├── layouts/        # 页面布局模板
├── pages/          # 页面路由
│   ├── posts/      # 文章详情页
│   ├── archives/   # 归档页
│   └── tags/       # 标签页
├── styles/         # 全局样式
├── utils/          # 工具函数（文章处理、OG 图片生成等）
├── assets/         # 静态资源（图片、图标）
└── data/           # 数据文件
    └── blog/       # 博客文章（分类在不同子目录）
```

### 关键配置
- `src/config.ts` - 站点配置（作者信息、SEO 设置、功能开关）
- `src/content.config.ts` - 内容集合定义和验证
- `astro.config.ts` - Astro 配置（插件、Markdown 设置、图片处理）

## 内容创作

### 文章结构
每个 Markdown 文章支持以下 frontmatter：
```yaml
---
author: Kai Zhou
pubDatetime: xxxx-xx-xx
modDatetime: xxxx-xx-xx
title: 文章标题
featured: false
draft: false
tags: [tech, ai]
description: 文章描述
---
```

### 文章分类
- `src/data/blog/xxxx/xx` - 个人原创文章

## 特殊功能

### 搜索功能
- 使用 Pagefind 提供静态搜索
- 构建时自动生成搜索索引
- 索引文件位于 `public/pagefind/`

### 动态 OG 图片
- 使用 Satori 和 Resvg 生成动态分享图片
- 支持自定义模板
- 构建时自动生成

### 代码高亮
- 使用 Shiki 提供语法高亮
- 支持差异显示、文件名显示等增强功能
- 明暗主题切换