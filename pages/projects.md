---
title: 项目
description: 周凯的项目
wrapperClass: 'text-center'
lang: zh-CN
art: dots
projects:
  产品与工具:
    - name: PaperDue
      desc: iOS 学术会议截稿日工具，整理截稿节点、日程、收藏与本地提醒。
      link: https://github.com/zkforge/PaperDue
      icon: i-ri-calendar-event-line
    - name: ConfBar
      desc: 原生 SwiftUI macOS 菜单栏应用，查看 CCFDDL 收录会议的近期截稿时间与倒计时。
      link: https://github.com/zkforge/CCFDDLMenuBar
      icon: i-ri-macbook-line
    - name: 中文 LaTeX 简历模板
      desc: 可直接编译的一页式中文 LaTeX 简历模板，提供 XeLaTeX 工作流与占位内容。
      link: https://github.com/zkforge/latex-resume-template
      icon: i-simple-icons-latex
  AI 与研究:
    - name: MedAgentCare
      desc: 面向学习、研究与工程演示的多智能体医疗咨询系统，包含流式交互与安全护栏。
      link: https://github.com/zkforge/MedAgentCare
      icon: i-ri-heart-pulse-line
    - name: IMDR
      desc: 面向 CCKS 2025 工业技术文档多模态推理问答评测的多模态 RAG 流程。
      link: https://github.com/zkforge/ccks-multimodel-rag
      icon: i-ri-file-search-line
---

<!-- @layout-full-width -->

<ListProjects :projects="frontmatter.projects" />
