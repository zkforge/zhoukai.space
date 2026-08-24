---
title: "同步 Codex auth.json：本地与多台服务器的登录状态管理"
date: 2026-05-01T22:30:00+08:00
lang: zh
draft: true
description: "介绍一个 Codex auth.json 同步方案，用于在本地和多台服务器之间复用最新登录状态。"
---

[[toc]]

> 我经常在本地和多台远程服务器之间切换使用 Codex。每台机器单独登录会带来重复认证和状态不一致的问题，所以我在本地 `~/.zshrc` 里写了一个小函数：比较三处 `auth.json` 的刷新时间，选择最新的一份，再同步到其余机器。

## 背景：为什么需要同步 Codex 登录状态

Codex 的登录状态保存在本地用户目录下的 `auth.json`。在单机使用时这不是问题；但一旦进入多机器开发环境，就会出现几个重复场景：

- 本地已经登录，但远程服务器还没有登录。
- 在服务器上刷新了登录状态，本地反而不是最新。
- 多台服务器都要使用 Codex，每台机器都手动登录一次很麻烦。
- 某台机器的认证状态过期后，需要判断应该从哪里恢复。

我的同步目标可以抽象成：

| 位置       | 路径                     | 说明           |
| ---------- | ------------------------ | -------------- |
| 本地 Mac   | `$HOME/.codex/auth.json` | 日常主要入口   |
| `remote-a` | `$HOME/.codex/auth.json` | 远程服务器     |
| `remote-b` | `$HOME/.codex/auth.json` | 另一台远程环境 |

这个问题的核心不是文件复制，而是：**哪一份文件才是最新、最应该作为同步源**。

如果只是无脑从本地覆盖远程，可能会把服务器上刚刷新的登录状态覆盖掉。如果只是从远程拉回本地，也可能反过来覆盖本地新状态。所以需要先比较时间，再决定同步方向。

## 方案思路：用 `last_refresh` 决定同步源

Codex 的 `auth.json` 里包含 `last_refresh` 字段。这个字段可以作为登录状态新旧的判断依据。

同步逻辑可以拆成四步：

1. 读取本地 `auth.json` 的 `last_refresh`。
2. 通过 SSH 读取每台远程服务器上的 `last_refresh`。
3. 把这些时间转成 Unix timestamp，选出最大值。
4. 把最新的那份 `auth.json` 同步到其余位置。

这样做的优点是方向自动化。无论最新登录状态出现在本地、`remote-a` 还是 `remote-b`，函数都能把它扩散到其他机器。

## 本地 zsh 函数

下面是我放在本地 `~/.zshrc` 里的函数。这里使用脱敏后的主机名和路径写法；实际使用时只需要把 `remote-a`、`remote-b` 替换成自己 `~/.ssh/config` 里的 SSH alias。

```zsh
# 同步 codex auth.json 文件
auth() {
  local L="$HOME/.codex/auth.json"
  local H1="remote-a"
  local H2="remote-b"

  lts(){ [[ -f "$1" ]] || return; jq -r '.last_refresh // empty' "$1" 2>/dev/null | sed -E 's/\.[0-9]+Z$/Z/' | xargs -I{} date -j -u -f "%Y-%m-%dT%H:%M:%SZ" "{}" "+%s" 2>/dev/null; }
  rts(){ ssh "$1" 'f="$HOME/.codex/auth.json"; [[ -f "$f" ]] || exit 0; v=$(jq -r ".last_refresh // empty" "$f" 2>/dev/null | sed -E "s/\.[0-9]+Z$/Z/"); [[ -n "$v" ]] && date -u -d "$v" +%s 2>/dev/null'; }
  pull_remote(){ mkdir -p "$HOME/.codex"; ssh "$1" 'cat "$HOME/.codex/auth.json"' > "$L"; }
  push_remote(){ ssh "$1" 'mkdir -p "$HOME/.codex"; cat > "$HOME/.codex/auth.json"' < "$L"; }
  relay_remote(){ ssh "$1" 'cat "$HOME/.codex/auth.json"' | ssh "$2" 'mkdir -p "$HOME/.codex"; cat > "$HOME/.codex/auth.json"'; }

  local tl="$(lts "$L")" t1="$(rts "$H1")" t2="$(rts "$H2")"
  [[ -z "$tl$t1$t2" ]] && { echo "[ERROR] no valid auth.json"; return 1; }

  local src="local" max="${tl:-0}"
  [[ "${t1:-0}" -gt "$max" ]] && src="$H1" max="$t1"
  [[ "${t2:-0}" -gt "$max" ]] && src="$H2" max="$t2"

  [[ "$src" != "local" && "$tl" != "$max" ]] && pull_remote "$src"
  [[ "$src" != "$H1"   && "$t1" != "$max" ]] && { [[ "$src" == "local" ]] && push_remote "$H1" || relay_remote "$src" "$H1"; }
  [[ "$src" != "$H2"   && "$t2" != "$max" ]] && { [[ "$src" == "local" ]] && push_remote "$H2" || relay_remote "$src" "$H2"; }

  echo "[INFO] synced from $src"
}
```

使用方式很简单：

```bash
source ~/.zshrc
auth
```

如果改名为 `codex_auth`，对应调用就是：

```bash
codex_auth
```

## 关键实现细节

### 本地时间解析：`lts`

`lts` 负责读取本地文件：

```zsh
lts(){
  [[ -f "$1" ]] || return
  jq -r '.last_refresh // empty' "$1" 2>/dev/null |
    sed -E 's/\.[0-9]+Z$/Z/' |
    xargs -I{} date -j -u -f "%Y-%m-%dT%H:%M:%SZ" "{}" "+%s" 2>/dev/null
}
```

这里有两个处理点：

- `jq -r '.last_refresh // empty'`：只读取刷新时间，字段不存在时输出空值。
- `sed -E 's/\.[0-9]+Z$/Z/'`：去掉毫秒部分，方便 `date` 解析。

本地是 macOS，所以使用的是 BSD `date`：

```bash
date -j -u -f "%Y-%m-%dT%H:%M:%SZ" "2026-05-01T12:00:00Z" "+%s"
```

其中 `-j` 表示只解析时间，不修改系统时间。

### 远程时间解析：`rts`

`rts` 通过 SSH 在远程服务器上执行解析：

```zsh
rts(){
  ssh "$1" 'f="$HOME/.codex/auth.json"; [[ -f "$f" ]] || exit 0; v=$(jq -r ".last_refresh // empty" "$f" 2>/dev/null | sed -E "s/\.[0-9]+Z$/Z/"); [[ -n "$v" ]] && date -u -d "$v" +%s 2>/dev/null'
}
```

远程服务器通常是 Linux，所以这里使用 GNU `date`：

```bash
date -u -d "2026-05-01T12:00:00Z" +%s
```

这也是为什么本地和远程分别写成 `lts` 和 `rts`。macOS 与 Linux 的 `date` 参数不兼容，如果强行复用同一条命令，很容易在某一端失效。

### 选择最新源

这一段负责比较三处时间：

```zsh
local src="local" max="${tl:-0}"
[[ "${t1:-0}" -gt "$max" ]] && src="$H1" max="$t1"
[[ "${t2:-0}" -gt "$max" ]] && src="$H2" max="$t2"
```

默认先认为本地最新，然后依次比较 `remote-a` 和 `remote-b`。如果远程时间更大，就把同步源切换到对应机器。

这里使用 `${tl:-0}`、`${t1:-0}`、`${t2:-0}` 是为了处理文件不存在或字段无效的情况。无法解析的时间会被当作 `0`，不会成为同步源。

### 同步到其他机器

如果最新源在本地，就把本地文件通过 SSH 标准输入推送到远程：

```zsh
ssh "$H1" 'mkdir -p "$HOME/.codex"; cat > "$HOME/.codex/auth.json"' < "$L"
ssh "$H2" 'mkdir -p "$HOME/.codex"; cat > "$HOME/.codex/auth.json"' < "$L"
```

如果最新源在远程，就分两种情况：

- 远程到本地：使用 `ssh "$src" 'cat "$HOME/.codex/auth.json"' > "$L"`。
- 远程到另一台远程：使用 `ssh "$src" 'cat "$HOME/.codex/auth.json"' | ssh "$target" 'cat > "$HOME/.codex/auth.json"'`。

第二种写法避免了要求两台服务器之间能够互相 SSH。只要本地能分别连上两台机器，就可以通过本地这条管道完成中转。

## 依赖与前置条件

这个函数依赖四类能力：

| 依赖             | 使用位置           | 说明                     |
| ---------------- | ------------------ | ------------------------ |
| `zsh`            | 本地 shell         | 函数写在 `~/.zshrc` 中   |
| `jq`             | 本地和远程         | 解析 `auth.json`         |
| `ssh`            | 本地到远程         | 读取远程时间、远程间中转 |
| SSH 标准输入输出 | 本地与远程文件复制 | 同步 `auth.json`         |

本地 macOS 可以用 Homebrew 安装 `jq`：

```bash
brew install jq
```

远程 Ubuntu / Debian 可以用 apt 安装：

```bash
sudo apt update
sudo apt install -y jq
```

> 一般都有的 🥳

还需要保证 SSH alias 可用。例如本地 `~/.ssh/config` 中需要有类似配置：

```text
Host remote-a
    HostName <remote-a-host>
    User <remote-user>
    Port <ssh-port>

Host remote-b
    HostName <remote-b-host>
    User <remote-user>
    Port <ssh-port>
```

这里不建议把真实 IP、端口和私钥路径写进公开博客。文章里保留 alias 和目录结构即可，具体连接信息应留在本机 SSH 配置中。

## 验证方式

### 检查三处文件是否存在

先在本地检查：

```bash
test -f ~/.codex/auth.json && echo "local auth exists"
```

再检查远程：

```bash
ssh remote-a 'test -f ~/.codex/auth.json && echo "remote-a auth exists"'
ssh remote-b 'test -f ~/.codex/auth.json && echo "remote-b auth exists"'
```

### 检查 `last_refresh`

本地：

```bash
jq -r '.last_refresh // empty' ~/.codex/auth.json
```

远程：

```bash
ssh remote-a "jq -r '.last_refresh // empty' ~/.codex/auth.json"
ssh remote-b "jq -r '.last_refresh // empty' ~/.codex/auth.json"
```

### 执行同步

```bash
auth
```

正常情况下会输出：

```text
[INFO] synced from local
```

或者：

```text
[INFO] synced from remote-a
```

这里的 `src` 只表示本轮选择的最新源。它不是固定方向，每次都会根据三处 `last_refresh` 重新判断。

### 验证同步结果

同步完成后，再次查看三处 `last_refresh`：

```bash
jq -r '.last_refresh // empty' ~/.codex/auth.json
ssh remote-a "jq -r '.last_refresh // empty' ~/.codex/auth.json"
ssh remote-b "jq -r '.last_refresh // empty' ~/.codex/auth.json"
```

三处输出应该一致，或者至少都指向同一轮最新刷新时间。
