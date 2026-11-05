---
title: 项目
titleEn: Projects
description: 周凯的项目
wrapperClass: 'text-center'
art: dots
categoryLabels:
  Products: 产品
projects:
  Products:
    - name: DSH Claude Desktop Theme
      desc: 为 DeepSeek Harness Desktop 打造的 Claude 风格主题插件，支持 macOS 和 Windows 的浅色与深色模式
      descEn: A Claude-inspired theme plugin for DeepSeek Harness Desktop, with light and dark modes on macOS and Windows
      link: https://github.com/zkforge/dsh-claude-desktop-theme
      icon: i-ri-palette-line
    - name: DDLBar
      desc: 基于 SwiftUI 的原生 macOS 菜单栏应用，用于追踪会议截稿日期与倒计时
      descEn: Native macOS menu bar app (SwiftUI) for conference deadlines and countdowns
      link: https://github.com/zkforge/DDLBar
      icon: i-ri-macbook-line
    - name: LaTeX Resume Template
      desc: 开箱即用的单页中文 LaTeX 简历模板，采用 XeLaTeX 编译流程，附带占位内容。
      descEn: A ready-to-compile, one-page Chinese LaTeX resume template with an XeLaTeX workflow and placeholder content.
      link: https://github.com/zkforge/latex-resume-template
      icon: i-simple-icons-latex
---

<!-- @layout-full-width -->

<ListProjects :projects="frontmatter.projects" :category-labels="frontmatter.categoryLabels" />
