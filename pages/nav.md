---
title: Links
description: Kai Zhou's collection of useful links
wrapperClass: 'text-center'
lang: en
art: dots
links:
  - name: GitHub
    desc: Code hosting and open-source community
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
    desc: Model and dataset community
    link: https://huggingface.co
    icon: i-ri-robot-line
  - name: arXiv
    desc: Academic paper preprints
    link: https://arxiv.org
    icon: i-ri-file-paper-2-line
  - name: GitHub Trending
    desc: Trending open-source projects
    link: https://github.com/trending
    icon: i-ri-fire-line
---

<!-- @layout-full-width -->
<ListLinks :links="frontmatter.links" />
