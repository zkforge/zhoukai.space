---
title: " Linux 双系统安装"
author: Kai Zhou
pubDatetime: 2025-10-09T10:00:00.00+08:00
featured: false
draft: false
tags:
  - Linux
  - 系统
description: "安装 linux 双系统"
---

> 确保电脑已安装 Windows 系统

## 确定系统引导格式

首先需要确认电脑的引导格式是 UEFI + GPT 还是 BIOS + MBR。

**检查方法：**
- 打开 Windows 系统
- 按下 `Win + R` 键
- 输入 `msinfo32` 并运行
- 查看 "BIOS 模式" 一项

**结果判断：**
- 如果显示 "UEFI"：请使用本教程（UEFI + GPT 格式）
- 如果显示 "BIOS"：建议查找其他适用于 BIOS + MBR 格式的教程

## 准备工作

### 下载 Ubuntu 系统镜像

推荐从以下官方渠道下载：
- [Ubuntu 官方下载页面](https://cn.ubuntu.com/download)
- [清华大学开源镜像站](https://mirrors.tuna.tsinghua.edu.cn/)

建议下载 Ubuntu 24.04 桌面版本。(amd64,Desktop LiveDVD)

### 下载并安装 UltraISO

使用 UltraISO（软碟通）制作启动盘：
- 下载 UltraISO 软件
- 安装并运行
- 插入 U 盘（建议 8GB 以上）
- 使用 UltraISO 将 Ubuntu 镜像写入 U 盘

### 磁盘分区规划

为 Ubuntu 分配足够的磁盘空间：

**分区步骤：**
1. 右键点击"此电脑" → "管理" → "磁盘管理"
2. 选择要压缩的卷（通常是 C 盘）
3. 右键点击 → "压缩卷"
4. 输入要压缩的空间大小
5. 确认后会显示为"未分配"空间

> 如果以前安装过双系统，可能需要使用 EasyUEFI 或 DiskGenius 处理启动项。

### 系统设置

**关闭 Windows 快速启动：**
- 控制面板 → 电源选项 → "选择电源按钮的功能"
- 点击"更改当前不可用的设置"
- 取消勾选"启用快速启动"

**关闭 BIOS 安全启动：**
- 重启电脑进入 BIOS 设置
- 找到 Security Boot 选项并禁用
- 保存设置并重启

> 不同品牌主板的 BIOS 设置可能略有差异，请根据具体主板型号进行调整。

## 安装 Ubuntu 系统

### 从 U 盘启动

1. 将制作好的 Ubuntu 启动盘插入电脑
2. 重启电脑并进入 BIOS/UEFI 设置
3. 设置 U 盘为第一启动项
4. 保存设置并重启

### Ubuntu 安装过程

1. 选择 "Install Ubuntu" 开始安装
2. 选择语言（推荐选择中文简体）
3. 选择安装类型：
   - **选择"其他选项"进行手动分区**
   - 不要选择"与 Windows 共存"或"抹除整个磁盘"

### 磁盘分区设置

在之前预留的未分配空间上创建以下分区：

**推荐分区方案：**
- `/boot` 分区：512MB - 1GB（EFI 分区）
- `swap` 交换空间：根据内存大小确定，看下表
- `/` 根分区：至少 20GB
- `/home` 分区：剩余空间（用于存储个人文件）

**Swap 大小建议：**
| 物理内存 | 不需要休眠 | 需要休眠 | 最大值 |
|---------|-----------|----------|--------|
| 4GB     | 2GB       | 6GB      | 8GB    |
| 8GB     | 3GB       | 11GB     | 16GB   |
| 16GB    | 4GB       | 20GB     | 32GB   |
| 32GB    | 6GB       | 38GB     | 64GB   |

### 完成安装

1. 设置用户名和密码
2. 等待安装过程完成
3. 重启系统

## 常见问题解决

### 重启后无法进入 Ubuntu（自动进入 Windows）

这是最常见的问题，解决方法如下：

**步骤 1：使用 Boot Repair 工具**
```bash
sudo add-apt-repository ppa:yannubuntu/boot-repair
sudo apt-get update
sudo apt-get install -y boot-repair && boot-repair
```

**步骤 2：在 Windows 中修复引导**
以管理员权限运行 cmd，执行：
```cmd
bcdedit /set {bootmgr} path \EFI\ubuntu\shimx64.efi
```

**步骤 3：重启验证**
重启后应该能看到包含 Ubuntu 和 Windows 选项的 GRUB 菜单。

### 双系统时间不一致问题

在 Ubuntu 终端中运行以下命令并重启：
```bash
timedatectl set-local-rtc 1 --adjust-system-clock
```

### 安装 ubuntu 时黑屏

1. 显卡驱动问题，更换 ubuntu 版本，例如 40 系显卡不要使用 22.04，更换 24.04
2. 也可以在 grub 页面选择第二个安装选项（除 try or install ubuntu）或者 按 e 添加参数

## 其余个人配置记录
### 必要资源

- 主题（[theme](https://github.com/vinceliuice/WhiteSur-gtk-theme)）
- 图标（[icon](https://github.com/vinceliuice/WhiteSur-icon-theme)）
- 指针（[cursor](https://github.com/vinceliuice/McMojave-cursors)）
- 壁纸（[wallpaper](https://github.com/vinceliuice/WhiteSur-wallpapers)）
- GRUB 启动页面
- ulauncher
- 下载安装 nvidia 显卡驱动

### 必要插件

- blur my shell
- user themes
- arc menu
- removable drive menu
- just perfect
- tweaks
- compiz alike magic lamp effect
- workspace indicator
- coverflow alt-tab
- clipboard indicator

### 命令行输入

- 打开dock 栏图标（点击隐藏）功能

```bash
gsettings set org.gnome.shell.extensions.dash-to-dock click-action 'minimize'
```

> grub 默认启动项修改/etc/default/grub
> 修改后必须要 sudo grub-update

> http://47.76.135.200/api/v1/client/subscribe?token=57ce18339271c390eb57ce3af52ec938