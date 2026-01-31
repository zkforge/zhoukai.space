---
title: "国内连接校内Ubuntu服务器：花生壳内网穿透完整实操教程"
author: Kai Zhou
pubDatetime: 2026-01-28T10:00:00+08:00
featured: true
draft: false
tags:
  - Linux
  - 内网穿透
  - SSH
  - 网络配置
  - Ubuntu
description: "详细介绍使用贝锐花生壳实现国内设备连接校内Ubuntu服务器的完整流程，包括安装、配置、端口映射和问题排查"
---

> 主要是因为 Tailscale 的 DERP 服务器都在国外，因此使用起来延迟特别高。所以考虑使用国内的方案。不过这个花生壳方案也有缺陷，太抠了😤，每个月只有 1 GB的流量，根本不够用。稍微高强度四五天就用完了。

## 目录

## 一、背景

校内Ubuntu服务器通常处于内网环境（无公网IP、端口受校园网限制），国内校外设备直接连接难度大。传统方案（如Tailscale、反向SSH隧道）需依赖海外VPS，延迟较高（80-120ms）。而贝锐花生壳依托国内BGP多线节点，针对校园网做了专项优化，延迟可低至30-80ms，且操作极简，无需配置公网VPS。通过花生壳远程连接后就可以通过 SSH 的 Jump 功能做中继连接到校内服务器了。本文主要介绍的是：本地 -> 自己的校内设备 -> 校内服务器的整个流程的前半部分。

## 二、前置准备

1. 贝锐账号：注册地址 [https://www.oray.com/](https://www.oray.com/)
2. 校内设备：运行Ubuntu 24.04的服务器，需能访问外网（可通过`ping baidu.com`验证）；
3. 国内设备：Windows/macOS/Linux均可，需安装SSH工具（系统自带终端即可，图形化工具可选Xshell/Putty）。

## 三、核心实操步骤

### 步骤1：校内Ubuntu安装花生壳客户端

登录校内Ubuntu终端，执行以下命令完成安装（适配64位系统）：

```bash
# 1. 下载花生壳客户端安装包
wget https://down.oray.com/hsk/linux/phddns_5.2.0_amd64.deb

# 2. 安装客户端（若提示依赖问题，执行sudo apt -f install修复）
sudo dpkg -i phddns_5.2.0_amd64.deb

# 3. 查看安装状态与核心信息（SN码是设备绑定关键）
phddns status
```

#### 安装成功判断标准：

- 终端输出 `Successful installation of Phddns Service` 与 `Runstatus: ONLINE`；
- 显示完整SN码（示例：`oray240248e65529`）；
- 注意：Ubuntu 24.04默认未预装`netstat`，可能出现`netstat: 未找到命令`警告，不影响核心功能，可通过`sudo apt install net-tools -y`安装工具消除警告。

### 步骤2：贝锐控制台绑定校内设备

花生壳的"外网访问地址"需与校内设备绑定才有效，具体操作：

1. 登录花生壳控制台：[https://console.hsk.oray.com/](https://console.hsk.oray.com/)；
2. 左侧导航栏点击【设备管理】→【添加设备】；
3. 输入步骤1中获取的SN码（如`oray240248e65529`），点击"确认绑定"；
4. 绑定成功后，设备列表会显示该设备，登录后，状态为"在线"（与校内终端`Runstatus: ONLINE`对应）。

### 步骤3：配置SSH端口映射

映射的核心是"将校内Ubuntu的SSH端口（默认为22）映射到花生壳国内节点的外网地址"：

1. 点击页面【内网穿透-> 添加映射】，按以下规则填写：

| 配置字段 | 填写内容                         | 说明                                             |
| -------- | -------------------------------- | ------------------------------------------------ |
| 映射名称 | Ubuntu-SSH                       | 自定义，方便后续识别                             |
| 内网主机 | 内网IP                           | 需填Ubuntu内网IP                                 |
| 内网端口 | 22                               | SSH默认端口，固定值（若修改过SSH端口则填对应值） |
| 映射协议 | TCP                              | SSH基于TCP协议，必选此项                         |
| 外网域名 | 账号下免费域名（如xxx.oicp.net） | 贝锐自动分配，下拉框选择即可                     |
| 外网端口 | 动态端口（免费）                 | 免费版无需自定义，系统自动分配（如27817）        |

2. 填写完成后点击【确定】，映射列表会生成一条"在线"状态的记录，同时显示完整外网地址（格式：`域名:端口`，示例：`外网地址:27817`）。

### 步骤4：国内设备连接校内Ubuntu

根据国内设备系统，执行对应SSH命令即可，核心格式：`ssh -p 外网端口 校内Ubuntu用户名@外网域名`

#### 场景1：Windows（PowerShell）

```powershell
# 示例（替换为你的外网地址、端口和用户名）
ssh -p 27817 zoukai@外网地址
```

#### 场景2：Linux/macOS（终端）

```bash
# 命令与Windows一致
ssh -p 27817 zoukai@外网地址
```

#### 场景3：图形化工具（Xshell）

1. 新建会话 → 【主机】填外网域名（外网地址）；
2. 【端口号】填外网端口（27817）；
3. 点击【连接】，输入校内Ubuntu用户名（如zoukai）和密码，即可成功连接。

## 四、问题排查

### 问题1：不知道校内Ubuntu的内网IP？

若需查看内网IP，可执行：

```bash
# 简化命令（直接输出内网IP）
hostname -I
# 或查看详细网卡信息
ip addr show
```

### 问题2：花生壳客户端启动失败（提示"Offline"）

解决：重启花生壳服务并设置开机自启

```bash
# 重启服务
sudo /etc/init.d/phddns restart
# 设置开机自启
phddns enable
```
