---
title: "一行 zsh 函数，省掉 clone 前后的 cd"
date: 2026-06-10T11:00:00+08:00
lang: zh
draft: false
description: "一个叫 gtc 的 zsh 函数：切到统一目录、clone、自动 cd 进仓库，三步并一步。"
---

[[toc]]

`git clone` 前后各有一个 `cd`，几乎是每个开发者的肌肉记忆。先切到某个统一目录，clone 完再切进仓库。步骤不多，但每天重复十几次就烦了。

```bash
cd ~/code                                  # clone 前：先到统一目录
git clone git@github.com:some/repo.git
cd repo                                    # clone 后：切进仓库
```

三步可以合成一步。

## 函数

```bash
gtc() {
  local repo="$1"

  if [ -z "$repo" ]; then
    echo "用法: gtc <git-url>"
    return 1
  fi

  local base_dir="$HOME/code"
  mkdir -p "$base_dir"
  cd "$base_dir" || return 1

  git clone "$repo" || return 1

  local repo_name
  repo_name="$(basename "$repo" .git)"
  cd "$repo_name" || return 1
}
```

放到 `~/.zshrc` 里，之后：

```bash
gtc git@github.com:some/repo.git
# clone 完成，已经在 repo 目录里了
```

名字 `gtc` 取自 "git clone + cd"。三行关键逻辑各管一部分：`mkdir -p` 保证目标目录存在，`cd "$base_dir"` 省掉 clone 前的手动切目录，最后的 `basename` + `cd` 省掉 clone 后切进仓库。没有别名包装或其他花活——只是一个没有惊喜的工具函数。

不想放在 `~/code/` 的话，把 `base_dir` 改成你的路径就行。`~/src`、`~/projects` 都可以。
