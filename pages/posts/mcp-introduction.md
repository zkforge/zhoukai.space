---
title: "MCP 是什么？"
date: 2025-06-24T10:00:00.00+08:00
lang: zh
draft: false
description: "本文简单介绍了 MCP (Model Context Protocol)"
---

## 什么是 MCP？

MCP 是一个开放协议，用于标准化应用程序如何向 LLM 提供上下文。将 MCP 想象成 AI 应用程序的 USB-C 接口。就像 USB-C 提供了一种标准化的方式来连接你的设备到各种外设和配件一样，MCP 提供了一种标准化的方式来连接 AI 模型到不同的数据源和工具。

## 为什么需要 MCP?

MCP 帮助你在 LLM 之上构建代理和复杂的工作流程。LLM 经常需要与数据和工具集成，MCP 提供：

- 一个不断增长的预构建集成列表，你的 LLM 可以直接插入
- 在 LLM 提供商和供应商之间切换的灵活性
- 在你的基础设施内保护数据的最佳实践

## 一般架构

MCP 的核心遵循客户端-服务器架构，其中主机应用程序可以连接到多个服务器：

![General architecture](/images/blog/2025/architecture.png)

- **MCP Hosts**: 像 Claude Desktop、IDE 或 AI 工具这样的程序，希望通过 MCP 访问数据
- **MCP Clients**: 与服务器保持 1:1 连接的协议客户端
- **MCP Servers**: 轻量级程序，每个都通过标准化的 Model Context Protocol 暴露特定功能
- **Local Data Sources**: 你的计算机文件、数据库和服务，MCP 服务器可以安全访问
- **Remote Services**: 通过互联网可用的外部系统（例如，通过 API），MCP 服务器可以连接
