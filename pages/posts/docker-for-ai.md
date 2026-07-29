---
title: "Docker for AI 教程"
date: 2025-07-01T10:00:00.00+08:00
lang: zh
draft: false
description: "本文为 Docker 的初学者教程"
---

## 前言

随着云原生、AI 等技术的向前推进，容器技术逐渐成为 AI 领域的必备技能之一。本文档从零基础实现将代码打包 Docker 镜像、调试、提交仓库、提交云服务训练模型等流程。同样适用于初次接触 Docker 的初学者。

区别于开发，对于算法而言，仅需要掌握一部分基础命令达到自己的使用目的即可。因此此次简明教程面向算法和 AI 领域，帮助快速上手项目提交和远程服务器训练。

## 基本概念

> Docker 最重要的三个概念是：镜像（Image）、容器（Container）、仓库（Repository）。在这三个概念中，镜像是最重要的概念。

## 常用命令

### 拉取镜像

```bash
docker pull [选项] [Docker 镜像地址:标签]
```

例如：

```bash
docker pull hello-world:latest
```

### 运行镜像并创建容器

```bash
docker run hello-world
```

### 运行镜像并进入容器

```bash
docker run -it --rm ubuntu:18.04
```

> **参数说明：**
> - `-it`：这是两个参数，一个是 `-i`（交互式操作），一个是 `-t`（终端）。我们这里打算进入 bash 执行一些命令并查看返回结果，因此我们需要交互式终端。
> - `--rm`：这个参数是说容器退出后随之将其删除。默认情况下，为了排障需求，退出的容器并不会立即删除，除非手动 `docker rm`。我们这里只是随便执行个命令，看看结果，不需要排障和保留结果，因此使用 `--rm` 可以避免浪费空间。

### 查看本地镜像

```bash
docker images
```

### 查看运行中的容器

```bash
docker ps
```

### 查看所有容器

```bash
docker ps -a
```

### 进入运行中/后台运行的容器

```bash
docker exec -it [CONTAINER ID] /bin/bash
```

### 保存修改

```bash
docker commit [CONTAINER ID] registry.cn-shanghai.aliyuncs.com/test/pytorch:myversion
```

> **注意：** 通过 commit 的形式保存为一个新的镜像虽然也能直观地达到构建新镜像的目的，但是实际操作中，并不推荐这种形式。因为 commit 操作不仅会把有用的修改保存下来，对一些无关的修改也会保存下来（每一个命令行操作都会生成存储，如 `ls` 操作），就会导致镜像比较臃肿。其次，commit 操作属于黑箱操作，后续如果有什么问题维护起来会比较麻烦。建议 commit 仅作为保留现场的手段，然后通过修改 Dockerfile 构建镜像。

### 打 TAG

有时需要对临时版本或者节点版本做一个标记保留，打 TAG 标签非常好用，并不会额外占用空间：

```bash
docker tag registry.cn-shanghai.aliyuncs.com/test/pytorch:myversion my_tmp_version:0.1
```

### 推送镜像到仓库

```bash
docker push registry.cn-shanghai.aliyuncs.com/test/pytorch:myversion
```

### 使用 Dockerfile 构建镜像

**Dockerfile 示例：**

> **注意：** 一般文件名命名为 `Dockerfile`（无后缀名），如果命名为其他名字，构建时需要额外指定文件名。

```dockerfile
FROM nvidia/cuda:11.8.0-devel-ubuntu22.04

ARG DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y \
    git \
    curl \
    software-properties-common \
    && add-apt-repository ppa:deadsnakes/ppa \
    && apt install -y python3.10 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /workspace

COPY requirements.txt requirements.txt

RUN curl -sS https://bootstrap.pypa.io/get-pip.py | python3.10 \
    && python3.10 -m pip install -r requirements.txt \
    && python3.10 -m pip install numpy --pre torch --force-reinstall --index-url https://download.pytorch.org/whl/nightly/cu118

COPY . .

ENTRYPOINT [ "python3.10" ]
```

### 构建镜像

```bash
docker build -t registry.cn-shanghai.aliyuncs.com/target:test .
```

如要指定 Dockerfile：

```bash
docker build -f ./Dockerfile -t registry.cn-shanghai.aliyuncs.com/target:test .
```

### 删除镜像/容器

**删除镜像：**

```bash
docker rmi registry.cn-shanghai.aliyuncs.com/target:test
```

**删除容器：**

```bash
docker rm [CONTAINER ID]
```

如果容器还在运行，则会删除失败，应先结束掉容器：

```bash
docker kill [CONTAINER ID]
```

## 常规技巧

- **检查基础镜像软件源和 pip 源是否替换为国内源**：如果非国内源，后续每次构建镜像会比较浪费时间。

- **必备软件包可直接安装于基础镜像内**：以减少每次构建镜像时都要安装一遍的等待时间。

- **镜像面临调试问题时**：可交互式进入容器后直接调试修改，直到成功后退出再在 Dockerfile 中修改。

- **养成使用 Dockerfile 的习惯**：不要依赖于 commit。

- **每次镜像修改都给定新的版本号或标签**：方便区分版本管理，有意义的版本最好使用有含义的字符作为版本号，如：`first_submit`。
