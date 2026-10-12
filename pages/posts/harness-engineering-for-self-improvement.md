---
title: "Harness 工程与自我改进"
date: 2026-07-04T00:00:00+08:00
lang: zh
draft: false
description: "Lilian Weng《Harness Engineering for Self-Improvement》的中文全文翻译：把 harness 当作可优化对象，梳理设计模式、上下文工程、工作流设计、自我改进、演化搜索与权重联合优化，以及通往完整 RSI 的七大瓶颈。"
---

[[toc]]

> 本文是 Lilian Weng《[Harness Engineering for Self-Improvement](https://lilianweng.github.io/posts/2026-07-04-harness/)》（Lil'Log, Jul 2026）的中文全文翻译。译文中的第一人称指原作者。原文所有图片均保留原始链接。

**递归自我改进（recursive self-improvement，RSI）** 这个概念可以追溯到 [I. J. Good (1965)](https://philpapers.org/rec/GOOSCT)，他当时把“超智能机器”定义为一个能在所有智力活动上超越人类、并设计出更好的机器来改进自身的系统。[Yudkowsky (2008)](https://www.lesswrong.com/posts/JBadX7rwdcRFzGuju/recursive-self-improvement) 用“递归自我改进”这个词来描述一个具体的反馈回路：AI 用当前的智能去改进产生智能的认知机制。

在现代 AI 中，这个反馈回路可能意味着模型直接重写自身权重；更广义地说，也可以是模型改进 _训练管线_ 和 _部署系统_，进而产生更强的后继模型，使其在具有经济价值的任务上取得更好的表现。前沿实验室的研究已经表明，AI 研发正在显著提速（[Anthropic](https://www.anthropic.com/institute/recursive-self-improvement)；[OpenAI](https://openai.com/index/how-agents-are-transforming-work/)）。

我特意强调 _“部署系统”_，是因为连接基座模型与真实世界情境的这一层，似乎与模型本身的智能水平同等重要；后者指的是模型刚完成预训练时，通过评测体现出的能力。Harness 是 AI 部署的重要组件，Claude Code、Codex 这类成功的编程智能体（coding agent）产品就体现了这一点。所谓 **harness**，就是围绕基座模型构建的系统：它编排执行过程，决定模型如何思考与规划、如何调用工具并采取行动、如何感知和管理上下文、如何存储产物，以及如何评测结果。

本文聚焦 harness 工程相关研究，以及它如何推动 RSI。近期大量关于自动化研究（auto-research）、自我改进智能体和演化式程序搜索的工作，都可以围绕这个问题组织起来。模型自博弈（self-play）、合成数据、测试时训练（test-time training），以及更广泛的持续学习（continual learning）研究，同样契合 RSI 的愿景（例如 [Yuan et al. 2024](https://arxiv.org/abs/2401.10020)、[Chen et al. 2024](https://arxiv.org/abs/2401.01335)、[Zhao et al. 2025](https://arxiv.org/abs/2505.03335)、[Choi et al. 2026](https://openreview.net/forum?id=lTbBFAoPSA)），但它们不是本文的重点。

## Harness 设计模式

和[早期的智能体框架](https://lilianweng.github.io/posts/2023-06-23-agent/)相比——那时我们把它概括为“智能体 = LLM + 记忆 + 工具 + 规划 + 行动”——harness 工程额外包含了 _工作流（workflow）设计（例如循环机制设计）、评测、权限控制，以及持久化状态管理_。它不再只是提示词模板，而是更接近运行时和软件系统设计：模型如何观察、行动、记忆、自查和改进。

设计应有意保持简单、通用，以获得泛化能力；也很可能需要借鉴现有的软件工程实践，从而利用模型在预训练中获得的知识。操作系统与 harness 之间也有很强的相似性。与操作系统一样，harness 应该封装复杂的逻辑，同时对外保持简单的接口。同时，配置、工具接口和其他协议可能会逐渐在业界走向标准化。

### 模式 1：Workflow 自动化

定义一个模型可以在其中操作、测试和迭代的工作流，是实现自动化的关键设计。Karpathy 的 autoresearch 仓库（<https://github.com/karpathy/autoresearch>）就是构建这类工作流的一个简洁示例。常见工作流遵循一个目标导向的循环：规划、执行、观察/测试、改进，然后再次执行，_直到_ 目标达成。这个过程也可能主动向用户发起询问，以澄清任务要求或执行偏好。

![简化后的 Codex 智能体循环：智能体调用工具，工具返回结果会影响模型的下一轮生成。（图片来源：OpenAI 的 Codex 智能体文章）](https://lilianweng.github.io/posts/2026-07-04-harness/openai-agent-loop.png)

这张工作流图还强调了一点：模型会分析自己的轨迹和失败案例，然后通过“智能体运行时（agent runtime）”不断推进任务，而不是依赖静态的提示词模板。

### 模式 2：把文件系统当作持久化记忆

长时程（long-horizon）智能体系统中，一个反复出现的模式是：以简单的机制管理丰富的状态和产物。Harness 不应该把整个工作流和所有日志都塞进上下文；相反，它应该把持久状态放在文件里。在智能体的长时程运行（rollout）中，实验日志、代码 diff、论文摘要、错误跟踪记录和历史运行轨迹这类产物，往往会增长到远超模型训练时的上下文窗口长度。

学会读、写、编辑文件系统（通常通过 `bash` 命令）是 LLM 的基础能力，因此用文件这种简单形式来管理持久记忆，天然受益于基座模型能力的提升。

### 模式 3：Sub-agent 与后台任务

Harness 可以派生多个子智能体并行执行，并监控后台任务。当主智能体需要同时探索多个假设、并发跑实验，或者把相互隔离的子任务委派出去而不污染主上下文时，这一点很有用。接下来父智能体需要一个轻量的进程管理器：启动任务、检查日志、取消失败的运行，并把结果合并回主智能体线程。

这里的关键设计选择，是让并行变得显式且可检查。如果子智能体的输出只存在于一段临时对话上下文里，它们很快就会失去时效性，也难以再被访问；而如果它们被保存为文件、日志和状态记录，模型就能在中断之后恢复，并对自己的执行历史做推理。

### 案例研究：Coding Agent Harness

主流编程智能体的核心接口已在 Claude Code、Codex、OpenCode 及 Cursor 风格的智能体之间趋于一致。它们通常采用这样的循环：

![编程智能体的 harness 循环](https://lilianweng.github.io/posts/2026-07-04-harness/coding-harness-loop.png)

有了这一组工具，编程智能体就能在给定仓库中开展开发和调试，就像人类开发者配备 IDE 一样。

（这不是一份完整清单，仅作演示。有兴趣可以读[这份资料](https://github.com/yasasbanukaofficial/claude-code)。）

| 分组       | 工具定义                                                                                                                                                                                         |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 文件系统   | - 文件发现：`glob`、`grep`、`ls`<br>- 文件读取：`read`、`read_many`<br>- 文件修改：`write`（写入整个新文件）；`edit`（字符串精确匹配替换）；`multi_edit`；`apply_patch`（应用结构化 patch/diff） |
| Shell 执行 | 运行命令：`bash`、`PowerShell`                                                                                                                                                                   |
| IO         | `lsp`，以及 `git_status`、`git_diff`、`git_commit` 这类 git 工具                                                                                                                                 |
| 外部上下文 | MCP 工具、Skills                                                                                                                                                                                 |
| 网络搜索   | `web_search`、`web_fetch`、浏览器工具                                                                                                                                                            |
| 产物       | 读取文档、图片；生成 HTML、图片                                                                                                                                                                  |
| 后台进程   | 例如：`CronCreate`、`CronDelete`、`CronList`                                                                                                                                                     |
| Agent 委派 | 例如：`spawn_agent`、`resume_agent`、`wait_agent`、`list_agents`、`close_agent`、`interrupt_agent` 等                                                                                            |

### Harness 层 vs 核心智力？

很难预测 RSI 的未来会在多大程度上依赖 harness 工程，但近期路径不太可能从模型直接重写自己的权重开始。我对近期可行路径的预测是：

1. Harness 工程会向元方法论（meta-methodology）的方向演化（也就是说，改进的是“得到更好答案的机制”，而不只是答案本身）。Harness 系统自身成为优化目标，启发式规则更少，通用机制更多。
2. 反过来，成熟的 harness 让模型自我改进循环具备自动化研究的能力，而更聪明的模型又能防止 harness 过度工程化，让整个系统保持可持续。

最终，很多 harness 层面的改进确实有可能被 _内化_ 为模型的核心行为，但与外部上下文和工具的接口应该会保留下来。在[提示词工程](https://lilianweng.github.io/posts/2023-03-15-prompt-engineering/)上我们已经见过这个模式更温和的版本：随着指令微调和模型推理能力提升，手工提示技巧不再处于核心位置，但 _明确目标、约束、上下文和评测方式的需求并没有消失_。

## Harness 优化

在 harness 系统中，被优化的对象大致沿着这样一条线演进：指令[提示词](https://lilianweng.github.io/posts/2023-03-15-prompt-engineering/) → 结构化上下文 → 工作流 → harness 代码 → 优化器代码。随着模型变得更聪明、更强，优化目标会变得更复杂，方法也会变得更通用。

### Context 工程

随着智能体任务的持续时间显著增长，如果只是把所有工具响应和模型生成内容不断追加到上下文中，上下文很快就会失控。上下文管理这一层的作用，是为 LLM 构造更结构化、更简洁的上下文，并管理持久状态。毫无疑问，长上下文研究会继续取得进展，但在当下，模型在长上下文中的智能表现和上下文工程有时是交织在一起的。

**Agentic Context Engineering**（ACE；[Zhang et al. 2025](https://arxiv.org/abs/2510.04618)）把上下文视为一份不断演化的操作手册（playbook），而不是一段越来越长的提示词。它用三个组件来维护一份由条目组成的上下文操作手册，每个条目都带有标识符和描述。

1. _生成器（Generator）_：参照这些条目，产出任务轨迹。
2. _反思器（Reflector）_：从成功和失败的轨迹中提炼洞见。
3. _整理器（Curator）_：以逐条增量更新的方式维护结构化上下文。

![Agentic Context Engineering（ACE）的框架。（图片来源：Zhang et al. 2025）](https://lilianweng.github.io/posts/2026-07-04-harness/ace.png)

为了防止迭代重写过程中出现上下文坍缩（context collapse）和过度简化偏差（brevity bias），ACE 的一个关键设计选择是：整理器不会重写整段提示词，而是以 `(identifier, description)` 的形式输出一组结构化条目，再通过确定性逻辑把这些条目合并进结构化的上下文日志。上下文条目会定期被精炼和去重。

ACE 能从运行中学习洞见，这让我们朝着能够自主管理的记忆迈进了一步，但更新规则和整体工作流仍然是手工设计的。为了走向更自我改进的循环，**Meta Context Engineering**（MCE；[Ye et al. 2026](https://arxiv.org/abs/2601.21557)）把 _机制_（如何管理上下文）和 _产物内容_（上下文里放什么）分离开来，在元优化层演化技能，在基础层优化上下文。

一个 MCE 技能（skill）$s \in \mathcal{S}$ 定义了一个上下文函数 $c_s = (\rho_s, F_s)$，把输入 $x$ 映射为上下文 $c = F_s(x; \rho_s)$，其中：

- $\rho_s = \{\rho_1, \dots, \rho_m\}$ 是静态组件（提示词、知识库、代码库）。
- $F_s = \{F_1, \dots, F_k\}$ 是动态算子（搜索、选择、过滤、格式化）。

双层优化要解决的问题是：在训练数据上，给定技能 $s$ 找出最佳上下文 $c_s^*$；而外层循环则找出在验证集上表现最好的最优技能：

$$
\begin{aligned}
\text{Inner: } c_s^{*} &= \arg\max_{c_s} J_{\text{train}}(c_s; s) \\
\text{Outer: } s^{*} &= \arg\max_{s \in \mathcal{S}} J_{\text{val}}(c_s^{*})
\end{aligned}
$$

技能数据库记录了此前技能、上下文函数和评测指标的历史 $\mathcal{H}_{k-1} = \{(s_i, c_i, J_i^{\text{train}}, J_i^{\text{val}})\}_{i=1}^{k-1}$。给定任务 $\tau$，元层智能体会对历史技能执行[交叉（crossover）](<https://en.wikipedia.org/wiki/Crossover_(evolutionary_algorithm)>)操作，产生新技能：$s_k = \operatorname{crossover}(\tau, \mathcal{H}_{k-1})$。

接着，基础层的上下文工程智能体执行技能 $s_k$，并在当前技能的引导下，从运行反馈 $\mathcal{R}_k$ 中学习上下文函数：$c_k = \operatorname{engineer}(\tau, s_k; c_{k-1}^*, \mathcal{R}_k)$。

![Meta Context Engineering（MCE）框架：元层进行技能演化，搜索上下文管理机制；基础层优化任务上下文。（图片来源：Ye et al. 2026）](https://lilianweng.github.io/posts/2026-07-04-harness/mce.png)

与 ACE 不同，MCE 不强制规定上下文应该如何组织的启发式规则。它用 _自由形式的技能_ 来存储任务中最重要的知识，并让技能和以技能为条件的上下文一起迭代演化。在实现上，上下文函数 $c$ 被实例化为某个专用目录下的一组文件，其中既有静态部分（`skill.md`），也有动态部分（上下文和数据运行轨迹）。元层和基础层的优化都在智能体编程环境里用一套标准工具集执行：

$$
\mathcal{T} = \{\texttt{Read}, \texttt{Write}, \texttt{Edit}, \texttt{Bash}, \texttt{Glob}, \texttt{Grep}, \texttt{TodoWrite}\}
$$

**Meta-Harness**（[Lee et al. 2026](https://arxiv.org/abs/2603.28052)）又往深处走了一层：被优化的对象是 _代码_，而这段代码决定并优化“哪些信息应该被存储、检索和呈现给模型”。名字里的 “Meta-” 意味着它是一个用来优化 harness 的 harness。

![Meta-Harness 的外层循环优化算法。（图片来源：Lee et al. 2026）](https://lilianweng.github.io/posts/2026-07-04-harness/meta-harness-outer-loop.png)

负责提出新 harness 的提案生成器（proposer）本身就是一个编程智能体，最终输出是位于帕累托前沿（Pareto frontier）的一组 harness 候选。

- 整个执行历史都可以通过文件系统访问，因此编程智能体会用 `grep` 或 `cat` 这类命令去翻阅，而不是把全部内容一股脑塞进单个提示词上下文。
- 提出的 harness 以文件系统中的字典结构表示，包含它自己的源代码、分数、运行轨迹和状态更新。
- meta-harness 循环不断生成新 harness，只保留符合条件的候选。

![Meta-Harness 的性能表现：（左）少量迭代下的文本分类；（右）TerminalBench-2。注意 TerminalBench-2 实验中的搜索是从 Terminus-KIRA 和 Terminus-2 这两个非常强的 harness 初始化的。（图片来源：Lee et al. 2026）](https://lilianweng.github.io/posts/2026-07-04-harness/meta-harness.png)

不过，最重要的启示已经很清楚：一旦 harness 设计变成一个可执行的搜索空间，一个强大的编程智能体就能利用和人类工程师相同的设计空间。

### Workflow 设计

Harness 工程中的工作流设计可以由领域专家手工完成。以自动化研究为例，已经有多种框架被提出并验证。**AI Scientist** 系统（[Lu et al. 2026](https://www.nature.com/articles/s41586-026-10265-5)）搭建了一条流水线：提出研究想法、编写代码、运行实验、分析结果、撰写论文，并执行同行评审。[Meng et al. (2026)](https://arxiv.org/abs/2605.26340) 把可验证性作为 **ScientistOne** 的核心设计约束：每一个论断（引用、数值、方法、结论）都必须能追溯到证据来源，并通过证据链（Chain-of-Evidence）检查进行审计。

![AI Scientist 流水线：想法生成、实验、论文写作与评审。（图片来源：Lu et al. 2026）](https://lilianweng.github.io/posts/2026-07-04-harness/ai-scientist.png)

**Autodata** 智能体（[Kulikov et al. 2026](https://arxiv.org/abs/2606.25996)）被设计成一名数据科学家，用于生成训练和评测数据。主智能体管理一个提出问题的 _挑战者（challenger）_、一个 _弱求解器（weak solver）_、一个 _强求解器（strong solver）_，以及一个 _验证器／裁判（verifier/judge）_，目标是合成出难度“刚刚好”的数据——也就是说，强求解器能够解答，而弱求解器会失败。

在 Autodata 中，挑战者的提示词会根据求解器和验证器的反馈迭代更新。这里的局限在于：合成出的任务被用于微调弱求解器，而非强求解器。如果这个循环无法迭代地改进强模型，那它更像是针对一个生成出来的提示词分布做间接蒸馏，与 RSI 的联系也就弱得多。

![Autodata 围绕挑战者、求解器和验证器设计的智能体工作流，用于生成合成训练和评测数据。（图片来源：Kulikov et al. 2026）](https://lilianweng.github.io/posts/2026-07-04-harness/autodata.png)

工作流的设计空间 _极其庞大_。很自然地，我们可以把工作流设计当成一个搜索问题，因此应该能通过算法而不只是手工方式找到好的解。沿着这个方向，**Automated Design of Agentic Systems**（ADAS；[Hu et al. 2025](https://arxiv.org/abs/2408.08435)）把智能体设计本身形式化为一个优化问题，即“元智能体搜索（meta-agent search）”：由一个元智能体提出新的智能体工作流设计。

1. 初始化一个智能体工作流档案库，里面放入思维链（CoT）、自我精炼（self-refine）这类简单智能体。
2. 让元智能体以 _代码_ 形式编写新的智能体，并从档案库中已有方案获得灵感。
   - 元智能体首先生成新工作流的高层描述，然后用代码实现它。
   - 草稿程序随后经过两轮自我精炼（即先让模型给出反馈，再让同一个模型根据反馈精炼先前生成的输出；[Madaan et al. 2023](https://arxiv.org/abs/2303.17651)），由元智能体检查其新颖性。
3. 评测每个新候选，并把成功的候选加回档案库。
4. 重复第 2–3 步，直到达到最大迭代次数。

![Automated Design of Agentic Systems（ADAS）示意图。（图片来源：Hu et al. 2025）](https://lilianweng.github.io/posts/2026-07-04-harness/adas.png)

**AFlow**（[Zhang et al. 2025](https://arxiv.org/abs/2410.10762)）把智能体工作流表示成一张图，其中节点代表调用 LLM 的动作，边用代码实现逻辑运算。工作流优化依赖 [MCTS](https://en.wikipedia.org/wiki/Monte_Carlo_tree_search)（蒙特卡洛树搜索）：

1. 用模板在树中初始化起始工作流 $W_0$。
2. 通过将得分导向的选择与均匀探索进行软混合的策略选择一个工作流节点。
3. 扩展所选节点：让 LLM 依据其评测表现生成修改后的工作流。
4. 执行并评测新的工作流。
5. 若新工作流在 $N$ 轮预算内表现出改进，则把它加回树中。
6. 重复第 2–5 步；当排名前 $k$ 的候选的平均得分不再提升或预算耗尽时停止。

![AFlow 在工作流候选树上的优化过程。（图片来源：Zhang et al. 2025）](https://lilianweng.github.io/posts/2026-07-04-harness/aflow.png)

AFlow 在问答（QA）、代码和数学任务上的实验表明，相比手工设计的工作流和 ADAS，AFlow 都有不错的提升。

![AFlow 实验：与手工方法和 ADAS 的对比。（图片来源：Zhang et al. 2025）](https://lilianweng.github.io/posts/2026-07-04-harness/aflow-exp.png)

### 自我改进的 Harness

无论是上下文工程还是工作流设计，都只是 harness 的一部分。我们需要在整个设计空间中搜索，把上下文管理逻辑、工作流、权限控制以及许多其他 harness 组件放在一起优化。正如在 Meta-Harness、ADAS 和 AFlow 这类工作中所见，**✨代码✨** 是定义程序和系统的 **通用语言**。简单来说，harness 就是这样一段代码：它编排提示词、工具调用、子智能体、控制流、记忆和工作流逻辑如何协同工作。如果 LLM 能优化执行智能体的那段代码，它就能触及一个 _远大于_ 手写提示词的设计空间。

**Self-Taught Optimizer**（STOP；[Zelikman et al. 2023](https://arxiv.org/abs/2310.02304)）是递归式脚手架改进的早期例子之一。在第 $t = 0$ 步，一个初始改进器（improver）$I_0$ 接收初始解 $s$、效用函数 $u$ 和一个黑盒语言模型 $M$，返回改进后的解 $s'$，即 $s' = I(u, s; M)$。STOP 的目标并不是直接改进 $s$，而是 _优化改进器 $I$ 本身_。

首先，将元效用（meta-utility）定义为给定改进器函数 $I$ 在一组下游任务 $\mathcal{D}$ 上的平均效用：

$$
\hat{u}(I) \triangleq \frac{1}{\lvert\mathcal{D}\rvert} \mathbb{E}_{(u,s) \sim \mathcal{D}} [u(I(u, s; M))]
$$

改进器函数本身也可以成为优化对象。因此，我们可以根据 $I_{t-1}$ 的元效用表现，通过一次自我改进更新，递归地得到新版本 $I_t$：

$$
I_t = I_{t-1}(\hat{u}, I_{t-1}; M)
$$

![Self-Taught Optimizer（STOP）算法。（图片来源：Zelikman et al. 2023）](https://lilianweng.github.io/posts/2026-07-04-harness/STOP-algo.png)

在实验中，改进后的改进器发现了多种策略，例如遗传算法、将问题分解后逐部分改进、以提示词为臂的多臂老虎机（bandit）、模拟退火、调整采样温度，以及束搜索／树搜索（beam/tree search）。这和“把 harness 工作流表示成可优化对象”的思路是类似的。

![STOP 发现的自我改进策略示例。（图片来源：Zelikman et al. 2023）](https://lilianweng.github.io/posts/2026-07-04-harness/STOP-patterns.png)

Zelikman et al. (2023) 有一个值得 _警惕_ 的发现：用 GPT-4 时，STOP 在多次迭代中提升了平均下游性能，而用 GPT-3.5、Mixtral 这类较弱模型时性能反而下降。仅有递归结构是不够的，基座模型必须 _足够有能力_，才能改进这套机制。这意味着 harness 改进能让模型部署得更好，但智力仍然是核心。

[Lin et al. (2026)](https://arxiv.org/abs/2605.30621) 更细致地研究了 harness 演化对模型能力的依赖。他们拆解出两个维度：(1) _harness-updating_ 指的是产出有用 harness 修改的能力；(2) _harness-benefit_ 指的是利用更新后的 harness、把任务解得更好的能力。有意思的是，在他们的实验中，从 Qwen3.5-9B 到 Claude Opus 4.6 这样规模和核心智力各异的模型，表现出的 harness 更新能力相近；9B 模型充当 harness 提案生成器／演化器时能写出与 Opus 所生成技能在流程上同构的技能。而要最大化利用一个 harness，模型需要正确、及时地调用技能或工具，并擅长长时程指令遵循。

![主要结果：（A）从 Qwen2-32B 到 Opus 4.6 的一系列模型，其 harness 更新能力基本持平；（B）harness 受益能力是非单调的，中间档位的模型获益最多。（图片来源：Lin et al. 2026）](https://lilianweng.github.io/posts/2026-07-04-harness/harness-update.png)

更近期的工作 **Self-Harness**（[Zhang et al. 2026](https://arxiv.org/abs/2606.09498)）依赖 LLM 智能体通过“提出—评测—接受”（propose-evaluate-accept）循环来改进自己的 harness。

![Self-Harness 使用“弱点挖掘—范围受限的 harness 修改提案—验证”的循环来更新 harness。（图片来源：Zhang et al. 2026）](https://lilianweng.github.io/posts/2026-07-04-harness/self-harness.png)

Self-Harness 中的循环有三个阶段：

1. _弱点挖掘（weakness mining）_：对失败案例进行聚类，归纳出以验证器判定为依据的失败模式。
   - 用当前 harness $h_t$ 在任务上评测，并收集执行轨迹用于分析。
   - 注意，两次运行在错误日志中可能呈现相同的验证器判定结果，比如超时或缺产物，但因果机制并不相同。因此我们需要信息丰富的失败记录，其中应包含验证器给出的最终失败原因、相关智能体行为在因果链中的状态，以及执行轨迹揭示的抽象智能体机制，才能找到根因。
2. _Harness 修改提案（harness proposal）_：基于挖掘出的失败模式，提出范围受限的 harness 修改。
   - 在 $h_t$ 下调用同一个模型来生成修改提案。
   - 提供范围受限的提案上下文：(1) 当前 harness 的可编辑范围；(2) 来自评测系统、以验证器判定为依据的失败模式；(3) 需要保留的、已通过验证的行为记录；(4) 此前尝试过的修改摘要。
   - Harness 修改应优先针对反复出现、可通过小幅修改修复的错误模式，而不是特定任务独有的难点。
   - Harness 修改候选应当彼此不同且有多样性。
3. _提案验证（proposal validation）_：验证并合并合格的修改，产生新 harness $h_{t+1}$。
   - 候选修改在内部评测集（held-in）$D_{\text{in}}$ 和留出评测集（held-out）$D_{\text{out}}$ 上做回归测试。
   - 前者用于检验弱点是否已被解决，后者用于检查是否引入其他未知问题。只有在这两组数据上都没有性能退化的候选才会被接受。
   - 被接受的候选会被合并以更新 harness 到 $h_{t+1}$，被拒绝的候选会被记录下来，但不改变当前生效的 harness。

在 Terminal-Bench-2 上运行 `MiniMax M2.5`、`Qwen3.5-35B-A3B` 和 `GLM-5` 时，Self-Harness 学到了针对不同基座模型不同弱点的模型专属 harness 指令，并提升了留出评测集上的通过率。

Self-Harness 这类工作也确实让我担心：如果允许程序修改操作系统，抽象边界就被打破了。可编辑范围需要被妥善设计，而权限控制和安全层需要位于这个循环之外。围绕[奖励作弊（reward hacking）](https://lilianweng.github.io/posts/2024-11-28-reward-hacking/)的所有挑战也依然存在。

**Agentic Harness Engineering**（AHE；[Lin et al. 2026](https://arxiv.org/abs/2604.25850)）认为 harness 演化的瓶颈在于 **可观测性（observability）**——也就是说，当一次运行失败时，我们需要知道是哪个组件该为此负责，而且每一次修改都应该有证据支撑。

该框架围绕可观测性的三个支柱建立了一个闭环：

1. _组件可观测性（component observability）_：每个可编辑的 harness 组件在文件系统里都有表示，因此动作空间是显式且可追溯的。
   - 一个 harness 包含 7 个组件：系统提示词、工具描述、工具实现、中间件、技能、子智能体配置、长期记忆。
   - 每个失败模式都映射到某个组件，让修改更有针对性。
2. _经验可观测性（experience observability）_：把大量原始轨迹分析并总结成一个证据与失败模式的层级结构。
   - 每个 harness 生成 $k$ 条轨迹。
   - 由一个智能体（“Agent debugger”，智能体调试器）分析分别存放在不同文件中的轨迹，并针对每个任务生成关于失败或成功根因的分析报告。
   - 所有单任务报告会被汇总成一份评测基准概览，供下一步使用；需要时可以再访问原始轨迹。这种分层访问结构在 token 使用上更高效。
3. _决策可观测性（decision observability）_：每一次修改都配有一个对下一轮的预测，以便验证。
   - 一个智能体（“Evolve agent”，演化智能体）读取仓库，决定修改哪个组件，然后产出修改以及背后的推理。
   - 每次文件修改都对应一个可证伪的主张，可在下一轮中检验，并受到以下两条约束：
     - (1) 修改只作用于 harness 工作区；runs 目录、轨迹记录器（tracer）、验证器和 LLM 配置都是只读的，这屏蔽了一组奖励作弊行为（例如关闭验证器、替换模型、提高推理预算），从而保证记录下来的每一分收益都可归因于 harness 修改。
     - (2) 修改是证据驱动的，并附有一条修改声明（manifesto）：失败证据的名称、推断出的根因、针对性的修复方案，以及对预期影响的预测，包括预期修复效果和可能出现的性能回退。

在 Terminal-Bench-2 上，AHE 取得了比人工设计的 harness（OpenCode、Terminus-2、Codex）更好的成绩，不过，这一优势不适用于 Hard 难度档，也未超过少数其他自我演化基线（ACE、TF-GRPO）。同一个 harness 在停止更新后仍能迁移到 SWE-bench-verified，说明演化出的 harness 能把工程经验编码进 harness 组件里，而不是只做针对特定评测基准的优化。

### 演化式搜索

演化式搜索是一种受自然选择启发的优化方法（参见我此前关于[演化算法](https://lilianweng.github.io/posts/2019-09-05-evolution-strategies/)的文章）。它通过变异来演化一群解，只保留群体中“适应度”高的个体。演化式搜索在两种情形下很好用：(1) 搜索空间极其庞大或者形态不规则；(2) 很难直接用梯度优化，但很容易评测解。Harness 搜索似乎正好符合这个场景。

演化式搜索过去也被用在提示词工程中。**Promptbreeder**（[Fernando et al. 2023](https://arxiv.org/abs/2309.16797)）通过一组丰富的变异操作来优化任务专属提示词，有意思的是，变异提示词（即指示 LLM 变异任务提示词的指令）本身也通过演化得到改进。**GEPA**（[Agrawal et al. 2025](https://arxiv.org/abs/2507.19457)）把基于[反思（reflection）](https://lilianweng.github.io/posts/2023-06-23-agent/#self-reflection)的提示与演化式搜索结合起来，对试错轨迹做自然语言反思，从而提出提示词更新。

[Novikov et al. (2025)](https://arxiv.org/abs/2506.13131) 提出 **AlphaEvolve**，这是一个编程智能体驱动的演化搜索系统：它维护一个候选程序池，并让参数保持冻结的 LLM 生成代码差异（diff），以改进程序。随着系统反复评测子程序并保留成功候选，它会不断发现更好的解。

![AlphaEvolve 的工作方式。（图片来源：Novikov et al. 2025）](https://lilianweng.github.io/posts/2026-07-04-harness/alphaevolve.png)

AlphaEvolve 的设计中有几个细节很重要：

- 提示词里包含父程序、结果、指令，有时还有元信息。
- 编程智能体可以访问整个仓库，但待改进的代码区域会被显式标记为 `# EVOLVE-BLOCK-START` 和 `# EVOLVE-BLOCK-END`。
- 元提示词会与 LLM 建议的指令和上下文协同演化，这和我们演化解程序的思路类似。

消融实验展示演化过程、提示词中的上下文、元提示词、整个文件的演化以及使用更强 LLM 各自的价值。

![消融实验展示了 AlphaEvolve 中若干设计的价值。（图片来源：Novikov et al. 2025）](https://lilianweng.github.io/posts/2026-07-04-harness/alphaevolve-plot.png)

近期的一些变体，例如 **ThetaEvolve**（[Wang et al. 2025](https://arxiv.org/abs/2511.23473)）把演化式搜索与 RL、上下文学习（in-context learning）结合起来；**DemoEvolve**（[Che, et al. 2026](https://arxiv.org/abs/2605.24539)）在自身运行轨迹的档案库中引入人类专家示范，作为 harness 层面诊断和编辑的参考经验。另一方面，**ShinkaEvolve**（[Lange et al. 2025](https://arxiv.org/abs/2509.19349)）引入了三个新组件来提升 LLM 采样效率：

- 通过设计父代采样在性能排名和后代数量之间取得平衡，提高探索的样本效率。
- 依据嵌入向量的余弦相似度，按代码新颖性进行拒绝采样，丢弃与现有个体过于相似的候选。
- 在元草稿本（meta-scratchpad）中识别成功解里的良好模式，以指导后续变异。

与上述专注于解改进的方法不同，**Darwin Gödel Machine**（DGM；[Zhang et al. 2025](https://arxiv.org/abs/2505.22954)）明确以“可编辑 harness 代码仓库的演化”为目标，由一个基于 LLM 的编程智能体来执行。准确地说，这个智能体被允许修改自己的 harness。后续工作 Hyperagents（[Zhang et al. 2026](https://arxiv.org/abs/2603.19461)）引入了元智能体，用来控制如何修改已有的任务智能体以创建新的智能体。

1. 池中初始只有一个编程智能体。
2. 每轮迭代选择一个父代，其被选中的概率与性能成正比，与已有子代数量成反比，对它做修改并分叉出新智能体。
3. 被选中的父智能体检查自己的评测基准评测日志，然后对自己那套 harness 代码库提出改进，生成新版本的编程智能体。代码编辑用两个基础工具实现：(1) bash（参数：`<bash_command>`）；(2) editor（参数：`view/create/edit <file_path>`）。
4. 评测新的编程智能体，只有性能足够高的才会被放回池中。
5. 重复第 2–4 步，直到满足某个停止条件。

DGM 是固定模型下的 harness 演化。以 `Claude 3.5 Sonnet` 为基座 LLM、使用简单的初始 harness 配置做实验时，DGM 发现的智能体在 SWE-bench Verified（20% 提升到 50%）和 Polyglot（14.2% 提升到 30.7%）上可与手工设计的智能体相比甚至更好。

当候选解可以被自动评测、且适应度容易量化时——例如矩阵乘法、GPU 计算内核优化、算法竞赛、数据中心调度——这一类方法效果很好。而在评测缓慢、含糊或者主要依赖启发式判断的领域，它就会吃力。演化的计算效率与有效性也是需要关注的问题。

### 与模型权重的联合优化

Harness 演化改变的是模型周边的非参数系统。要实现完整的自我改进，也可以允许模型同时更新自身权重。权重更新可以通过改进模型训练管线来实现，也可以在测试时做持续学习。持续学习这个话题值得未来单独写一篇。

**SIA**（[Hebbar et al. 2026](https://arxiv.org/abs/2605.27276)）是把 harness 改进和模型参数更新放进同一个优化循环的早期尝试，设计上有三个组件：

- _元智能体（Meta-Agent）_：提出初始 harness。
- _任务专用智能体（Task-Specific Agent）_：执行任务。
- _反馈智能体（Feedback-Agent）_：根据近期轨迹决定是更新 harness 还是更新模型权重。

![SIA 中的 Feedback-Agent 决定下一轮迭代的类型。（图片来源：Hebbar et al. 2026）](https://lilianweng.github.io/posts/2026-07-04-harness/SIA.png)

SIA 的实验中有几项会造成混淆的设计选择，使结果难以解释。例如，任务专用智能体比 Meta-Agent 和 Feedback-Agent 使用的模型弱很多（`gpt-oss-120b` 对 `Claude Sonnet 4.6`），而且基线太弱，无法和相关方法进行清晰的横向比较。我认为这个方向有意思，但证据还只是初步的。不过，训练稳定性和古德哈特效应（Goodhart effect）等许多挑战仍然悬而未决。

**Continual Harness**（[Karten et al. 2026](https://arxiv.org/abs/2605.09998)）则在长时程游戏环境中试验了 harness 更新，并通过在低奖励轨迹上蒸馏强教师模型的标签，同时训练一个策略模型。

## 未来挑战

AI Scientist 系列研究有力地表明，专家设计的 harness 能够协调自动化研究循环中的大部分环节；这些研究以撰写研究论文的形式开展了实验。但论文产出并不等同于科学发现。一个系统可以写出一份看似合理的稿件，同时却存在编造引用、实现漂移或实验结果薄弱的问题。

[Trehan & Chopra (2026)](https://arxiv.org/abs/2601.03315) 测试了 LLM 能否在最小脚手架和基础工具（即 `read_file`、`write_file`、`llm_search`、`list_files`）的条件下，从一个研究想法走到一篇论文。每个想法都有独立工作区，智能体可以生成和读取文档作为上下文的一部分。他们在三个领域（世界模型、多智能体强化学习、AI 安全与对齐）做实验，每个领域包含 45–50 篇高质量种子文献来激发新想法。只有 4 个想法被人类专家选中进入完整流水线，其中只有 1 个完整走完流程并形成论文。他们在实验中观察到六种反复出现的失败模式：

- _偏向训练数据中的默认做法_：使用过时的库、陈旧命令、标准格式，或者做出并非基于真实仓库或数据集的假设。
- _执行压力下的实现漂移_：当实现变得技术上复杂时，模型可能会转向一个常见的更简单方案，而不是原本提出的方法。
- _记忆与上下文退化_：除非把日志写成持久保存的产物，否则长时程项目会丢失关键细节。
- _过度乐观_：即便实验结果噪声很大，或实验已经失败，模型仍宣称成功；这类似 [Bubeck et al. (2025)](https://arxiv.org/abs/2511.16072) 观察到的 “操纵显著性与贸然宣称突破”（p-hacking and eureka-ing）的模式：模型会用“数值胶带”式的权宜手段修补结果，在信号仍是噪声时就宣布胜利。
- _领域智力不足_：模型缺乏难以言传的实践经验，例如预判实现复杂度、判断一个实验结果是否合理，或者知道哪些基线才是重要的。
- _科学品味薄弱_：实验也许能跑起来，但没能回答正确的问题。

在通往完整 RSI 的路上，研究者已经取得了切实进展，但仍有若干瓶颈。

**1. 评测器又弱又模糊。** 许多研究主张并不存在快速而精确的验证器，现实中很多任务也是如此。当前自我改进循环在评测指标可度量、客观的任务上效果最好，这[和 RL 的工作方式](https://lilianweng.github.io/posts/2018-02-19-rl-overview/)类似。

而研究品味、新颖性和长期科学价值则难以度量得多。例如，研究品味往往混合了问题界定、实验设计，以及对哪些意外结果值得深入、哪些失败案例值得重试的判断。

**2. 上下文与记忆生命周期。** 随着 AI 智能体变得更自主、更独立，记忆也在增长。一个有价值的 harness 需要管理上下文和记忆，以弥补长上下文生成的现有局限，同时最大化长时程任务的成功率。既然人类能够在一生中维持记忆，我在这里看到一个类比：[上下文工程](#context-工程) 将会、也应该成为智能的核心部分，而不是停留在软件系统层。

**3. 负面结果。** 研究者有动力发表成功结果，因此文献偏向于成功案例。在大量数据上训练出来的 LLM（至少目前大部分还是人类创造的，哈哈）可能会因为数据中成功与失败案例的失衡，而不擅长判断何时该放弃一个假设、报告一个负面结果，甚至承认失败。研究 harness 应该让失败尝试易于保留，因为从失败中学习是裁剪任务搜索空间的最好方式。

**4. 多样性坍缩。** 演化和 RL 循环倾向于利用已知的高奖励模式。我们需要[相应机制](https://lilianweng.github.io/posts/2020-06-07-exploration-drl/)来防止种群坍缩成同一个解的变体。这对开放式研究尤其关键，因为最好的路径在当前的评测器下最初可能看起来更差。

**5. [奖励作弊](https://lilianweng.github.io/posts/2024-11-28-reward-hacking/)。** 自我改进循环会优化它被给予的任何信号。如果奖励来自单元测试，智能体可能过拟合测试；如果来自裁判模型，它可能学会针对该裁判的奖励作弊技巧；如果来自评测基准分数，它可能利用评测基准中的非实质性特征或偶然痕迹。

评测器和权限控制很可能应该位于演化 harness 的循环之外，配合留出数据测试、轨迹审计，以及在关键决策点上的人类审查——监督能被扩展和自动化到什么程度，仍然是一个开放的研究问题。

**6. 长期成功。** 外部优化循环所优化的，是单次运行之外、能够在训练沙箱中模拟的奖励。

以编程智能体为例。编程智能体已经提升了软件工程的日常生产力，但很多优化目标仍然过于短期。它通常能完成手头的任务，但应该如何保护一个由成百上千名工程师共同维护的仓库的长期健康，就不那么显而易见了。标准的基于沙箱的 RLVR 式训练，很少能捕捉可维护性、代码归属与维护责任的边界、迁移成本、向后兼容性或未来的调试负担。

**7. 人类的角色。** 人类应该转向系统栈中更高的层级，而不是被移出循环。也就是说，人类应该在合适的时间、合适的抽象层级上提供监督，而我们的系统设计应该考虑何时、如何安排这些介入节点。

上面列出的许多挑战都需要人类的反馈与引导。毕竟，我们是在为人类更好的未来构建技术，而不是反过来。

## 引用方式

请按如下方式引用原文：

> Weng, Lilian. “Harness Engineering for Self-Improvement”. Lil’Log (Jul 2026). https://lilianweng.github.io/posts/2026-07-04-harness/

或使用 BibTeX 引用：

```bibtex
@article{weng2026harness,
  title = {Harness Engineering for Self-Improvement},
  author = {Weng, Lilian},
  journal = {lilianweng.github.io},
  year = {2026},
  month = {July},
  url = "https://lilianweng.github.io/posts/2026-07-04-harness/"
}
```

## 附录：一些有用的 benchmark

- **[PaperBench](https://arxiv.org/abs/2504.01848)**：从零复现 20 篇 ICML 2024 Spotlight 和 Oral 论文，包括理解论文贡献、开发代码库，并成功执行实验。
  - 每个复现任务被拆解成更小的、可单独评分的子任务。
  - 总计 8,316 条评分细则（rubric），由论文作者共同开发。
  - 当时最好的模型（`Claude 3.5 Sonnet`，约 21%）表现未能超过机器学习博士。
  - 包含 PaperBench、PaperBench Code-Dev（轻量版）和 JudgeEval。
- **[CORE-Bench](https://arxiv.org/abs/2409.11363)**：评测已发表研究的计算可复现性。
  - 基于 90 篇科学论文构建 270 个任务，覆盖计算机科学、社会科学和医学。
  - 任务包括用提供的代码和数据复现结果。
  - 包含多个难度层级，以及纯语言和视觉语言两类任务。
  - 当时报告的最佳智能体（`GPT-4o` 和 `GPT-4o-mini`）在最难任务上仅达到 21% 准确率。
- **[ScienceAgentBench](https://arxiv.org/abs/2410.05080)**：评测面向数据驱动科学发现的 LLM 智能体。
  - 从 4 个学科（数学、化学、生物、地理）的 44 篇同行评审论文中抽取 102 个任务。
  - 覆盖这些领域的基础数据科学任务：数据处理、模型开发、数据分析和信息可视化。
- **[RE-Bench](https://arxiv.org/abs/2411.15114)**：在贴近真实的 ML 研究工程环境中，把前沿 AI 智能体与人类专家做对比。
  - 7 个有挑战性的开放式 ML 研究工程环境。
  - 每个环境 =（打分函数、起始解、参考解）；每个都能使用不超过 8 块 H100 GPU 运行。
  - 例如：优化计算内核、开展缩放定律（scaling law）实验、修复嵌入表示、微调 GPT-2 做问答等。
  - 包含 61 位不同人类专家共 71 次 8 小时尝试的数据。
  - 人类专家在 82% 的 8 小时尝试中取得非零分；24% 达到或超过强参考解。
  - 最好的 AI 智能体在 2 小时预算下得分是人类专家的 4 倍，但人类在延长时间预算时获得的收益更大，在 8 小时和 32 小时设置下超过了智能体。
- **[MLE-bench](https://arxiv.org/abs/2410.07095)**：在离线 Kaggle 竞赛上评测机器学习工程智能体。
  - 包含从 Kaggle 精选的 75 个 ML 工程竞赛。
  - 测试训练模型、准备数据集、运行实验，并把预测提交给评分脚本。
  - 使用 Kaggle 公开排行榜作为人类表现的基线。
  - 论文中最好的配置是 `o1-preview` 搭配 AIDE 脚手架，在 16.9% 的竞赛中至少达到 Kaggle 铜牌水平。
  - 包含资源规模扩展与数据污染分析。
- **[KernelBench](https://arxiv.org/abs/2502.10517)**：评测生成的 GPU 计算内核的正确性与速度。
  - 250 个 PyTorch 任务，用来评测 LLM 能否写出又快又正确的计算内核。
  - 评测指标 $\mathrm{fast}_p$ = 生成的计算内核中，既正确又比基线更快的百分比。

## 参考文献

\[1\] Good, I. J. [“Speculations Concerning the First Ultraintelligent Machine.”](https://philpapers.org/rec/GOOSCT) _Advances in Computers_, 6:31–88, 1965.

\[2\] Yudkowsky, Eliezer. [“Recursive Self-Improvement.”](https://www.lesswrong.com/posts/JBadX7rwdcRFzGuju/recursive-self-improvement) LessWrong, 2008.

\[3\] Choi, et al. [“Anchored Self-Play for Code Repair.”](https://openreview.net/forum?id=lTbBFAoPSA) ICML 2026.

\[4\] Zhao, et al. [“Absolute Zero: Reinforced Self-play Reasoning with Zero Data.”](https://arxiv.org/abs/2505.03335) arXiv preprint arXiv:2505.03335, 2025.

\[5\] Yuan, et al. [“Self-Rewarding Language Models.”](https://arxiv.org/abs/2401.10020) arXiv preprint arXiv:2401.10020, 2024.

\[6\] Chen, et al. [“Self-Play Fine-Tuning Converts Weak Language Models to Strong Language Models.”](https://arxiv.org/abs/2401.01335) ICML 2024.

\[7\] Zhang, et al. [“Agentic Context Engineering: Evolving Contexts for Self-Improving Language Models.”](https://arxiv.org/abs/2510.04618) ICLR 2026.

\[8\] Ye, et al. [“Meta Context Engineering via Agentic Skill Evolution.”](https://arxiv.org/abs/2601.21557) arXiv preprint arXiv:2601.21557, 2026.

\[9\] Lee, et al. [“Meta-Harness: End-to-End Optimization of Model Harnesses.”](https://arxiv.org/abs/2603.28052) arXiv preprint arXiv:2603.28052, 2026.

\[10\] Lu, et al. [“Towards end-to-end automation of AI research.”](https://www.nature.com/articles/s41586-026-10265-5) _Nature_, 651:914–919, 2026.

\[11\] Meng, et al. [“ScientistOne: Towards Human-Level Autonomous Research via Chain-of-Evidence.”](https://arxiv.org/abs/2605.26340) arXiv preprint arXiv:2605.26340, 2026.

\[12\] Kulikov, et al. [“Autodata: An agentic data scientist to create high quality synthetic data.”](https://arxiv.org/abs/2606.25996) arXiv preprint arXiv:2606.25996, 2026.

\[13\] Hu, Lu, and Clune. [“Automated Design of Agentic Systems.”](https://arxiv.org/abs/2408.08435) ICLR 2025.

\[14\] Madaan, et al. [“Self-Refine: Iterative Refinement with Self-Feedback.”](https://arxiv.org/abs/2303.17651) NeurIPS 2023.

\[15\] Zhang, et al. [“AFlow: Automating Agentic Workflow Generation.”](https://arxiv.org/abs/2410.10762) ICLR 2025.

\[16\] Zelikman, et al. [“Self-Taught Optimizer (STOP): Recursively Self-Improving Code Generation.”](https://arxiv.org/abs/2310.02304) COLM 2024.

\[17\] Zhang, et al. [“Self-Harness: Harnesses That Improve Themselves.”](https://arxiv.org/abs/2606.09498) arXiv preprint arXiv:2606.09498, 2026.

\[18\] Fernando, et al. [“Promptbreeder: Self-Referential Self-Improvement Via Prompt Evolution.”](https://arxiv.org/abs/2309.16797) arXiv preprint arXiv:2309.16797, 2023.

\[19\] Agrawal, A. et al. [“GEPA: Reflective Prompt Evolution Can Outperform Reinforcement Learning.”](https://arxiv.org/abs/2507.19457) arXiv preprint arXiv:2507.19457, 2025.

\[20\] Novikov, et al. [“AlphaEvolve: A coding agent for scientific and algorithmic discovery.”](https://arxiv.org/abs/2506.13131) arXiv preprint arXiv:2506.13131, 2025.

\[21\] Lange, Imajuku, and Cetin. [“ShinkaEvolve: Towards Open-Ended And Sample-Efficient Program Evolution.”](https://arxiv.org/abs/2509.19349) arXiv preprint arXiv:2509.19349, 2025.

\[22\] Wang, et al. [“ThetaEvolve: Test-time Learning on Open Problems.”](https://arxiv.org/abs/2511.23473) arXiv preprint arXiv:2511.23473, 2025.

\[23\] Zhang, et al. [“Darwin Gödel Machine: Open-Ended Evolution of Self-Improving Agents.”](https://arxiv.org/abs/2505.22954) arXiv preprint arXiv:2505.22954, 2025.

\[24\] Zhang, et al. [“Hyperagents.”](https://arxiv.org/abs/2603.19461) arXiv preprint arXiv:2603.19461, 2026.

\[25\] Yuksekgonul, et al. [“Learning to Discover at Test Time.”](https://arxiv.org/abs/2601.16175) arXiv preprint arXiv:2601.16175, 2026.

\[26\] Riaz, et al. [“Epistemic Uncertainty for Test-Time Discovery.”](https://arxiv.org/abs/2605.11328) arXiv preprint arXiv:2605.11328, 2026.

\[27\] Hebbar, et al. [“SIA: Self Improving AI with Harness & Weight Updates.”](https://arxiv.org/abs/2605.27276) arXiv preprint arXiv:2605.27276, 2026.

\[28\] Trehan and Chopra. [“Why LLMs Aren’t Scientists Yet: Lessons from Four Autonomous Research Attempts.”](https://arxiv.org/abs/2601.03315) arXiv preprint arXiv:2601.03315, 2026.

\[29\] Bubeck, et al. [“Early science acceleration experiments with GPT-5.”](https://arxiv.org/abs/2511.16072) arXiv preprint arXiv:2511.16072, 2025.

\[30\] Starace, et al. [“PaperBench: Evaluating AI’s Ability to Replicate AI Research.”](https://arxiv.org/abs/2504.01848) ICML 2025.

\[31\] Wijk, et al. [“RE-Bench: Evaluating frontier AI R&D capabilities of language model agents against human experts.”](https://arxiv.org/abs/2411.15114) ICML 2025.

\[32\] Chan, et al. [“MLE-bench: Evaluating Machine Learning Agents on Machine Learning Engineering.”](https://arxiv.org/abs/2410.07095) arXiv preprint arXiv:2410.07095, 2024.

\[33\] Chen, et al. [“ScienceAgentBench: Toward Rigorous Assessment of Language Agents for Data-Driven Scientific Discovery.”](https://arxiv.org/abs/2410.05080) ICLR 2025.

\[34\] Siegel, et al. [“CORE-Bench: Fostering the Credibility of Published Research Through a Computational Reproducibility Agent Benchmark.”](https://arxiv.org/abs/2409.11363) TMLR 2024.

\[35\] Ouyang, et al. [“KernelBench: Can LLMs Write Efficient GPU Kernels?”](https://arxiv.org/abs/2502.10517) arXiv preprint arXiv:2502.10517, 2025.

\[36\] Lin, et al. [“Harness Updating Is Not Harness Benefit: Disentangling Evolution Capabilities in Self-Evolving LLM Agents.”](https://arxiv.org/abs/2605.30621) arXiv preprint arXiv:2605.30621, 2026.

\[37\] Lin, et al. [“Agentic Harness Engineering: Observability-Driven Automatic Evolution of Coding-Agent Harnesses.”](https://arxiv.org/abs/2604.25850) arXiv preprint arXiv:2604.25850, 2026.

\[38\] Karten, et al. [“Continual Harness: Online Adaptation for Self-Improving Foundation Agents.”](https://arxiv.org/abs/2605.09998) arXiv preprint arXiv:2605.09998, 2026.

\[39\] Che, et al. [“DemoEvolve: Overcoming Sparse Feedback in Agentic Harness Evolution with Demonstrations.”](https://arxiv.org/abs/2605.24539) arXiv preprint arXiv:2605.24539, 2026.
