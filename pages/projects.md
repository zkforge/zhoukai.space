---
title: Projects
description: Projects by Kai Zhou
wrapperClass: 'text-center'
lang: en
art: dots
projects:
  Products:
    - name: ConfBar
      desc: A native SwiftUI macOS menu bar app for viewing upcoming deadlines and countdowns for conferences listed by CCFDDL.
      link: https://github.com/zkforge/CCFDDLMenuBar
      icon: i-ri-macbook-line
    - name: LaTeX Resume Template
      desc: A ready-to-compile, one-page Chinese LaTeX resume template with an XeLaTeX workflow and placeholder content.
      link: https://github.com/zkforge/latex-resume-template
      icon: i-simple-icons-latex
---

<!-- @layout-full-width -->

<ListProjects :projects="frontmatter.projects" />
