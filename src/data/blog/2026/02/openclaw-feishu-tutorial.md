---
title: "安装 OpenClaw 并接入飞书全流程记录"
author: Kai Zhou
pubDatetime: 2026-02-16T10:00:00+08:00
featured: true
draft: false
tags:
  - OpenClaw
  - 飞书
  - AI助手
  - 教程
  - 自动化
description: "详细演示如何在 Linux 上完成 OpenClaw 的安装、初始配置，并一步步接入飞书机器人，最终实现在飞书 App 中直接指挥 AI 助手"
---

## 目录

## 一、什么是 OpenClaw？

在开始之前，先做一下简单的科普：

**OpenClaw** 的名字经历了三次变更：

- 最初叫做 `ClawdBot`
- 后因与 `Claude` 名字过于相似，被指控侵权，遂改名为 `MoltBot`
- 但在改名过程中遭遇域名和社交账号被抢注，甚至出现同名加密货币割韭菜的情况
- **最终定名为：OpenClaw**

### 1.1 核心特点

| 特点                | 说明                                                                           |
| ------------------- | ------------------------------------------------------------------------------ |
| **真正的执行能力**  | 不仅能回答问题，还能实际操作你的电脑                                           |
| **24/7 全天候待命** | 在你睡觉时也能主动完成任务                                                     |
| **完全开源免费**    | 数据完全掌控在自己手中                                                         |
| **多平台支持**      | 国外支持 WhatsApp、Telegram、Discord、Slack、iMessage 等；国内支持飞书、钉钉等 |

---

## 二、开始安装 OpenClaw

首先得说明白：因为 OpenClaw 需要一个地方来部署，而部署在自己的电脑上是很不明智的。所以我选择了在我的远程 Linux 主机上部署（也就是工位上那一台机器了）。系统是 Ubuntu24.04 。通过 ssh 远程连接并部署。

### 2.1 执行一键安装命令

复制以下命令，粘贴到远程的 Linux 终端窗口中，按 `Enter` 执行：

```bash
curl -fsSL https://openclaw.ai/install.sh | bash
```

**安装过程会自动完成**：

- 检测系统环境
- 安装必要依赖（Node.js 等）
- 下载 OpenClaw 核心文件
- 配置环境变量
- 启动配置向导

---

## 三、初始配置向导

安装完成后，会自动进入配置向导（`openclaw onboard`）。

### 3.1 风险告知

这一步主要告知使用 OpenClaw 可能存在的风险。

- 按 **向左方向键 ←**，选择 `Yes`
- 按 `Enter` 回车确认

### 3.2 选择 QuickStart 模式

按照向导提示选择 QuickStart 模式以快速配置。

### 3.3 配置 AI 模型 API Key

OpenClaw 需要连接到大语言模型才能工作。OpenClaw 比较费 token，国外模型成本高，这里选择国内的**智谱 GLM 4.7**。也正好是因为我年前有买了智谱的包年的 coding plan 。

> 如果没有智谱的 API Key，点击官方地址注册获取：https://www.bigmodel.cn/glm-coding?ic=RBSKXMPNJP

输入自己的 API Key 后继续。

### 3.4 选择 AI 模型

这里选择默认的 **GLM 4.7**，这也是智谱当前的旗舰模型（我的 coding plan 没法体验到 GLM-5 😭）。

### 3.5 连接即时通讯平台

配置完 AI 模型后，OpenClaw 会询问要连接哪个通讯平台。

> OpenClaw 原生支持 WhatsApp、Telegram、Discord、Slack、iMessage 等海外平台。国内用户常用的飞书、钉钉等也已支持接入。

由于飞书配置较为复杂，这里先选择**跳过**，后续可通过（openclaw channels add）继续进行。

### 3.6 选择 Skills

选择：**No**，暂不配置，后续通过 UI 界面进行配置。

### 3.7 是否开启 Hooks

选择： **No**

操作步骤：

1. 先敲 **空格键**（表示选中当前项）
2. 再敲 **回车键** 确认

### 3.8 启动服务并打开 TUI 界面

因为是远程的 Linux 服务器，现在还没法打开 webui，所以暂时选择打开 TUI 测试是否能成功使用。

此时会自动打开一个 TUI 窗口来启动服务。

在 TUI 中发送一条测试消息，验证 OpenClaw 是否正常工作。如果能，告诉他你叫什么名字，他叫什么名字，就好了。然后按两次 ctrl+c 退出即可。

---

## 四、接入飞书机器人

这一步遇到问题可以参考官方文档：https://docs.openclaw.ai/zh-CN/channels/feishu

### 4.1 来到飞书开发者后台

**飞书开放平台地址**：https://open.feishu.cn

> 没有飞书账号的需要先注册账号

点击右上角进入 **开发者后台**。

### 4.2 创建应用

1. 点击创建应用
2. 填写应用信息
3. 创建自建应用

### 4.3 获取应用凭证

在应用管理页面，获取 **App ID** 和 **App Secret**，记下这两个值，后续配置需要使用。

### 4.4 给应用添加机器人

1. 在应用功能中添加机器人能力
2. 配置机器人基本信息

### 4.5 给应用配置权限

把即时通讯相关的权限全部开通（搜索 im:）：

- 获取群组信息
- 发送消息
- 接收消息
- 获取通讯录基本信息

### 4.6 创建版本并发布

1. 创建应用版本
2. 填写版本说明
3. 发布为在线版本
4. 来到飞书客户端进行审批

### 4.7 安装飞书插件

打开终端，输入以下命令安装飞书插件：

```bash
openclaw plugins install @openclaw/feishu
```

安装成功后，打开一个新的命令窗口，开始配置飞书插件：

```powershell
openclaw config
```

按照提示进行配置：

1. 选择渠道：Feishu
2. 选择配置链接
3. 输入飞书的 App ID 和 App Secret
4. 域名选择：中国的 feishu.cn
5. 接受群组聊天：Yes
6. 选择完成并继续

### 4.8 重启服务

重启 OpenClaw 服务使配置生效，控制台可以看到飞书插件已配置成功。

### 4.9 回到飞书后台设置事件回调

1. 进入事件管理
2. 选择 **使用长连接接收事件**
3. 添加接收消息事件
4. 给应用开通获取通讯录基本信息的权限
5. 重新发布版本（与前面步骤相同，发布为在线应用）

### 4.10 在飞书中与 OpenClaw 对话

来到飞书客户端或手机飞书 App：

1. 搜索并添加你的机器人
2. 发送消息测试
3. 你可以问机器人任何问题，或者让它执行任务

---

## 五、访问 Web 控制面板

配置完成后，使用 **openclaw dashboard --no-open**，会显示控制面板链接，格式类似：

```c
Control UI: http://127.0.0.1:18789%token=巴拉巴拉一大串
```

1. 复制完整链接
2. 在浏览器中打开
3. 即可看到可视化 UI 管理界面

但由于我是远程控制的，所以得加一步 SSH 端口转发到本机。这个端口转发链接在使用**openclaw dashboard --no-open**命令后会自动跳出来的。反正整个流程都挺简单的。

---

## 六、常用命令速查

| 命令                     | 功能             |
| ------------------------ | ---------------- |
| `openclaw onboard`       | 重新进入配置向导 |
| `openclaw status`        | 查看运行状态     |
| `openclaw health`        | 健康检查         |
| `openclaw gateway start` | 启动服务         |
| `openclaw gateway stop`  | 停止服务         |
| `openclaw update`        | 更新到最新版本   |
| `openclaw doctor`        | 诊断问题         |
| `openclaw uninstall`     | 卸载 OpenClaw    |

---

## 更新（2026-03-08）

当前 OpenClaw 的默认设置里，Web 功能等工具能力默认是关闭状态，需要手动修改 `openclaw.json`。

将其中的 `tools` 配置改为 `full`：

```json
{
  "tools": {
    "profile": "full"
  }
}
```

---

## 参考链接

- [OpenClaw 官网](https://openclaw.ai/)
- [飞书开放平台](https://open.feishu.cn)
- [手把手教你安装OpenClaw并接入飞书，让AI在聊天软件里帮你干活](https://mp.weixin.qq.com/s/JGd4u8g-Fti4sRcJcSiOLQ)
