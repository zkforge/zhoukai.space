---
title: "在 Slurm 集群上用 gvitop 查看计算节点显存占用"
author: Kai Zhou
pubDatetime: 2026-04-21T22:46:00+08:00
featured: false
draft: false
tags:
  - Slurm
  - GPU
  - Linux
  - 集群
  - Shell
description: "记录一个在 Slurm 集群中快速进入正在运行的作业并用 nvitop 查看计算节点 GPU 显存占用的小函数。"
---

## 目录

> 在 Slurm 集群上跑训练任务时，登录节点通常看不到计算节点的 GPU 状态。本文记录一个小的 shell 函数：自动找到当前正在运行的 job，通过 `srun --jobid --overlap --pty` 附着到对应计算节点，然后打开 `nvitop` 查看显存占用。

## 一、问题背景

在 Slurm 集群上，用户通常先登录到 login node，再通过 `sbatch` 或 `srun` 把任务提交到计算节点。真正占用 GPU 的进程运行在 compute node 上，而不是 login node 上。

所以直接在登录节点执行：

```bash
nvitop
```

往往看不到正在训练的进程。更合理的方式是：先找到自己的 Slurm job，再进入这个 job 所在的计算节点查看 GPU。

## 二、核心函数

可以把下面这段函数写入 `~/.bashrc` 或 `~/.zshrc`：

```bash
gvitop () {
  jobid="$1"

  # 自动找最近 job
  if [ -z "$jobid" ]; then
    jobid=$(squeue -u "$USER" -t R -h -o %A | head -n 1)
    [ -z "$jobid" ] && echo "No running job" && return 1
    echo "Using latest job: $jobid"
  fi

  # 尝试直接运行
  srun --jobid="$jobid" --overlap --pty nvitop 2>/dev/null

  # fallback
  if [ $? -ne 0 ]; then
    echo "Fallback to bash + nvitop"
    srun --jobid="$jobid" --overlap --pty bash -c "nvitop"
  fi
}
```

重新加载配置：

```bash
source ~/.bashrc
# 或者
source ~/.zshrc
```

## 三、使用方式

如果当前只有一个正在运行的任务，直接执行：

```bash
gvitop
```

如果有多个任务，建议显式指定 job id：

```bash
gvitop 123456
```

可以先用下面的命令查看自己的运行中任务：

```bash
squeue -u "$USER" -t R
```

## 四、为什么需要 --overlap

核心命令是：

```bash
srun --jobid="$jobid" --overlap --pty nvitop
```

`--jobid` 表示复用已有 job allocation，`--pty` 表示启动一个交互式终端，`--overlap` 则允许这个新的 step 和已有任务共享 allocation 中的资源。

这里运行的是 `nvitop`，目标是观察状态，而不是再启动一个训练任务。因此使用 `--overlap` 更符合这个场景。

## 五、fallback 的意义

有些集群环境中，直接执行：

```bash
srun --jobid="$jobid" --overlap --pty nvitop
```

可能会因为 `PATH`、shell 初始化或集群配置问题失败。所以函数里加了 fallback：

```bash
srun --jobid="$jobid" --overlap --pty bash -c "nvitop"
```

先启动 `bash`，再由 `bash` 执行 `nvitop`，通常能复用更多用户侧的 shell 环境。

## 六、常见问题

如果输出：

```text
No running job
```

说明当前用户没有处于 `R` 状态的 Slurm job。可以用下面的命令确认：

```bash
squeue -u "$USER"
```

如果提示 `nvitop: command not found`，说明计算节点环境里没有安装 `nvitop`，或者当前 shell 没有激活对应环境。可以进一步确认：

```bash
which nvitop
```

如果使用 Conda 环境，也可以把 fallback 改成：

```bash
srun --jobid="$jobid" --overlap --pty bash -lc "conda activate your-env && nvitop"
```

## 七、总结

这个函数解决的是 Slurm 集群上的一个具体问题：训练任务跑在计算节点，但用户日常登录的是 login node，直接运行 `nvitop` 往往看不到真正的 GPU 占用。

日常使用时只需要：

```bash
gvitop
# 或者
gvitop 123456
```

它不复杂，但能减少在集群上排查显存占用、确认训练进程状态时的重复操作。
