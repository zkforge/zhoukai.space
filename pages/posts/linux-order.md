---
title: "Linux 命令指南大全"
date: 2025-06-26T10:00:00.00+08:00
lang: zh
draft: false
description: "Linux命令指南，涵盖文件操作、进程管理、网络工具、开发环境配置等实用技能"
---

[[toc]]

> 本文整理了从基础到进阶的Linux命令，用于查漏补缺。

## 基础文件操作

### 文件浏览与导航

```bash
# 查看当前目录
pwd

# 列出文件（详细格式）
ls -la

# 查看文件大小（人类可读格式）
ls -lh

# 按时间排序
ls -lt

# 按大小排序
ls -lS

# 递归查看目录结构
tree
# 如果没有tree命令，使用：
find . -type d | sed -e "s/[^-][^\/]*\//  |/g" -e "s/|\([^ ]\)/|-\1/"
```

### 文件操作

```bash
# 复制文件
cp source_file destination_file

# 复制目录
cp -r source_dir destination_dir

# 移动/重命名文件
mv old_name new_name

# 删除文件
rm filename

# 删除目录
rm -rf directory_name

# 创建目录
mkdir -p path/to/new/directory

# 查看文件内容
cat filename
less filename
head -n 10 filename  # 查看前10行
tail -n 10 filename  # 查看后10行
tail -f filename     # 实时查看文件变化
```

### 文件搜索

```bash
# 查找文件
find /path/to/search -name "*.py"

# 查找包含特定内容的文件
grep -r "search_term" /path/to/search

# 忽略大小写搜索
grep -ri "search_term" /path/to/search

# 显示行号
grep -n "search_term" filename

# 使用正则表达式
grep -E "pattern" filename
```

## 文本处理与分析

### 文本处理工具

```bash
# 统计文件行数、单词数、字符数
wc filename

# 排序文件
sort filename
sort -n filename  # 数值排序
sort -r filename  # 逆序排序

# 去重
uniq filename
sort filename | uniq

# 提取特定列
cut -d',' -f1,3 filename  # 提取第1和第3列（逗号分隔）
awk '{print $1, $3}' filename  # 提取第1和第3列（空格分隔）

# 文本替换
sed 's/old_text/new_text/g' filename
sed -i 's/old_text/new_text/g' filename  # 直接修改文件
```

### 数据分析常用命令

```bash
# 查看文件前几行
head -20 large_file.csv

# 查看文件后几行
tail -20 large_file.csv

# 统计文件大小
du -h filename
du -sh directory_name

# 查看文件类型
file filename

# 查看文件编码
file -i filename
```

## 进程管理与监控

### 进程查看

```bash
# 查看所有进程
ps aux

# 查看特定进程
ps aux | grep process_name

# 实时查看进程
top
htop  # 更友好的界面

# 查看进程树
pstree
pstree -p  # 显示进程ID
```

### 进程控制

```bash
# 杀死进程
kill process_id
kill -9 process_id  # 强制杀死

# 根据进程名杀死
pkill process_name
pkill -f "python script.py"

# 暂停进程
kill -STOP process_id

# 恢复进程
kill -CONT process_id
```

### 后台运行

```bash
# 后台运行命令
nohup command > output.log 2>&1 &

# 查看后台任务
jobs

# 将后台任务调到前台
fg %job_number

# 继续后台运行
bg %job_number
```

## 网络工具

### 网络连接测试

```bash
# 测试网络连通性
ping google.com

# 查看网络路由
traceroute google.com

# 查看网络接口
ifconfig
ip addr

# 查看网络连接
netstat -tuln
ss -tuln
```

### 文件传输

```bash
# 下载文件
wget url
curl -O url

# 安全复制文件
scp local_file user@remote_host:/path/to/destination
scp -r local_dir user@remote_host:/path/to/destination

# 同步文件
rsync -avz source/ destination/
rsync -avz --delete source/ destination/  # 删除目标中源没有的文件
```

## 开发环境配置

### 包管理

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install package_name
sudo apt remove package_name

# CentOS/RHEL
sudo yum install package_name
sudo yum remove package_name

# 查看已安装的包
dpkg -l | grep package_name
rpm -qa | grep package_name
```

### Python环境管理

```bash
# 创建虚拟环境
python -m venv myenv
python3 -m venv myenv

# 激活虚拟环境
source myenv/bin/activate

# 退出虚拟环境
deactivate

# 安装包
pip install package_name
pip install -r requirements.txt

# 查看已安装的包
pip list
pip freeze > requirements.txt
```

### Git版本控制

```bash
# 初始化仓库
git init

# 克隆仓库
git clone repository_url

# 查看状态
git status

# 添加文件
git add filename
git add .

# 提交更改
git commit -m "commit message"

# 查看提交历史
git log
git log --oneline

# 切换分支
git checkout branch_name
git checkout -b new_branch_name

# 拉取更新
git pull origin branch_name

# 推送更改
git push origin branch_name
```

## AI开发相关工具

### GPU监控

```bash
# 查看GPU使用情况
nvidia-smi

# 实时监控GPU
watch -n 1 nvidia-smi

# 查看GPU进程
nvidia-smi pmon

# 查看GPU内存使用
nvidia-smi --query-gpu=memory.used,memory.total --format=csv
```

### 容器管理

```bash
# 查看运行中的容器
docker ps

# 查看所有容器
docker ps -a

# 运行容器
docker run -it image_name

# 停止容器
docker stop container_id

# 删除容器
docker rm container_id

# 查看镜像
docker images

# 构建镜像
docker build -t image_name .
```

### 环境变量管理

```bash
# 设置环境变量
export VARIABLE_NAME=value

# 查看环境变量
echo $VARIABLE_NAME
env | grep VARIABLE_NAME

# 永久设置环境变量
echo 'export VARIABLE_NAME=value' >> ~/.bashrc
source ~/.bashrc
```

## 系统监控与性能分析

### 系统资源监控

```bash
# 查看系统负载
uptime

# 查看内存使用
free -h

# 查看磁盘使用
df -h

# 查看磁盘IO
iostat

# 查看CPU使用率
mpstat

# 系统性能监控
sar -u 1 5  # CPU使用率，每秒一次，共5次
```

### 日志查看

```bash
# 查看系统日志
journalctl

# 查看特定服务的日志
journalctl -u service_name

# 实时查看日志
journalctl -f

# 查看最近的日志
journalctl -n 100

# 查看特定时间段的日志
journalctl --since "2024-01-01" --until "2024-01-02"
```

## 实用技巧

### 别名设置

```bash
# 设置常用命令别名
alias ll='ls -la'
alias la='ls -A'
alias l='ls -CF'
alias ..='cd ..'
alias ...='cd ../..'
alias grep='grep --color=auto'

# 永久保存别名
echo 'alias ll="ls -la"' >> ~/.bashrc
source ~/.bashrc
```

### 历史命令

```bash
# 查看命令历史
history

# 搜索历史命令
history | grep search_term

# 执行历史命令
!number  # 执行第number条命令
!!       # 执行上一条命令
!$       # 使用上一条命令的最后一个参数
```

### 管道和重定向

```bash
# 管道：将前一个命令的输出作为后一个命令的输入
command1 | command2

# 重定向输出
command > output_file
command >> output_file  # 追加

# 重定向输入
command < input_file

# 重定向错误输出
command 2> error_file
command 2>&1 output_file  # 将错误输出也重定向到文件
```

### 脚本编写基础

```bash
#!/bin/bash
# 这是一个简单的bash脚本示例

# 设置变量
DATASET_PATH="/path/to/dataset"
MODEL_PATH="/path/to/model"

# 检查目录是否存在
if [ ! -d "$DATASET_PATH" ]; then
    echo "Dataset directory does not exist!"
    exit 1
fi

# 运行Python脚本
python train.py --data_path "$DATASET_PATH" --model_path "$MODEL_PATH"

# 检查命令是否成功
if [ $? -eq 0 ]; then
    echo "Training completed successfully!"
else
    echo "Training failed!"
    exit 1
fi
```

## 总结

掌握这些Linux命令将大大提高你在AI研究中的工作效率。建议：

1. **循序渐进**：从基础命令开始，逐步掌握更复杂的操作
2. **实践为主**：多在实际项目中使用这些命令
3. **建立习惯**：将常用操作设置为别名或脚本
4. **持续学习**：Linux命令众多，根据项目需求不断学习新的工具

记住，命令行虽然初期学习曲线较陡，但一旦掌握，将大大提升你的开发和研究效率。在AI领域，很多工具和框架都优先支持命令行操作，熟练掌握Linux命令是成为优秀AI研究者的重要基础。

## 推荐资源

- [Linux命令大全](https://www.runoob.com/linux/linux-command-manual.html)
- [Bash脚本教程](https://www.runoob.com/linux/linux-shell.html)
- [Docker官方文档](https://docs.docker.com/)
- [Git官方文档](https://git-scm.com/doc)
