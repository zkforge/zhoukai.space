---
title: 项目
description: 周凯的项目
wrapperClass: 'text-center'
lang: zh-CN
art: dots
projects:
  产品:
    - name: ConfBar
      desc: 原生 SwiftUI macOS 菜单栏应用，查看 CCFDDL 收录会议的近期截稿时间与倒计时。
      link: https://github.com/zkforge/CCFDDLMenuBar
      icon: i-ri-macbook-line
    - name: LaTeX Resume Template
      desc: 可直接编译的一页式中文 LaTeX 简历模板，提供 XeLaTeX 工作流与占位内容。
      link: https://github.com/zkforge/latex-resume-template
      icon: i-simple-icons-latex
---

<!-- @layout-full-width -->

<ListProjects :projects="frontmatter.projects" />
