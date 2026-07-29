---
title: "SSH 连接 WSL 与 Mac"
date: 2025-07-20T10:00:00.00+08:00
lang: zh
draft: false
description: "使用 ssh 连接 wsl 与 mac 系统，使得能够在 mac 上连接并训练模型"
---

[[toc]]

## 1 **同一局域网下**

> 同一局域网内从 Mac 远程连接到 Windows 上的 WSL2（Windows Subsystem for Linux）环境

### WSL2 中配置 SSH 服务

#### 修改apt清华镜像

> 修改为清华镜像方便接下来的安装过程，如果有🪜可以忽略此步

```bash
sudo sed -i "s@http://.*archive.ubuntu.com@https://mirrors.tuna.tsinghua.edu.cn@g" /etc/apt/sources.list
sudo sed -i "s@http://.*security.ubuntu.com@https://mirrors.tuna.tsinghua.edu.cn@g" /etc/apt/sources.list
sudo apt update && sudo apt upgrade -y
```

#### 安装 OpenSSH Server

在 WSL2 中打开终端，执行以下命令：

```bash
sudo apt update
sudo apt install openssh-server
```

#### 配置 SSH 服务

编辑 SSH 配置文件：

```bash
sudo vim /etc/ssh/sshd_config
```

确保以下行存在且未被注释（即没有 # 号）：

```bash
Port 2222
AddressFamily any
ListenAddress 0.0.0.0
PermitRootLogin yes
PasswordAuthentication yes
PubkeyAuthentication yes
```

#### 启动 SSH 服务

执行以下命令启动 SSH 服务：

```bash
sudo service ssh start
```

#### 配置开机自启

> 在每次启动 WSL 时自动启动 SSH 服务，需要在 WSL 的配置文件中添加启动命令。

### Windows 上设置 SSH 与端口转发

> 由于 WSL2 使用虚拟网络，默认情况下无法直接从局域网访问其服务。因此，需要在 Windows 上设置端口转发，将外部请求转发到 WSL2 的 SSH 服务。

#### 端口转发

- 获取 WSL2 的 IP 地址：

在 **PowerShell** 中执行以下命令：

```powershell
wsl hostname -I
```

> 记录输出的 IP 地址，假设为 120.120.120.120。

- 设置内部端口转发：

```powershell
netsh interface portproxy reset

netsh interface portproxy add v4tov4 listenport=2222 listenaddress=0.0.0.0 connectport=2222 connectaddress=120.120.120.120
```

### 在 Windows 上安装 OpenSSH server

通过 PowerShell 安装（管理员权限）：

```powershell
# 检查是否已安装 OpenSSH 客户端和服务器
Get-WindowsCapability -Online | Where-Object Name -like 'OpenSSH*'

# 安装 OpenSSH 服务器
Add-WindowsCapability -Online -Name OpenSSH.Server~~~~0.0.1.0
```

```powershell
# 如果失败，可以改用 DISM 命令
dism /online /Add-Capability /CapabilityName:OpenSSH.Server~~~~0.0.1.0
```

### 启动并配置 SSH 服务

```powershell
# 启动 SSH 服务
Start-Service sshd

# 设置 SSH 服务开机自启
Set-Service -Name sshd -StartupType 'Automatic'

# 检查服务状态
Get-Service sshd
```

### 配置防火墙（允许 SSH 端口 2222）

```powershell
# 允许 2222 端口
New-NetFirewallRule -Name "OpenSSH-Server" -DisplayName "OpenSSH Server (TCP 2222)" -Enabled True -Direction Inbound -Protocol TCP -Action Allow -LocalPort 2222
```

### 测试 SSH 连接

- 获取 Windows 主机的局域网 IP 地址：

```powershell
ipconfig
```

> 查找与当前连接的网络适配器对应的 IPv4 地址，假设为 192.168.1.100。

- 在 Mac 上使用 SSH 连接：

```bash
ssh <wsl_username>@192.168.1.100 -p 2222
```

> 将 <wsl_username> 替换为 WSL2 中的用户名。如果配置正确，应该能够成功连接到 WSL2 的终端

## 2 **非同一局域网**

### Windows 安装

```powershell
winget install tailscale
```

### macOS 安装

```bash
brew install tailscale
```

> Tailscale 上显示的 IP 地址即远程登录地址，其余配置方法与同一局域网内的方法相同。

## ⚠️ 免密登陆

```bash
# 生成密钥（如果还没有）
ssh-keygen -t ed25519

# 复制公钥到WSL
ssh-copy-id -p 2222 zoukai@IP
```

## 📨 自动脚本

```bat
@echo off
:: 启动WSL SSH服务
wsl -d Ubuntu -u root /etc/init.d/ssh start

:: 获取WSL2动态IP并设置端口转发
for /f "tokens=*" %%i in ('wsl hostname -I') do (
    netsh interface portproxy reset
    netsh interface portproxy add v4tov4 listenport=2222 listenaddress=0.0.0.0 connectport=2222 connectaddress=%%i
)

:: 放行防火墙（幂等操作）
powershell -command "New-NetFirewallRule -Name 'WSL2_SSH' -DisplayName 'WSL2 SSH' -Enabled True -Direction Inbound -Protocol TCP -Action Allow -LocalPort 2222 -ErrorAction SilentlyContinue"

echo 已启动SSH并设置端口转发，WSL IP: %errorlevel%
pause
```

## 3 **SSH 代理命令**

### 代理实例中的端口到本地

具体步骤为：

**Step.1** 在实例中启动您的服务（比如您的服务监听6006端口，下面以6006端口为例）

**Step.2** 在本地电脑的终端(cmd / powershell / terminal等)中执行代理命令：

```bash
ssh -CNg -L 6006:127.0.0.1:6006 root@123.125.240.150 -p 42151
```

其中 `root@123.125.240.150` 和 `42151` 分别是实例中SSH指令的访问地址与端口，请找到自己实例的ssh指令做相应替换。`6006:127.0.0.1:6006` 是指代理实例内6006端口到本地的6006端口。

注意：执行完这条ssh命令，没有任何日志是正常的，只要没有要求重新输入密码或错误退出。

Windows下的cmd/powershell如果一直提示密码错误，是因为无法粘贴，手动输入即可（正常不会显示正在输入的密码）。

**Step.3** 在本地浏览器中访问 `http://127.0.0.1:6006` 即可打开服务，注意这里的6006端口要和上述 `6006:127.0.0.1:6006` 中的端口保持一致。

### 代理本地端口到实例

```bash
# 上面代理实例中的端口到本地的Step.2中的命令：
ssh -CNg -L 6006:127.0.0.1:6006 root@123.125.240.150 -p 42151

# 只需将上面的命令修改参数-L为-R即代理本地端口到实例
ssh -CNg -R 6006:127.0.0.1:6006 root@123.125.240.150 -p 42151
```
