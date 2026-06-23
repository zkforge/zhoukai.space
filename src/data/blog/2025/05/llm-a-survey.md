---
title: "大语言模型综述：GPT、LLaMA 和 PaLM 模型的发展"
author: Kai Zhou
pubDatetime: 2025-05-28T16:00:00.00+08:00
featured: false
draft: false
tags:
  - LLM
  - 笔记
  - AI
description: "本文为论文《Large language models: a survey》的阅读笔记"
---
> 本文是对论文《Large language models: a survey》的阅读笔记和个人理解。这篇综述详细回顾了一些最具代表性的大语言模型，包括三个流行的大语言模型家族（GPT、LLaMA、PaLM），讨论了它们的特点、贡献和局限性，并概述了用于构建和增强大语言模型的相关技术。


## 如何构建大模型

### 数据清理

数据清理是大模型训练的基础，主要包括：
- 数据过滤：去除噪声、异常值、不平衡数据、含歧义文本等。
- 文本预处理：如去除停用词、特殊符号等。
- 删除重复值，保证数据多样性和有效性。

### 分词化（Tokenization）

分词化是将文本转化为模型可处理的 token 序列的过程。常用方法有 BPE、WordPiece、SentencePiece 等。

### 位置嵌入（Positional Embedding）

- 绝对位置嵌入（APE）
- 相对位置嵌入（RPE）
- 旋转位置嵌入（RoPE）
- 相对位置偏差（RPB）

### LLM 架构

大模型的架构设计直接影响其能力和效率。主流架构包括 Transformer 及其变体。

### 模型预训练

- 混合专家（MoE）等技术提升模型参数规模和推理效率。

### 微调和指令调优（Fine-tuning、Instruction-tuning）

- 监督微调（SFT）：利用标注数据对模型进行有针对性的优化。

### 模型对齐（Alignment）

- 基于人类反馈的强化学习（RLHF）
- 基于 AI 反馈的强化学习（RLAIF）
- 直接偏好优化（DPO）、KTO 等

### 解码策略

- 贪婪搜索（Greedy Search）
- 光束搜索（Beam Search）
- Top-k 采样、Top-p 采样等

### 推理、压缩与量化微调

- 零冗余优化器（ZeRO）
- 感受加权键值（RWKV）
- 低秩分解（LoRA）
- 知识蒸馏、量化等

### 幻觉问题与评估

- 统计指标：ROUGE、BLEU 等评估文本相似性，PARENT、Knowledge F1 等用于结构化知识。
- 基于模型的指标：IE、QA、NLI、忠诚度分类等。
- 人工评估：主观判断模型输出的真实性和相关性。

> 例如，更大的模型和较低的 temperature 设置通常表现更好。

## 如何使用大模型——提示词工程

### 思维链（Chain of Thought, CoT）
- Zero-Shot CoT
- Manual CoT
- Automatic CoT

### 思维树（Tree of Thought, ToT）

### 自洽性（Self-Consistency）

### 反思（Reflection）

### 专家提示（Expert Prompting）

### 链（Chains）

### 规则（Rails）

### 自动提示工程（APE）

## 如何扩展大模型——RAG

> 检索增强生成（Retrieval-Augmented Generation, RAG）
> 
> 自动多步推理和工具使用（ART）

### Agent 中的提示词工程
- ReWOO、ReAct、DERA 等

## 大模型 LLMs 的评估数据集

### 基本任务的数据集：语言建模、理解、生成
- Natural Questions（QA 数据集）
- MMLU
- MBPP（Python 代码生成）
- HumanEval（Python 代码生成）
- APPS（Python 代码生成）
- WikiSQL（SQL 代码生成）
- TriviaQA（QA 数据集）
- RACE（英语阅读理解）
- SQuAD（斯坦福问答数据集）
- BoolQ（是/否问答）
- MultiRC（阅读理解）

### 指令跟随、CoT 推理等新兴能力的数据集
- GSM8K（数学推理）
- MATH（数学竞赛题）

## 三种类型的架构

### Encoder-only
- BERT

### Decoder-only
- GPT-1
- GPT-2

**Decoder-Only**：这类模型在每个阶段，对于任何单词，注意力层只能访问该单词之前的内容，属于自回归模型。

### Encoder-Decoder
- T5
- BART