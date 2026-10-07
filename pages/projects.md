---
title: Projects
description: Projects by Kai Zhou
wrapperClass: 'text-center'
lang: en
art: dots
projects:
  Products:
    - name: DSH Claude Desktop Theme
      desc: A Claude-inspired theme plugin for DeepSeek Harness Desktop, with light and dark modes on macOS and Windows
      link: https://github.com/zkforge/dsh-claude-desktop-theme
      icon: i-ri-palette-line
    - name: DDLBar
      desc: Native macOS menu bar app (SwiftUI) for conference deadlines and countdowns
      link: https://github.com/zkforge/DDLBar
      icon: i-ri-macbook-line
    - name: LaTeX Resume Template
      desc: A ready-to-compile, one-page Chinese LaTeX resume template with an XeLaTeX workflow and placeholder content.
      link: https://github.com/zkforge/latex-resume-template
      icon: i-simple-icons-latex
---

<!-- @layout-full-width -->

<ListProjects :projects="frontmatter.projects" />
