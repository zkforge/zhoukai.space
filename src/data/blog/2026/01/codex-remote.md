---
title: "在远程服务器上使用 Codex：通过本地代理解决网络问题"
author: Kai Zhou
pubDatetime: 2026-01-18T23:00:00+08:00
featured: true
draft: false
ogImage: ../../../../assets/images/og/2026/codex.png
tags:
  - VS Code
  - 远程开发
  - 代理配置
  - 开发工具
description: "介绍如何在远程服务器上使用 Codex 插件，通过 SSH 端口转发和 VS Code 代理设置让其连接到本地代理"
---

![VS Code Remote Codex](@/assets/images/og/2026/codex.png)

## 目录

> 在远程服务器上使用 VS Code 的 Codex 插件时，网络连接常常是个问题。本文介绍如何通过 SSH 端口转发和 VS Code 代理配置，让运行在远程服务器上的 Codex 插件顺利访问本地代理。

## 一、问题背景

在使用 VS Code Remote SSH 连接到远程服务器进行开发时，遇到了一个问题：**Codex 插件无法访问外网**。

### 1.1 问题现象

- Codex 插件安装在远程服务器上
- 插件运行在 Remote Extension Host 进程中
- 尝试使用 Codex 功能时，出现网络连接超时

---

## 二、原理分析

### 2.1 Remote Extension Host 的网络机制

关键点在于：**Codex 插件运行在 Remote Extension Host，它使用的是 VS Code 提供的网络层，而不是 shell 的网络设置**。

这意味着：

- ❌ 在 shell 中设置 `http_proxy` 等环境变量无效
- ❌ 在 `.bashrc` 或 `.zshrc` 中配置代理不起作用
- ✅ 必须通过 VS Code 的代理配置来设置

### 2.2 解决思路

既然 VS Code Remote Extension Host 会读取 VS Code 的代理设置，我们需要：

1. **在本地和远程之间建立代理通道**（SSH 端口转发）
2. **配置远程 VS Code 的代理设置**

---

## 三、解决方案

### 3.1 配置 SSH 端口转发

首先，在本地 SSH 配置文件中添加端口转发规则。编辑 `~/.ssh/config`：

```ssh
Host 服务器
    HostName 巴拉巴拉巴拉
    User zhoukai
    Port 巴拉
    RemoteForward 自己选 127.0.0.1:自己选
```

**关键配置说明**：

- `RemoteForward xxx 127.0.0.1:yyy`：将远程服务器的 xxx 端口转发到本地的 yyy 端口
- 本地 yyy 端口运行的是你的代理服务（如 Clash、V2Ray 等）
- 这样远程服务器就可以通过 `127.0.0.1:yyy` 访问你的本地代理

### 3.2 配置远程 VS Code 代理设置

连接到远程服务器后，编辑远程端的 VS Code 配置文件：

```bash
# 编辑远程 VS Code 配置
vi ~/.vscode-server/data/Machine/settings.json
```

添加以下配置：

```json
{
  "http.proxy": "http://127.0.0.1:yyy",
  "http.proxySupport": "override",
  "http.proxyStrictSSL": false
}
```

**配置说明**：

- `"http.proxy"`：代理服务器地址，指向 SSH 转发的本地端口
- `"http.proxySupport": "override"`：覆盖系统代理设置，强制使用此代理
- `"http.proxyStrictSSL": false`：关闭严格的 SSL 验证（根据需要设置）

### 3.3 重启 VS Code 连接

配置完成后：

1. 断开当前的 VS Code Remote SSH 连接
2. 重新连接到远程服务器
3. VS Code Remote Extension Host 会读取新的代理配置

---

## 四、验证与测试

### 4.1 检查端口转发

在远程服务器上，检查端口转发是否生效：

```bash
# 检查 1082 端口是否在监听
netstat -tuln | grep 1082
# 或
ss -tuln | grep 1082
```

应该看到类似 `127.0.0.1:1082` 的监听记录。

### 4.2 测试代理连接

在远程服务器上测试代理是否可用：

```bash
curl -x http://127.0.0.1:1082 https://www.google.com
```

如果能正常返回内容，说明代理通道工作正常。

### 4.3 测试 Codex 插件

在 VS Code Remote 中尝试使用 Codex 功能，验证是否能正常访问网络服务。

---

## 五、常见问题

### Q1: 配置后仍然无法连接？

**可能原因**：

- 本地代理服务未启动
- SSH 端口转发未生效（检查 SSH 连接日志）
- 防火墙阻止了连接

**解决方法**：

1. 确保本地代理服务正常运行
2. 重新建立 SSH 连接，查看是否有端口转发相关错误
3. 检查远程服务器的防火墙设置

### Q2: 代理速度很慢？

**可能原因**：

- 本地代理服务器性能限制
- 网络延迟

### Q3: SSL 证书错误？

如果遇到 SSL 证书相关错误，可以：

- 设置 `"http.proxyStrictSSL": false`
- 或者确保代理服务器的 SSL 证书配置正确

---

## 六、总结

1. **理解机制**：Remote Extension Host 使用 VS Code 的网络层，不读取 shell 代理设置
2. **端口转发**：通过 SSH `RemoteForward` 建立本地代理到远程服务器的通道
3. **VS Code 配置**：在远程服务器的 VS Code 配置中设置代理参数

这种方法不仅适用于 Codex 插件，也适用于其他需要在远程服务器上访问网络的 VS Code 插件。

---

**参考资源**：

- [VS Code Remote SSH 文档](https://code.visualstudio.com/docs/remote/ssh)
- [SSH 端口转发详解](https://www.ssh.com/academy/ssh/tunneling/example)
