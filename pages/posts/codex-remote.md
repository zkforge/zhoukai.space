---
title: "在远程服务器上使用 Codex：通过 SSH 反向转发复用本地代理"
date: 2026-01-18T23:00:00+08:00
lang: zh
draft: false
description: "介绍如何通过 SSH 反向端口转发，将本地代理提供给远程服务器上的 Codex VS Code 扩展使用。"
---

[[toc]]

> 使用 VS Code Remote - SSH 开发时，Codex 扩展通常运行在远程服务器上。如果远程服务器无法直接访问外网，而本地电脑已有可用代理，可以通过 SSH 反向端口转发，把本地代理映射到远程服务器，再让 Codex 使用这个远程端口。

## 问题背景

我的使用场景是：本地电脑可以正常访问网络，也运行着代理服务；远程服务器本身却无法直接连接 Codex 所需的网络服务。因此，在 VS Code 连接远程服务器后，Codex 会一直等待，最后提示连接超时。

这个问题容易产生一个误解：既然本地 VS Code 可以联网，远程窗口里的扩展也应该自动复用本地网络。实际上，VS Code Remote - SSH 会把许多扩展安装并运行在远程主机上。对这些扩展来说，`127.0.0.1` 指向的是远程服务器，而不是本地电脑。

因此，解决问题需要完成两件事：

1. 通过 SSH 反向端口转发，让远程服务器能够访问本地代理。
2. 在远程 VS Code 设置中，让 Codex 使用这个代理地址。

整个访问链路如下：

```text
远程 Codex 扩展
    -> 远程服务器 127.0.0.1:17890
    -> SSH 反向端口转发
    -> 本地电脑 127.0.0.1:7890
    -> 本地代理服务
    -> 外网
```

下面以本地代理端口 `7890`、远程转发端口 `17890` 为例。实际使用时，可以按自己的环境替换。

## 前置条件

开始配置前，需要确认：

- 本地代理已启动，并提供无需额外认证的 HTTP 代理端口或兼容 HTTP 的 mixed 端口。本文的配置不直接适用于仅支持 SOCKS 的端口。
- 本地终端可以通过 `~/.ssh/config` 中的主机别名连接远程服务器。
- 远程 SSH 服务允许 TCP 端口转发。
- Codex 扩展安装在 VS Code 的远程环境中。

可以先在本地验证代理端口：

```bash
curl --proxy http://127.0.0.1:7890 -I https://api.openai.com
```

只要能够收到 HTTP 响应，就说明本地代理链路可用。即使响应是 `401` 或 `404`，也代表请求已经到达服务器；此处检查的是网络连接，不是身份认证。

## 第一步：配置 SSH 反向端口转发

在本地编辑 `~/.ssh/config`，为目标服务器增加 `RemoteForward`：

```text
Host my-server
    HostName <服务器地址>
    User <用户名>
    Port <SSH 端口>
    RemoteForward 127.0.0.1:17890 127.0.0.1:7890
    ExitOnForwardFailure yes
```

其中：

- `127.0.0.1:17890` 是远程服务器上的监听地址。
- `127.0.0.1:7890` 是本地电脑上的代理地址。
- `RemoteForward` 会把远程 `17890` 端口收到的连接，通过 SSH 隧道转发到本地 `7890` 端口。
- `ExitOnForwardFailure yes` 可以在端口被占用或转发失败时直接报错，避免 SSH 已连接、代理通道却没有建立的假象。

这里显式绑定远程服务器的 `127.0.0.1`，是为了只允许远程服务器自身访问这个代理端口。不要把它改成 `0.0.0.0`，否则代理可能暴露给同一网络中的其他机器。

保存后，断开并重新建立 Remote - SSH 连接。已有 SSH 会话不会自动应用新配置。如果不确定 VS Code 是否读取了这份配置，可以在命令面板运行 `Remote-SSH: Show Log`，确认日志中的主机别名和 SSH 配置文件路径。

## 第二步：配置远程 VS Code 代理

连接远程服务器后，在 VS Code 命令面板中运行：

```text
Preferences: Open Remote Settings (JSON)
```

将下面的配置合并到远程 `settings.json` 中，不要覆盖其中已有的其他设置：

```json
{
  "http.proxy": "http://127.0.0.1:17890"
}
```

这里必须修改当前 SSH 主机对应的 **Remote Settings**，而不是本地的 User Settings。`http.proxy` 指向的也是远程服务器上的 `17890` 端口，而不是本地代理原本使用的 `7890` 端口。

配置完成后，重新加载 VS Code 窗口，或者断开并重新连接远程服务器，让 Codex 扩展重新启动并读取设置。

> VS Code 官方文档也支持在远程主机上设置 `HTTP_PROXY` 和 `HTTPS_PROXY` 环境变量。对于 Codex 扩展，Remote Settings 更直观，也更容易确认配置是否属于当前远程主机。如果选择环境变量方案，应把它们写入远程默认登录 shell 实际会读取的启动文件，并在修改后重新连接。

## 第三步：分层验证

排查这类问题时，最好依次验证端口、代理和 Codex，不要一开始就反复重装扩展。

### 1. 检查远程端口

在远程服务器上运行：

```bash
ss -lnt | grep 17890
# 如果系统没有 ss，也可以尝试：
netstat -lnt 2>/dev/null | grep 17890
```

正常情况下，应该能看到 `127.0.0.1:17890` 的监听记录。如果没有输出，说明 SSH 反向转发没有建立。

### 2. 检查代理通道

继续在远程服务器上运行：

```bash
curl --proxy http://127.0.0.1:17890 -I https://api.openai.com
```

如果能够收到 HTTP 响应，说明“远程端口 → SSH 隧道 → 本地代理”的基础 HTTP 链路已经打通。它不能验证 Codex 使用的全部接口、登录状态或长连接是否正常。

### 3. 检查 Codex 扩展

最后打开 Codex 面板并发起一次简单请求。如果 `curl` 已经成功，但 Codex 仍然超时，可以依次检查：

1. `http.proxy` 是否写在 Remote Settings，而不是本地 User Settings。
2. 代理地址是否使用远程端口 `17890`。
3. VS Code 窗口是否已经重新加载。
4. VS Code 的 Output 面板中，Codex 和 Remote Extension Host 日志是否出现更具体的错误。

## 常见问题

### 远程端口没有监听

常见原因包括：

- 修改 SSH 配置后没有重新连接。
- 远程 `17890` 端口已被占用。
- 服务器的 SSH 配置禁止 TCP 转发。
- VS Code 实际使用的不是刚刚修改的 SSH 配置文件或主机别名。

可以先在本地终端运行 `ssh my-server`，观察 `ExitOnForwardFailure` 返回的具体错误。必要时使用 `ssh -v my-server` 查看更详细的端口转发日志。

### 远程端口存在，但 curl 连接失败

这种情况通常说明 SSH 隧道已经建立，但隧道末端的本地代理不可用。重点检查：

- 本地代理是否仍在运行。
- 本地代理端口是否确实为 `7890`。
- `7890` 是否为 HTTP 或 mixed 端口，而不是仅支持 SOCKS 的端口。
- 本地代理是否允许来自本机 `127.0.0.1` 的连接。

### 出现 SSL 证书错误

不要把关闭证书校验作为默认配置。`"http.proxyStrictSSL": false` 会降低 TLS 校验强度，只适合在确认代理进行了 HTTPS 中间人检查、且暂时无法安装正确 CA 证书时用于定位问题。

更稳妥的做法是安装并信任代理或组织提供的 CA 证书。还要注意，系统 `curl` 与 VS Code/Node 进程使用的证书信任链可能不同，因此 `curl` 成功并不能排除扩展侧的证书问题。如果只是为了排查，可以临时关闭严格校验；确认原因后应恢复默认值。

### curl 成功，但 Codex 仍然不可用

`curl` 成功只能证明代理通道可用，不能证明 Codex 的登录状态和扩展本身都正常。此时还需要区分：

- 网络连接问题；
- Codex 登录或账号问题；
- 当前版本的 Codex 扩展问题；
- Remote Extension Host 启动异常。

按照日志里的具体错误继续排查，比重复修改代理端口更有效。

## 总结

这个方案的核心不是“让远程服务器直接使用本地网络”，而是建立一条明确的访问链路：

1. `RemoteForward` 把远程端口反向转发到本地代理。
2. Remote Settings 让远程运行的 Codex 扩展使用该端口。
3. 依次用端口监听、`curl` 和 Codex 请求验证每一层。

这种配置也可能适用于其他运行在远程 Extension Host、并且遵循 VS Code 代理设置的扩展，但不能假设所有扩展都使用相同的网络实现。

## 参考资料

- [OpenAI：Codex IDE extension](https://learn.chatgpt.com/docs/codex/ide)
- [VS Code：Remote Development using SSH](https://code.visualstudio.com/docs/remote/ssh)
- [VS Code：Remote Development Tips and Tricks](https://code.visualstudio.com/docs/remote/troubleshooting)
- [OpenSSH：`RemoteForward`](https://man.openbsd.org/ssh_config#RemoteForward)
