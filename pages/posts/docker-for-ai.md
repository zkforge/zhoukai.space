---
title: "Docker 常用命令与项目迁移实战"
date: 2025-07-01T10:00:00.00+08:00
lang: zh
draft: true
description: "整理 Docker 日常使用中的镜像、容器、Compose、数据卷与排障命令，并演示如何通过 U 盘迁移一个 Docker 项目。"
---

[[toc]]

## 前言

Docker 可以把应用及其运行环境打包成镜像，再用容器启动。对日常开发、部署和 AI 实验来说，不需要一开始掌握 Docker 的全部细节，先熟悉一条完整链路就足够了：

```text
拉取或构建镜像 → 创建容器 → 查看日志并调试 → 停止和清理
                         ↓
              保存镜像、配置和数据 → 在另一台服务器恢复
```

本文以 Docker Engine 和 Docker Compose 为基础，集中整理最常用的命令。文中的 `<IMAGE>`、`<CONTAINER>`、`<VOLUME>` 等内容是占位符，实际执行时要替换成自己的名称。

## 一、先理解几个概念

| 概念           | 作用                         | 常见命令                      |
| -------------- | ---------------------------- | ----------------------------- |
| 镜像 Image     | 应用运行所需文件的只读模板   | `docker pull`、`docker build` |
| 容器 Container | 镜像启动后的运行实例         | `docker run`、`docker exec`   |
| 仓库 Registry  | 保存和分发镜像的地方         | `docker login`、`docker push` |
| 数据卷 Volume  | 独立于容器生命周期保存数据   | `docker volume`               |
| 网络 Network   | 让容器之间或容器与外部通信   | `docker network`              |
| Compose 项目   | 用一个 YAML 文件管理多个服务 | `docker compose`              |

一个重要原则是：镜像负责“环境和代码”，容器负责“运行状态”，数据卷负责“持久化数据”。删除容器通常不会删除命名数据卷，但直接把容器删掉也不应该被当作数据备份方案。

### 从第一个容器开始

如果这是第一次使用 Docker，可以先运行官方的测试镜像：

```bash
docker run hello-world
```

这条命令会在本地没有镜像时自动拉取 `hello-world`，创建容器，运行默认程序并输出一段说明。程序执行完后容器就会退出；退出不等于出错，可以用下面的命令查看它：

```bash
docker ps       # 只看正在运行的容器
docker ps -a    # 包括已经退出的容器
```

`docker run` 的基本形式是：

```bash
docker run [OPTIONS] IMAGE [COMMAND] [ARG...]
```

例如，下面的命令会启动一个 Ubuntu 容器并进入它的 Bash：

```bash
docker run -it ubuntu:22.04 bash
```

其中 `-i` 保持标准输入，`-t` 分配一个终端；合起来的 `-it` 适合交互式操作。退出容器后，如果没有加 `--rm`，容器仍会保留，可以通过 `docker start` 再次启动或用 `docker rm` 删除：

```bash
docker run -it --rm ubuntu:22.04 bash
```

对于只用于试验的容器，推荐加上 `--rm`，这样主进程退出后容器会自动清理；需要保留日志和现场时则不要加它。

### 临时调试与正式保存

调试阶段可以先进入运行中的容器，直接验证依赖、路径和启动命令：

```bash
docker exec -it <CONTAINER> /bin/bash
```

如果镜像里没有 Bash，则改用：

```bash
docker exec -it <CONTAINER> /bin/sh
```

在容器里确认修改有效后，应把修改回写到 Dockerfile、项目源码或 Compose 配置，再重新构建镜像：

```bash
docker build -t <IMAGE>:<TAG> .
```

也可以用 `docker commit` 暂时保存排障现场：

```bash
docker commit <CONTAINER> <IMAGE>:<TAG>
```

但不建议把 `commit` 当作日常构建方式。它会把容器当前文件系统做成一个缺少构建步骤记录的新镜像，难以复现，也容易把调试过程中产生的无关文件一起保存。正式版本应以 Dockerfile 为准。

```bash
docker version
docker info
docker compose version
```

遇到权限或连接问题时，先看这几条命令的报错。`docker version` 能同时看到客户端和服务端信息；如果服务端信息无法返回，通常说明 Docker daemon 没有启动，或者当前用户没有访问 Docker 的权限。

查看命令帮助：

```bash
docker --help
docker <COMMAND> --help
```

例如：

```bash
docker run --help
docker compose up --help
```

## 三、镜像相关命令

### 拉取镜像

```bash
docker pull <IMAGE>:<TAG>
```

例如：

```bash
docker pull ubuntu:22.04
docker pull nginx:latest
```

建议尽量写清楚版本标签，不要在生产环境完全依赖 `latest`。标签只是一个可变名称；如果需要更严格的复现，还可以记录镜像摘要（digest）。

### 查看镜像

```bash
docker image ls
docker image ls --no-trunc
docker image inspect <IMAGE>:<TAG>
docker image history <IMAGE>:<TAG>
```

- `docker image ls`：查看本机已有镜像。
- `docker image inspect`：查看镜像的详细配置、架构和环境变量。
- `docker image history`：查看镜像由哪些层构成，以及 Dockerfile 的构建历史。

只想查看镜像占用的空间，可以使用：

```bash
docker system df
```

### 给镜像打标签

```bash
docker tag <SOURCE_IMAGE>:<SOURCE_TAG> <TARGET_IMAGE>:<TARGET_TAG>
```

例如把本地镜像标记为待推送到仓库的名称：

```bash
docker tag my-app:latest registry.example.com/team/my-app:1.0.0
```

`docker tag` 不会复制一份镜像，通常只是增加一个指向同一镜像的标签。

### 构建镜像

在包含 `Dockerfile` 的项目目录执行：

```bash
docker build -t <IMAGE>:<TAG> .
```

指定其他 Dockerfile：

```bash
docker build -f Dockerfile.prod -t <IMAGE>:<TAG> .
```

一个简单的 Python 项目可以使用类似的 Dockerfile：

```dockerfile
FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["python", "app.py"]
```

同时建议创建 `.dockerignore`，避免把 Git 历史、虚拟环境、依赖缓存和密钥打进构建上下文：

```text
.git
.venv
node_modules
__pycache__
*.pyc
.env
```

### 登录、推送和删除镜像

```bash
docker login registry.example.com
docker push registry.example.com/team/my-app:1.0.0
docker image rm <IMAGE>:<TAG>
```

如果镜像仍被容器使用，删除可能会失败。先确认容器和镜像的关系，再决定是否停止并删除容器。

## 四、容器生命周期命令

### 创建并运行容器

后台运行一个 Nginx 容器，并把服务器的 8080 端口映射到容器的 80 端口：

```bash
docker run --name web -d -p 8080:80 nginx:latest
```

参数含义：

- `--name web`：给容器一个容易记忆的名字。
- `-d`：后台运行（detached）。
- `-p 8080:80`：把宿主机端口映射到容器端口，格式是 `宿主机端口:容器端口`。

临时进入一个 Ubuntu 容器：

```bash
docker run --name shell-test -it --rm ubuntu:22.04 bash
```

这里的 `--rm` 表示容器退出后自动删除，适合临时测试；需要保留排障现场时不要加这个参数。

### 查看容器

```bash
docker ps
docker ps -a
docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}'
```

- `docker ps`：查看正在运行的容器。
- `docker ps -a`：查看包括已退出在内的所有容器。

### 启停和重启容器

```bash
docker start <CONTAINER>
docker stop <CONTAINER>
docker restart <CONTAINER>
docker kill <CONTAINER>
```

一般先使用 `docker stop`，它会给应用一个正常退出的机会；`docker kill` 会直接终止进程，更适合容器卡死或紧急处理。

### 查看日志

```bash
docker logs <CONTAINER>
docker logs --tail 100 <CONTAINER>
docker logs -f --tail 100 <CONTAINER>
```

`-f` 会持续跟随新的日志输出。排查“容器启动后马上退出”时，通常先运行：

```bash
docker ps -a
docker logs <CONTAINER>
```

### 进入正在运行的容器

```bash
docker exec -it <CONTAINER> bash
```

有些精简镜像没有 `bash`，这时使用：

```bash
docker exec -it <CONTAINER> sh
```

如果只想在容器内执行一条命令：

```bash
docker exec <CONTAINER> python --version
```

### 查看配置、资源和文件

```bash
docker inspect <CONTAINER>
docker stats <CONTAINER>
docker top <CONTAINER>
docker port <CONTAINER>
docker cp <CONTAINER>:/app/logs ./logs
docker cp ./config.yaml <CONTAINER>:/app/config.yaml
```

- `docker inspect`：查看容器的启动参数、网络、挂载和环境变量。
- `docker stats`：实时查看 CPU、内存、网络和磁盘 I/O。
- `docker top`：查看容器内的进程。
- `docker port`：查看容器端口映射到宿主机后的端口。
- `docker cp`：在容器和宿主机之间复制文件；容器正在运行或已停止都可以使用。

### 删除容器

```bash
docker rm <CONTAINER>
docker rm -f <CONTAINER>
```

普通 `docker rm` 不能删除正在运行的容器；`docker rm -f` 会强制停止并删除它。删除前先确认重要数据是否位于 volume 或宿主机目录中。

## 五、Dockerfile 与 Compose 的使用流程

### Dockerfile 的基本流程

```bash
docker build -t my-app:dev .
docker run --name my-app-dev -d -p 8000:8000 my-app:dev
docker logs -f my-app-dev
```

开发时修改 Dockerfile 后，需要重新构建镜像。若怀疑缓存造成问题，可以在确认确实需要时使用：

```bash
docker build --no-cache -t my-app:dev .
```

不要把 `--no-cache` 当作日常默认选项，它会放弃构建缓存，通常会明显增加构建时间。

### Compose 的基本流程

当项目包含多个服务，例如应用、数据库和 Redis 时，可以使用 `compose.yaml` 统一管理：

```yaml
services:
  app:
    build: .
    ports:
      - '8000:8000'
    depends_on:
      - db

  db:
    image: postgres:16
    environment:
      POSTGRES_PASSWORD: change-me
```

常用命令：

```bash
# 创建或更新服务，并在后台运行
docker compose up -d

# 修改 Dockerfile 或源码后重新构建并启动
docker compose up -d --build

# 查看服务状态
docker compose ps

# 查看所有服务日志
docker compose logs -f

# 只查看某个服务的最近日志
docker compose logs --tail 100 -f app

# 进入某个服务的容器
docker compose exec app sh

# 重启、停止服务
docker compose restart app
docker compose stop

# 停止并删除 Compose 创建的容器和网络
docker compose down
```

`docker compose down` 默认不会删除命名 volume。下面这个命令会连同 Compose 管理的数据卷一起删除，执行前必须确认数据已经备份：

```bash
docker compose down -v
```

检查 Compose 文件能否被解析，但不启动服务：

```bash
docker compose config -q
```

查看 Compose 项目实际引用的镜像和数据卷：

```bash
docker compose config --images
docker compose config --volumes
```

### Volume 和网络的基础命令

命名 volume 适合保存数据库、上传文件等不应该随着容器删除的数据：

```bash
docker volume create app-data
docker volume ls
docker volume inspect app-data
docker run -d --name web -v app-data:/usr/share/nginx/html nginx:latest
```

删除 volume 前要确认没有唯一数据：

```bash
docker volume rm app-data
```

查看和创建 Docker 网络：

```bash
docker network ls
docker network inspect <NETWORK>
docker network create app-net
docker network connect app-net <CONTAINER>
docker network disconnect app-net <CONTAINER>
```

同一个自定义网络中的容器通常可以通过服务名或容器名互相访问，而不应该把数据库容器的内部地址写死在配置中。

## 六、镜像、容器和数据迁移的区别

这些命令经常被混在一起，但用途不同：

| 命令            | 作用                            | 是否包含 volume 数据    |
| --------------- | ------------------------------- | ----------------------- |
| `docker save`   | 把一个或多个镜像导出成 tar 归档 | 否                      |
| `docker load`   | 从 tar 归档导入镜像             | 否                      |
| `docker export` | 导出某个容器的文件系统          | 否，不包含挂载的 volume |
| `docker import` | 把文件系统归档导入成一个新镜像  | 否                      |
| `docker cp`     | 在容器和宿主机之间复制文件      | 只复制指定文件          |

迁移一个可复现的项目，通常应该保存“项目文件 + Compose 配置 + 镜像 + 数据”，而不是只执行 `docker export`。容器内临时执行的修改也不建议长期依赖，应该回写到 Dockerfile、项目源码或数据卷中。

## 七、通过 U 盘迁移 Docker 项目

下面是一套适合“原服务器 → U 盘 → 新服务器”的流程。假设项目目录叫 `my-app`，实际路径请替换成自己的路径。

### 1. 在原服务器盘点迁移内容

如果项目使用 Compose，先确认服务、镜像和 volume：

```bash
cd /path/to/my-app
docker compose config --images
docker compose config --volumes
docker compose ps
```

如果不是 Compose 项目，可以查看正在运行的容器和本地镜像：

```bash
docker ps -a
docker image ls
docker volume ls
```

不要把 `docker compose config` 的完整输出文件随意发给别人，因为变量解析后的配置可能包含环境变量或敏感信息。迁移时只保留必要的 Compose 文件，并在新服务器上重新填写密钥。

### 2. 打包项目文件

在项目目录的上一级执行：

```bash
tar -czf my-app-files.tar.gz \
  --exclude='my-app/.git' \
  --exclude='my-app/node_modules' \
  --exclude='my-app/.venv' \
  --exclude='my-app/.env' \
  my-app/
```

这里排除了通常可以重新生成的依赖和缓存，也排除了可能包含密钥的 `.env`。如果项目依赖 `.env` 才能启动，可以在受控、加密的介质中单独备份它，或者在新服务器上根据 `.env.example` 重新创建。

如果项目很小，也可以不打包，直接复制整个目录；但 `tar.gz` 更容易确认文件是否完整，也能保留隐藏文件。

### 3. 导出 Docker 镜像

先根据 `docker compose config --images` 的结果，列出项目实际使用的镜像：

```bash
docker save -o my-app-images.tar \
  <IMAGE_1>:<TAG> \
  <IMAGE_2>:<TAG>
```

镜像较大时，可以边导出边压缩，减少 U 盘占用：

```bash
docker save <IMAGE_1>:<TAG> <IMAGE_2>:<TAG> \
  | gzip > my-app-images.tar.gz
```

这里的 `-o` 就是“把输出写入指定文件”。`docker save` 保存的是镜像及其层，不会保存容器的运行状态、环境变量、端口映射和 volume 数据，所以 Compose 文件仍然需要一起迁移。

### 4. 备份数据卷或数据库

先查看 volume：

```bash
docker volume ls
docker volume inspect <VOLUME>
```

对于 PostgreSQL、MySQL 等数据库，优先使用数据库自己的导出工具，因为这样更容易得到一致的备份。例如 PostgreSQL：

```bash
docker compose exec -T db \
  pg_dump -U <DB_USER> <DB_NAME> > db-backup.sql
```

`-T` 表示不分配伪终端，重定向到文件时需要它。数据库服务名 `db`、用户名和数据库名都要按实际 Compose 文件修改。

对于普通文件型 volume，可以使用临时容器打包：

```bash
docker run --rm \
  --mount source=<VOLUME>,target=/data,readonly \
  --mount type=bind,source="$(pwd)",target=/backup \
  alpine \
  tar czf /backup/<VOLUME>.tar.gz -C /data .
```

恢复到新服务器时：

```bash
docker volume create <VOLUME>

docker run --rm \
  --mount source=<VOLUME>,target=/data \
  --mount type=bind,source="$(pwd)",target=/backup \
  alpine \
  tar xzf /backup/<VOLUME>.tar.gz -C /data
```

备份数据库或 volume 前，最好先暂停会写入数据的服务；否则备份可能只包含某个时间点的部分文件。生产数据库应优先使用数据库原生备份，并在恢复后实际执行一次校验。

### 5. 把文件复制到 U 盘

macOS 上，U 盘通常挂载在 `/Volumes/<U盘名称>`：

下面的文件按项目实际情况复制；如果项目没有数据库备份或使用未压缩镜像，就删除对应的命令行。

```bash
mkdir -p "/Volumes/<U盘名称>/my-app-migration"
cp my-app-files.tar.gz "/Volumes/<U盘名称>/my-app-migration/"
cp my-app-images.tar.gz "/Volumes/<U盘名称>/my-app-migration/"
cp db-backup.sql "/Volumes/<U盘名称>/my-app-migration/"
```

如果导出的是未压缩镜像文件，就把文件名换成 `my-app-images.tar`。复制完成后，可以检查大小：

```bash
ls -lh "/Volumes/<U盘名称>/my-app-migration/"
sync
```

然后安全推出 U 盘，再插入新服务器。Linux 服务器上的挂载目录可能是 `/media/<用户名>/<U盘名称>` 或 `/run/media/<用户名>/<U盘名称>`，不要盲猜路径，可以先执行：

```bash
lsblk -f
df -h
```

### 6. 在新服务器恢复

把 U 盘中的归档复制到新服务器的工作目录：

```bash
mkdir -p /path/to/migration
cp /media/<用户名>/<U盘名称>/my-app-migration/* /path/to/migration/
cd /path/to/migration
```

解压项目文件并导入镜像：

```bash
tar -xzf my-app-files.tar.gz

gzip -dc my-app-images.tar.gz | docker load
```

如果镜像是未压缩的 tar 文件，则使用：

```bash
docker load -i my-app-images.tar
```

确认镜像已经存在：

```bash
docker image ls
```

进入项目目录，准备环境变量：

```bash
cd my-app
cp .env.example .env
# 根据新服务器的域名、端口、数据库密码等修改 .env
```

最后启动服务：

```bash
docker compose up -d --no-build
docker compose ps
docker compose logs --tail 100
```

`--no-build` 适合已经把所需镜像导入新服务器，并且 Compose 文件引用了这些镜像的情况。如果项目需要在新服务器重新构建，则改用：

```bash
docker compose up -d --build
```

若恢复了数据库或 volume，要在启动对应服务前后按实际项目完成导入，并确认容器内的挂载路径与原服务器一致。

### 7. 做一次迁移后的验证

至少检查以下几项：

```bash
docker compose ps
docker compose logs --tail 100

docker system df
```

然后从服务器本机访问实际端口，例如：

```bash
curl -I http://127.0.0.1:8000
```

还应确认：

- 服务状态是 `running` 或 `healthy`，而不是反复重启。
- 应用可以访问数据库、缓存等依赖服务。
- 上传文件、模型文件或数据库记录仍然存在。
- 防火墙、安全组、反向代理和域名解析已经指向新服务器。
- 新服务器和原服务器的 CPU 架构兼容，例如 `amd64` 与 `arm64` 不要混用未经验证的镜像。

## 八、清理空间与常见排障

### 查看 Docker 占用

```bash
docker system df
docker system df -v
```

### 清理无用对象

只清理悬空镜像：

```bash
docker image prune
```

清理已经停止的容器：

```bash
docker container prune
```

清理未使用的 volume：

```bash
docker volume prune
```

综合清理：

```bash
docker system prune
```

`docker system prune` 可能删除已停止的容器、未使用的网络、悬空镜像和构建缓存。带上 `-a` 会进一步删除没有被容器使用的镜像；带上 `--volumes` 还会扩大清理范围。数据卷和生产服务器上不要未经确认执行下面这类命令：

```bash
docker system prune -a --volumes
```

### 一个实用的排障顺序

容器启动失败时，可以按下面顺序检查：

```bash
docker ps -a
docker logs <CONTAINER>
docker inspect <CONTAINER>
docker stats <CONTAINER>
```

如果是 Compose 项目：

```bash
docker compose config -q
docker compose ps
docker compose logs --tail 200 <SERVICE>
```

常见原因包括：端口已被占用、环境变量缺失、挂载路径错误、镜像架构不匹配、数据库还没有准备好，以及容器内程序只监听了 `127.0.0.1` 而没有监听 `0.0.0.0`。

## 九、AI 和 GPU 项目的额外注意事项

如果项目需要 NVIDIA GPU，镜像本身只是用户态环境，宿主机还需要正确安装显卡驱动和 NVIDIA Container Toolkit。确认环境后，运行容器时通常会显式请求 GPU：

```bash
docker run --gpus all -it --rm <IMAGE>:<TAG> nvidia-smi
```

训练数据、模型权重和实验输出通常不适合直接打进镜像。更合理的方式是使用宿主机目录或命名 volume 挂载：

```bash
docker run --gpus all --rm \
  --mount type=bind,source=/path/to/datasets,target=/data,readonly \
  --mount type=bind,source=/path/to/outputs,target=/outputs \
  <IMAGE>:<TAG>
```

这样迁移时，镜像、代码和大文件可以分别管理；也不会因为一次小的代码修改而重复传输数十 GB 的模型权重。

## 十、最后记住这几条

1. 看容器：`docker ps -a`。
2. 看原因：`docker logs <CONTAINER>`。
3. 进容器：`docker exec -it <CONTAINER> sh`。
4. 看配置：`docker inspect <CONTAINER>`。
5. 构建镜像：`docker build -t <IMAGE>:<TAG> .`。
6. 管理多服务：`docker compose up -d`。
7. 迁移镜像：`docker save -o image.tar <IMAGE>:<TAG>`，新服务器用 `docker load -i image.tar`。
8. 迁移项目：不要漏掉 Compose 配置、环境变量、volume、数据库和端口配置。
9. 清理之前：先确认容器、镜像和 volume 里没有唯一的数据。
10. 能写进 Dockerfile 和 Compose 的内容，就不要只依赖手动进入容器后的临时修改。

## 参考资料

- [Docker CLI reference](https://docs.docker.com/reference/cli/docker/)
- [docker image save](https://docs.docker.com/reference/cli/docker/image/save/)
- [docker container cp](https://docs.docker.com/reference/cli/docker/container/cp/)
- [docker compose up](https://docs.docker.com/reference/cli/docker/compose/up/)
- [Docker volumes：备份、恢复和迁移](https://docs.docker.com/engine/storage/volumes/#back-up-restore-or-migrate-data-volumes)
