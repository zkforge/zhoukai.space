---
title: "Hugging Face 国内镜像源配置指南"
author: Kai Zhou
pubDatetime: 2024-05-14T20:10:00.00+08:00
featured: false
draft: false
tags:
  - AI
  - Hugging Face
  - 镜像源
  - 配置
description: "详细介绍如何配置 Hugging Face 的国内镜像源，包括CLI工具安装、环境变量设置、源码修改等多种方法"
---

> 在使用 Hugging Face 下载模型时，由于网络原因可能会遇到下载速度慢或连接失败的问题。本文介绍几种配置国内镜像源的方法。

## 方法一：安装 CLI 工具并设置环境变量（推荐-简单）

### 1. 安装 huggingface_hub

```bash
pip install -U huggingface_hub
```

### 2. 设置环境变量

```bash
export HF_ENDPOINT=https://hf-mirror.com
```

```bash
export HF_HOME="模型，数据集保存路径"
```
> 注意：这种配置方式只在当前 shell 会话中有效，如果你希望这个环境变量在每次启动终端时都生效，可以将其添加到你的用户配置文件中（修改 `~/.bashrc` 或 `~/.zshrc`）

```bash
echo $HF_ENDPOINT
echo $HF_HOME
```
> 检查是否生效
### 3. 下载模型示例

```bash
huggingface-cli download \
    --local-dir-use-symlinks False \
    microsoft/deberta-v3-large \
    --local-dir /root/autodl-tmp/deberta_model \
    --cache-dir /root/autodl-tmp/deberta_cache
```

## 方法二：修改源码配置（推荐-较麻烦）

### 修改 constants.py 文件

找到你的 Python 环境中的 `huggingface_hub` 包位置：
> 通常在以下路径之一
```bash
/miniconda3/envs/环境名称/lib/python3.12/site-packages/huggingface_hub/constants.py
```
```bash
/usr/local/lib/python3.x/site-packages/huggingface_hub/constants.py
```

修改 `constants.py` 文件中的默认端点：

```python
_HF_DEFAULT_ENDPOINT = "https://hf-mirror.com"
```

## 方法三：在代码中动态设置

在 Python 代码开头添加环境变量设置：

```python
import os
os.environ['HF_ENDPOINT'] = 'https://hf-mirror.com'
from huggingface_hub import hf_hub_download
```

## 可用的国内镜像源

- **官方镜像**: `https://hf-mirror.com`
- **Alpha 镜像**: `https://alpha.hf-mirror.com/`

## 注意事项

1. 设置环境变量后需要重启终端或重新加载环境
2. 修改源码后需要重启 Python 解释器
3. 建议优先使用方法一（环境变量），因为它不会影响其他项目
4. 如果遇到权限问题，请确保有相应目录的写入权限

## 验证配置

配置完成后，可以通过以下命令验证是否生效：

```bash
huggingface-cli download --help
```

如果配置成功，下载速度应该会有明显提升。
