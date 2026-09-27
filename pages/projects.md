---
title: Projects
description: Projects by Kai Zhou
wrapperClass: 'text-center'
lang: en
art: dots
projects:
  Products:
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
