---
title: 我的第一次 GitHub PR：从一个菜单栏小问题，到真正完成一次开源贡献
author: Kai Zhou
pubDatetime: 2026-03-18T20:00:00+08:00
featured: false
draft: false
ogImage: ../../../../assets/images/og/2026/first-pr.png
tags:
  - GitHub
  - 开源
  - PR
  - SwiftUI
  - CodexBar
description: 从 CodexBar 的一个菜单栏换行问题出发，记录我第一次完整走完 GitHub PR、验证、fork 与 review follow-up 的过程。
---

![我的第一次 GitHub PR](@/assets/images/og/2026/first-pr.png)

> 这篇文章记录一次完整的开源 PR 过程：发现问题、定位根因、提交修复、补测试、处理 review，再把后续修改继续推到同一个 PR。

## 一、问题从哪里开始

最近我在使用 [CodexBar](https://github.com/steipete/CodexBar) 时，遇到了一个很具体但也很典型的 UI 问题：菜单栏组件展开后，底部会显示一条错误信息：

`An SSL error has occurred and a secure connection to the server cannot be made.`

这行文字太长，而且没有换行，结果把整个菜单的宽度直接撑大，右边出现了一大片空白。

这不是致命 bug，但观感很差，而且是一个很典型的 UI 细节问题，适合拿来做一次完整的开源修复。

## 二、先找根因，不急着改代码

看完代码后发现，这段文案并不是 SwiftUI 卡片里的文字，而是普通的 AppKit `NSMenuItem`。而 `NSMenuItem(title:)` 默认不会换行，所以只要文本足够长，菜单宽度就会被它撑开。

问题的根源并不是字符串太长，而是菜单项的渲染方式不支持多行。

这一步会直接决定修复方向：

- 如果根因是数据问题，就该改字符串来源。
- 如果根因是布局问题，就该改宽度约束。
- 如果根因是渲染模型本身不支持多行，就要改菜单项的呈现方式。

而这次真正需要改的是第三种。

## 三、第一版修复：先把显示层修对

所以我做的第一版修复思路很明确：把这类只读的二级说明文案，从普通的 `NSMenuItem(title:)` 改成固定宽度的自定义 view-backed menu item，让文本在菜单宽度内自动换行，而不是继续横向撑大菜单。

这个修复本质上是在改显示层，让布局行为符合预期。改完后有三个直接效果：

- 长文本不再把菜单横向撑大。
- 菜单宽度恢复正常。
- 状态说明文案能够在固定宽度内自动换行。

## 四、补测试和做验证

做完修改后，我补了一条测试，专门验证这个状态 blurb 会以自定义 view 的方式渲染，而不是继续走单行 `title` 渲染。

然后按照项目要求跑验证：

- `pnpm check` 通过
- `./Scripts/compile_and_run.sh` 通过
- 应用被重新构建、打包并重启

这里还有一个需要如实说明的点：全量 `swift test` 没有给出完全干净的结果，而是在 `swiftpm-testing-helper` 的 AppKit 绘制阶段撞到了一个现有的 `SIGSEGV`。

我把这件事直接写进了 PR 说明里。提交 PR 不只是“代码能跑”，还包括把验证过什么、没验证完什么、为什么没有完全验证清楚。

## 五、GitHub 流程里的 fork 模式

接下来就是 GitHub 流程本身。

我的本地仓库 `origin` 指向官方仓库，但我没有官方仓库的写权限，所以直接执行 `git push origin ...` 收到了 `403`。

这个报错对应的就是 GitHub 常见的 fork 工作流：你不是直接往上游仓库推代码，而是先 fork 到自己的账号，再把分支推到自己的 fork，最后从 fork 向上游仓库发起 PR。

于是我创建了自己的 fork，把分支 `codex/wrap-status-blurb` 推了上去，并创建了 PR：[steipete/CodexBar#543](https://github.com/steipete/CodexBar/pull/543)。

第一版提交的信息是：

- `ffb88a9` `Wrap long status blurbs in menu`

## 六、Review 真正改变了这次修复

reviewer 提醒我：这个 wrapped menu item 虽然解决了换行问题，但它现在是通过 `NSMenuItem()` 加自定义 view 创建的，这样可能会丢掉真正的 `item.title`。

换句话说，视觉上没问题，不代表语义层没问题。某些代码路径、菜单检查逻辑，甚至辅助功能行为，可能仍然依赖 `NSMenuItem.title`，而不是你塞进去的自定义 view。

这条 comment 很关键。它提醒我，修 UI bug 不能只看“显示正常”，还要看系统语义有没有被破坏。

## 七、第二版修复：保留语义，再更新测试

于是我继续修改代码：wrapped 的菜单项仍然保留真实的 `title`，自定义 view 只负责换行和布局，不再替代语义本身。

对应的测试也更新成检查：

```swift
XCTAssertEqual(statusItem.title, statusText)
```

这个 follow-up 的提交是：

- `943cd8d` `Preserve wrapped status blurb titles`

这次改完之后，我再次跑了：

- `pnpm check`
- `./Scripts/compile_and_run.sh`

确认应用已经用最新修复重新构建并运行，然后把新提交推到同一个 PR 上。

## 八、这次 PR 带来的几个具体收获

回头看，这次 PR 的价值不只是修了一个菜单栏换行 bug，而是把一整套开源协作流程走通了：

- 先把问题描述清楚，最好能给出截图和复现现象。
- 不要急着改，先确认根因到底是数据、布局还是渲染方式。
- 修复时不只看表面效果，还要补上能约束行为的测试。
- 提交 PR 之前，要尽量把验证过程说清楚，包括已通过的检查和未完全解决的问题。
- 没有上游写权限时，要先 fork，再推到自己的仓库，再发 PR。
- code review 不是挑刺，而是在帮你把能用的改动推向更完整的改动。

## 九、总结

这次 PR 让我更明确了一件事：开源贡献不只是写代码。

- 它包括定位问题
- 包括解释修复思路
- 包括补测试和说明验证范围
- 也包括处理 review，并继续把改动收完整

一个看起来很小的 UI 问题，如果认真走完定位、修复、验证、讨论和 follow-up，本身就是一次完整的工程训练。

## 附录

- 项目仓库：[steipete/CodexBar](https://github.com/steipete/CodexBar)
- 我的 PR：[Wrap long status blurbs in menu #543](https://github.com/steipete/CodexBar/pull/543)
