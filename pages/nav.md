---
title: 导航
description: 周凯的网址导航
wrapperClass: 'text-center'
lang: zh-CN
art: dots
links:
  - name: GitHub
    desc: 代码托管与开源社区
    link: https://github.com
    icon: i-ri-github-line
  - name: Claude
    desc: AI 助手
    link: https://claude.ai
    icon: i-ri-sparkling-2-line
  - name: ChatGPT
    desc: AI 对话
    link: https://chatgpt.com
    icon: i-ri-chat-smile-3-line
  - name: Hugging Face
    desc: 模型与数据集社区
    link: https://huggingface.co
    icon: i-ri-robot-line
  - name: arXiv
    desc: 学术论文预印本
    link: https://arxiv.org
    icon: i-ri-file-paper-2-line
  - name: MDN
    desc: Web 开发文档
    link: https://developer.mozilla.org
    icon: i-ri-book-open-line
  - name: Vite
    desc: 前端构建工具
    link: https://vitejs.dev
    icon: i-ph-lightning
  - name: Hacker News
    desc: 技术社区资讯
    link: https://news.ycombinator.com
    icon: i-ri-newspaper-line
  - name: GitHub Trending
    desc: 热门开源项目
    link: https://github.com/trending
    icon: i-ri-fire-line
---

<!-- @layout-full-width -->
<ListLinks :links="frontmatter.links" />
