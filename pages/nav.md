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
    desc: Claude
    link: https://claude.ai
    icon: i-ri-sparkling-2-line
  - name: ChatGPT
    desc: ChatGPT
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
  - name: GitHub Trending
    desc: 热门开源项目
    link: https://github.com/trending
    icon: i-ri-fire-line
---

<!-- @layout-full-width -->
<ListLinks :links="frontmatter.links" />
