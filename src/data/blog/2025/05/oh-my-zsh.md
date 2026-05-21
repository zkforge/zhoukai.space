---
title: Mac 终端美化及插件安装
author: Kai Zhou
pubDatetime: 2025-05-22T20:20:00.00+08:00
featured: false
draft: false
tags:
  - 终端美化
  - oh-my-zsh
  - 插件推荐
  - Mac
  - 开发工具
description: 本文详细介绍了如何在Mac上美化终端（Terminal），包括配置配色方案、安装和配置oh-my-zsh、主题与高效插件推荐。
---

> 本文将带你一步步完成 Mac 终端（Terminal）的美化，包括 oh-my-zsh 的安装、主题配置及高效插件推荐。

## 1. 目标
- 修改 Terminal 的 Profile：让 Terminal 配色更美观
- 安装 oh-my-zsh 主题：美化 oh-my-zsh
- 安装 oh-my-zsh 必备插件：让 Terminal 具有更高级和便利的功能

## 2. 准备工作
先安装 Homebrew，方便后续工具安装：

```sh
/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
```

如果你的 macOS 版本早于 Catalina，你需要手动安装 zsh：

```sh
# 安装 zsh
brew install zsh
# 设置 zsh 为你的默认 shell
chsh -s /usr/local/bin/zsh
```

### 2.1 修改 Terminal Profile 主题设置
1. 在 GitHub 的 [osx-terminal-theme](https://github.com/lysyi3m/osx-terminal-themes) 项目主页里寻找你喜欢的主题。
2. 在 schemes 目录里找到对应的主题文件并安装到 Terminal，设置为默认。

## 3. 安装 oh-my-zsh
Oh My Zsh 是一个令人愉快的、开源的、社区驱动的管理 zsh 配置的框架。它为我们带来了数千个有用的功能、助手、插件、主题，和其他一些令人惊叹的功能。

安装 oh-my-zsh：

```sh
sh -c "$(curl -fsSL https://raw.github.com/robbyrussell/oh-my-zsh/master/tools/install.sh)"
```

### 3.1 安装 oh-my-zsh 主题
#### 3.1.1 内置主题列表
oh-my-zsh 提供一批内置主题，可以直接设置使用。
- 在[内置主题列表](https://github.com/robbyrussell/oh-my-zsh/wiki/Themes)寻找你喜欢的主题。
- 在 `~/.zshrc` 配置文件里设置 `ZSH_THEME` 为你的主题名称。
- 激活设置：`source ~/.zshrc`
- 也可以直接使用默认主题，不需要任何操作

#### 3.1.2 第三方主题列表
许多第三方也开发了供 oh-my-zsh 使用的主题，可以去[第三方主题列表](https://github.com/robbyrussell/oh-my-zsh/wiki/External-themes)查看和安装。

## 4. 安装 oh-my-zsh 必备插件
oh-my-zsh 有非常丰富的插件可供使用，下面列举一些必备插件，可以大幅提高生产力。

示例：

```sh
# ~/.zshrc:
plugins=(
  git
  extract
  autojump
  zsh-autosuggestions
  zsh-syntax-highlighting
)
```

### 4.1 插件说明
- **git**
  - 自带插件，可以使用缩写命令，比如 `gaa` -> `git add --all`，通过 `alias | grep git` 查看所有支持缩写命令。
  - 激活：添加到 `~/.zshrc` 的 plugins 列表。
- **extract**
  - 自带插件，不用再使用复杂的 tar 来解压压缩包了。
  - 激活：添加 `extract` 到 `~/.zshrc` 的 plugins 列表。
- **autojump**
  - 使用 `j` 命令直接快速进入某个目录，比如 `j Downloads` -> `cd ~/Downloads`
  - 安装：`brew install autojump`
  - 激活：添加 `autojump` 至 `~/.zshrc` 配置文件的插件列表。
- **zsh-syntax-highlighting**
  - 命令高亮插件，命令不再只是同一个颜色了。
  - 安装：
    ```sh
    git clone https://github.com/zsh-users/zsh-syntax-highlighting ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting
    ```
  - 激活：添加 `zsh-syntax-highlighting` 至 `~/.zshrc` 配置文件的插件列表。
- **zsh-autosuggestions**
  - 输入时按右方向键 → 自动补全命令。
  - 安装：
    ```sh
    git clone https://github.com/zsh-users/zsh-autosuggestions ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions
    ```
  - 激活：添加 `zsh-autosuggestions` 至 `~/.zshrc` 配置文件的插件列表。

## 5. 个人 ~/.zshrc 配置

```sh
# theme
ZSH_THEME="robbyrussell"

# plugins
plugins=(
  git
  extract
  autojump
  zsh-autosuggestions
  zsh-syntax-highlighting
)
```

