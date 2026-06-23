---
title: "Claude Code Dynamic Workflows：把编排逻辑搬进代码的新原语"
author: Kai Zhou
pubDatetime: 2026-06-10T10:00:00+08:00
featured: false
draft: false
tags:
  - Claude Code
  - AI Agent
  - Workflow
  - AI Coding
description: "Dynamic Workflows 把 agent 编排从模型临场决策搬进可执行脚本——循环、分支、并行全固化成代码，数百个 subagent 同时开工，主上下文只收最终结果。拆解它的架构、边界和为什么这不是又一个自动化工具。"
---

> 当任务大到一次对话装不下时，让 Claude 把编排过程写成一段可执行的脚本——循环、分支、并行全固化在代码里，数百个 subagent 同时开工，主上下文只收最后那个答案。这不是又一个"可视化拖拽工作流"工具，而是一种把 agent 编排从临场决策变成可读、可审、可复用的代码资产的新原语。

## Bun 的成绩单

5 月 28 日，Anthropic 发布了 Claude Opus 4.8，同时放出了一个研究预览功能——Dynamic Workflows（动态工作流）。

先看一组数字：**11 天**、**约 75 万行 Rust 代码**、**99.8% 的原有测试通过**。这是 Bun 作者 Jarred Sumner 把整个 Bun 运行时[从 Zig 迁移到 Rust](https://github.com/oven-sh/bun/pull/30412) 的成绩单，扛起这场迁移的主力正是 Dynamic Workflows。

官方博客对它的定位写得很直接：

> Some problems are too big for one pass by a single agent, especially in complex, legacy codebases: a bug hunt across an entire service, a migration that touches hundreds of files, a plan you want stress-tested from every angle before you commit to it.

跨整个服务的 bug 排查、动辄上百个文件的迁移、需要从各个角度反复推敲才敢拍板的方案——这些任务的共同点是规模超出了一轮对话能协调的范围。Dynamic Workflows 给出的答案，是让 Claude 把整个编排过程写成一段 JavaScript 脚本，交给一个确定性运行时去执行。

## 编排权的转移

要理解 Workflow 的位置，得先捋一遍 Claude Code 已有的几层协作能力。

最底层是单个 session，一个 Agent 实例从头干到尾。往上一层是 subagent——主 Agent 派生出若干小弟去搜文件、读代码、跑命令，干完把结果汇报回来。再往上是不久前推出的 [Agent Teams](https://code.claude.com/docs/en/agent-teams)，多个独立实例像团队一样并行协作。

这几层有一个共同的瓶颈：**编排者始终是 Claude 本身**。它逐轮决策下一步派谁去干什么，每一个 subagent 的返回结果都要先回到 Claude 的上下文窗口里，它读完才能决定接下来怎么走。这套机制在任务规模不大时很灵活，可一旦要协调几十上百个并行任务，上下文窗口就装不下了。

Workflow 换了个思路。Claude 不再亲自逐轮调度，而是先把整个编排过程**写成一段 JavaScript 脚本**——循环、分支、中间结果的收集全都固化在代码里——再交给一个独立的运行时去执行。官方文档把这个转变概括得很准确：

> A workflow moves the plan into code. With subagents and skills, Claude is the orchestrator: it decides turn by turn what to spawn next, and every result lands in Claude's context. A workflow script holds the loop, the branching, and the intermediate results itself, so Claude's context holds only the final answer.

计划被搬进了代码。脚本自己持有循环、分支和中间结果，Claude 的上下文里只剩下最后那个答案。

这个转变的关键不在"自动化"，而在**编排权从模型手里交了出去**。模型不再负责"下一步干什么"，它只负责在脚本指定的节点上完成具体工作。调度逻辑变成了你可以读、可以审、可以存下来反复跑的代码——而不是每次对话里临时想出来的、转瞬即逝的决策序列。

## 本地运行时

很多人以为 Workflow 是 Anthropic 服务端的某个编排引擎。实际情况是：**Workflow 工具本身不请求任何服务端**。它是 Claude Code 在你本机跑的一段 JavaScript 编排脚本——`agent()`、`parallel()`、`pipeline()` 这些都是在你电脑上执行的控制流。真正去请求服务端的，是脚本里 `agent()` 调用 spawn 出来的每个 subagent，而 subagent 调模型的方式跟你主对话窗口完全一样。

这意味着：如果你用第三方 API 中转，Workflow 跑挂了，那跟 Workflow 没关系——它用的就是 Claude Code 平时调模型一直在用的那套接口。

把这层关系理清之后，运行模型就清晰了：一个**确定性的 JavaScript 运行时**当指挥，它只会循环、拼字符串、`await`，本身不含任何 LLM；只有当脚本执行到 `agent(...)` 那一行，运行时才临时雇一个 LLM subagent 干活。而"真正的 Agent"——你正在对话的主 Claude——在脚本执行期间**根本没在运行**：它在发出 Workflow 调用后的那一回合就结束了，脚本在后台独立跑，跑完用一条通知把它叫醒，让它去读最后的结果。

一句话记住这个分工：**JS 运行时当指挥（无脑、确定性），在 `agent()` 点临时雇 LLM 干活，主 Agent 全程在睡觉，只最后被叫醒读结果。**

## 脚本骨架

Workflow 是一段 JS 脚本。每个脚本**必须**以 `export const meta = {...}` 开头，且 meta 必须是纯字面量——不能有变量、函数调用、模板插值。它定义了脚本的名字、描述和阶段划分：

```javascript
export const meta = {
  name: 'find-flaky-tests',
  description: 'Find flaky tests and propose fixes',
  phases: [
    { title: 'Scan', detail: 'grep test logs for retries' },
    { title: 'Fix',  detail: 'one agent per flaky test' },
  ],
}

phase('Scan')
const flaky = await agent('grep CI logs for retry markers', { schema: FLAKY_SCHEMA })
phase('Fix')
// ...
```

核心原语不多，一张表就够了：

| 原语 | 作用 |
| --- | --- |
| `agent(prompt, opts)` | 起一个 subagent，prompt 是普通 JS 字符串 |
| `parallel(tasks)` | 一批 agent 全部跑完才往下走（有屏障） |
| `pipeline(items, ...stages)` | 每个 item 独立流过多阶段，互不等待 |
| `phase(title)` | 标记阶段边界，对应 meta.phases |
| `log(msg)` | 向用户输出状态，不进主上下文 |

整段脚本里最容易踩的坑，是 `pipeline` 和 `parallel` 分不清。两者的本质分界是**有没有屏障**：`parallel` 会等这一批全部跑完才往下走，`pipeline` 则让每个 item 各自独立流过所有 stage。

典型浪费写法：

```javascript
const a = await parallel(...)   // 屏障：等全部跑完
const b = transform(a)          // 只是 flatten/map/filter，没有跨 item 依赖
const c = await parallel(b.map(...))
```

如果 5 个任务快慢不一，中间这个屏障会让快的干等慢的。正确做法是把中间的 transform 塞进 pipeline 的一个 stage：

```javascript
const results = await pipeline(
  DIMENSIONS,
  d => agent(d.prompt, { label: `review:${d.key}`, schema: FINDINGS }),
  review => parallel(review.findings.map(f => () =>
    agent(`对抗性验证: ${f.title}`, { schema: VERDICT })
      .then(v => ({ ...f, verdict: v }))
  ))
)
```

只有三种情况才真正需要 barrier：下一阶段前要对**全集**去重或合并；要根据总数提前退出（"0 个 bug 就跳过验证阶段"）；下阶段的 prompt 要引用"其他所有发现"做横向比较。除此之外，**有疑问就用 pipeline**。

## DAG 之外

聊到编排，很多人第一反应是 DAG（有向无环图）——Airflow、Argo、GitHub Actions 的 `needs:`，都是先把依赖图画死再按图执行。

Workflow 不一样。它是**图灵完备的命令式 JavaScript**，能写出 DAG 表达不了的东西，最典型的就是循环——比如"一直找 bug，直到连续两轮都没有新增"：

```javascript
let dry = 0
while (dry < 2) {                            // 回边，控制流图里有环
  const fresh = (await parallel(FINDERS.map(...))).filter(isNew)
  if (!fresh.length) { dry++; continue }
  dry = 0
  confirmed.push(...await verify(fresh))
}
```

除了循环，它还能写运行时才决定的分支（`if (bugs.length === 0) return`），以及动态扇出（下一阶段起几个 agent，取决于上一阶段返回了多少条结果）。图的形状事先不知道——在"程序结构"层面，它比 DAG 严格更强。

但盯住某一次具体执行，它又一定是 DAG：数据只往时间前方流，循环被展开后，第 N+1 轮和第 N 轮的 agent 是不同的节点——环在"程序"里，展开成"轨迹"后被拉直成一条链。

一句话：**带 `while` 的程序不是 DAG，但跑一次的轨迹永远是 DAG。** 这正是它比传统 DAG 编排器更灵活的地方——图的拓扑是运行时由脚本跑出来的，不是事先画死的。

## 执行模型与硬约束

Workflow 的运行时跟你的对话是隔离的——脚本在独立环境里执行，跑的过程中你的会话依然能响应。这套隔离也带来一组必须了解的约束：

- **并发上限**：最多 16 个 subagent 同时跑（实际 `min(16, CPU 核数 − 2)`），单次运行最多 1000 个 agent。后者是防止脚本死循环失控的保险丝。
- **权限继承**：Workflow 内部派生的所有 subagent 自动以 `acceptEdits` 模式运行，文件编辑不再逐个弹窗确认，并继承当前会话的工具允许列表。但不在列表里的 shell 命令、网络抓取和 MCP 工具，仍然会弹确认框。**大规模运行前，先把 agent 们需要的命令加进允许列表**。
- **脚本无文件系统权限**：读写和执行全靠 subagent，脚本只负责调度。
- **跨会话不可恢复**：退出 Claude Code 后，下次进来 Workflow 从头再跑。但同会话内可以恢复，改完脚本后用 `resumeFromRunId` 重跑，没改动的 `agent()` 调用直接命中缓存。

## 三阶段移植

回到开头的 Bun 案例。Jarred Sumner 用三个串联的 Workflow 把整个运行时从 Zig 移植到了 Rust：

**阶段一：生命周期映射。** 第一个 Workflow 给 Zig 代码库里每一个 struct field 算出对应的正确 Rust lifetime。这一步单独拎出来做，是因为它是所有移植工作的地基——Rust 的内存安全建立在生命周期标注之上，这一层没算对，后面写出来的 `.rs` 文件根本过不了编译。

**阶段二：并行文件移植。** 下一个 Workflow 把每个 `.zig` 文件移植成一个行为等价的 `.rs` 文件，**数百个 agent 同时开工，每个文件还配两个 reviewer 做交叉审查**。把这个量级跟 Agent Teams 对比一下——Agent Teams 同时跑三五个队员就到协调上限了，而 Workflow 是几百个 agent 并行外加双重 review。

**阶段三：编译与测试 fix loop。** 文件移植完只是半成品，真正的硬仗是让它们能编译、能通过测试。第三个 Workflow 驱动整个 build 和 test 套件，循环修复直到两者都干净跑过。这正是上一节 `while` 循环模式的典型场景——靠脚本里的循环逻辑反复迭代，不靠 Claude 逐轮盯着。

移植合并后，还跑了一个 overnight workflow 处理收尾——扫描代码里不必要的数据拷贝，每发现一处优化就单独开一个 PR 交给人做最终审查。这种"夜里挂着干长尾清理、产出一堆待 review 的 PR"的用法，很有意思。

需要说清楚的是，官方标注 Bun 的 Rust 版本**当时还没进入生产环境**——流程跑通了、测试过了，但离上线还有距离。

## 133 个会话画像

Bun 是个极端案例。我自己拿一个更日常的任务试了一下：给 `~/.claude` 目录下 **133 个会话、130MB 的 JSONL 记录**做"使用画像"。

整个任务拆成"**主 Agent 预处理 + Workflow 编排**"两段。主 Agent 先把 133 个会话压缩成"标题 + 用户输入 + 元数据"，得到 601 条人类输入，切成 10 个批次。然后 Workflow 上场：**10 个分析 agent 并行各啃一个批次**，按统一 schema 抽取领域分布、卡点、自动化候选，最后 1 个综合 agent 跨批汇总去重，产出一份带优先级的报告。

执行体大致长这样：

```javascript
phase('分析')
const batches = Array.from({ length: 10 }, (_, i) =>
  `${DIR}/batch_${String(i + 1).padStart(2, '0')}.md`)

const findings = await parallel(batches.map((path, i) => () =>
  agent(ANALYZE_PROMPT(path), {
    label: `分析:batch_${String(i + 1).padStart(2, '0')}`,
    phase: '分析',
    schema: FINDING_SCHEMA,
  })
))

const ok = findings.filter(Boolean)
log(`分析完成：${ok.length}/${batches.length} 批返回有效结果`)

phase('综合')
const corpus = JSON.stringify(ok, null, 1)
const report = await agent(SYNTH_PROMPT, { label: '综合报告', phase: '综合' })
return report  // 唯一回到主上下文的东西
```

账单：**11 个 agent、81.8 万 token、254 秒**。

这个案例还顺带回答了一个很多人会问的问题：**这事派几个 subagent 一样能做，区别在哪？** 确实能做——区别不在"能不能"，在"编排逻辑放哪、中间结果流到哪"。用 Agent 工具派 10 个 subagent，10 份结果会全部回到主上下文，你在下一个回合用自己的脑子读完、决定怎么合。Workflow 把编排写成了代码，中间结果不进主上下文，只回最终报告，schema 自动校验、并发自动管控。

但得诚实地补一句：就**这一次**这种"一把梭 map-reduce"而言，两者差距其实不大——10 路并行合一次就完了，subagent 也够用。Workflow 真正赚到的是随复杂度放大的部分：阶段变多、需要循环、需要多轮对抗式验证、或者要 fan-out 到几十个单元时，用 subagent 手动协调会越来越痛。

## 编排工具的对比

看到"用代码编排多步流程 + 步骤里塞 LLM"，很容易冒出一个念头：这不就是 n8n、Coze、Dify 那套吗？无非是模型来编排。

先说共性：Anthropic 在《Building Effective Agents》里给了定义——**Workflows 是 LLM 和工具通过"预定义代码路径"被编排的系统**。按这个定义，Dynamic Workflow 和 n8n/Dify/Coze 是**同一类**——控制流都是确定性的，LLM 不会在运行时决定"下一步走哪条边"，脚本写好后就由无脑运行时执行，LLM 只在节点内部干活。

但差异不止"模型自动编排"一条：

| 维度 | n8n / Coze / Dify | Dynamic Workflows |
| --- | --- | --- |
| **编排作者** | 人 | Claude 现场生成 |
| **编排载体** | 可视化 DAG（有向无环） | 图灵完备 JS 代码（可写循环） |
| **节点性质** | 固定连接器或模板 prompt | 每个节点是自主 agent |
| **生成时机** | 人预先搭建 | 针对当次任务量身生成 |
| **可复用性** | 建一次反复用 | 存为 `/` 命令反复用 |

压成一句：**Workflow ≈ 把 n8n 那张图，换成模型现场生成的一段代码。** 换了作者（人 → 模型）和载体（可视化 DAG → 命令式代码）。第一样带来即时性和定制性，第二样带来表达力提升（能写循环和动态扇出）。

另外一点值得注意：AI 的介入发生在"写代码"那一刻，不在"跑流程"那一刻。n8n 是人写编排、确定性执行；Workflow 是模型写编排、确定性执行——跑起来之后模型在睡觉。两边执行流程的方式一样，差别只在编排脚本的作者。

## 手搓方案

既然 Workflow 本质是"确定性脚本 + 在节点处调 LLM"，那官方推出之前，自己手搓一个完全可行。核心拼图就一个：`claude -p`。

`claude -p`（即 `--print`，headless 模式）非交互地跑完一整个 agent loop——思考、调工具、改文件——跑完即退出。它读 stdin、写 stdout，可以像普通命令行工具一样接进管道。把每一步当成一次 `claude -p` 调用，外面用 shell 写编排循环，就是 DIY 版 Workflow：

```bash
# fan-out：10 个批次并行，每个起一个 claude -p
for f in batch_*.md; do
  claude -p "分析这个批次：$(cat $f)" --output-format json > "out_$f.json" &
done
wait                                    # ← 屏障，等全部跑完，对应 parallel()

# reduce：把 10 份结果拼起来，再起一个 claude -p 综合
claude -p "综合这些发现：$(cat out_*.json)" > report.md
```

对照一下，`&` 加 `wait` 就是 `parallel()` 的屏障，`$(cat ...)` 拼字符串就是 prompt 里的变量插值。社区里 futuresearch.ai 就用 `claude -p` 加文件系统轮询搭了一套 18 路并行的扫描流水线——子 agent 把结果写盘（成功写 `.json`、失败写 `.error`），编排器只轮询文件名而不把输出收进上下文，把复杂度从 O(n × 输出大小) 压到 O(n × 文件名)。

那官方 Workflow 比手搓版多了什么？模型没变，省掉的全是工程脏活：并发管控、结构化输出校验、错误恢复、进度展示、缓存命中。**Workflow 是把这套手搓 harness 产品化了，不是改变模型。** 理解这一层，对它的能力边界就有了底。

## 适用场景

不是每个任务都值得起一个 Workflow。它本质是用大量并行 agent 换效率，并行 agent 是实打实烧 token 的。

**该用的场景：**

- **代码库范围的批量排查**：全仓库 bug 扫描、安全审计、授权检查、危险模式加固。共同点是"搜索加独立验证"——并行搜遍整个服务，再对每个发现单独验证。
- **大规模迁移**：框架替换、API 弃用迁移、跨语言移植。Bun 是最极致的例子。
- **需要反复推敲的关键决策**：让 Claude 从多个独立角度各做一遍，再派对抗性的 agent 试图推翻这些结果，迭代到答案收敛。
- **长尾清**：像 overnight workflow，挂着自动扫描问题、逐个开 PR。

**不值得用的场景：**

- 一两步就能搞定的小修补。
- 需要中途频繁拍板的探索性工作——Workflow 执行期间不接收人工输入（除了权限弹窗）。
- 碰安全和支付等高风险代码的改动。

把 Claude Code 现有的几种协作原语放在一起，选型逻辑大致是：

| 场景 | 用哪个 |
| --- | --- |
| 主流程中派活搜索、读文件、跑命令 | Subagent |
| 多角色讨论、需要队员通信 | Agent Teams |
| 可复用的固定格式工作流 | Skill |
| 大规模并行、多阶段编排、循环验证 | Workflow |

一句话：需要"跑腿"用 subagent，需要"开会讨论"用 Agent Teams，需要"流水线作业"用 Workflow。

## Token 账单

官方说得很坦诚：**单次 Workflow 的 token 消耗明显高于一次普通 Claude Code 对话**。几十上百个 subagent 同时跑，每个都在烧 token，再叠加交叉验证、对抗式 review 这些"额外冗余"的设计，账单自然往上走。前面 133 会话的案例，11 个 agent 就吃掉了 81.8 万 token。

几条实用建议：

- 从**范围明确的小任务**开始，摸清花费再放大。
- 大规模运行前，用 `/model` 确认模型，并在不需要最强能力的阶段要求 Claude 用更小的模型。
- 提前把命令加进允许列表，避免中途被权限弹窗打断一个跑了几小时的任务。
- Workflow 随时可以叫停，已完成的工作不会白费。

## 已知限制

研究预览阶段，几个边界先摆在这：

- **运行中途不接受人工输入**：除了权限确认，不会停下来等你拍板。需要分段签核的流程得拆成多个独立 Workflow。
- **脚本本身没有文件系统权限**：读写全靠 subagent。
- **并发与总量封顶**：16 并发 / 1000 次 agent 调用。
- **跨会话不可恢复**：退出即从头。
- **自定义 Workflow 传参机制**还不够明确。
- 整个功能仍在研究预览，行为和约束可能随版本调整。

## 编排代码化

回到文章标题——"把编排逻辑搬进代码的新原语"。为什么"搬进代码"这件事本身值得认真对待？

第一，**编排从临场决策变成了可审计的资产**。模型在每次对话里临时决定"下一步干什么"，这是转瞬即逝的、不可复现的。把这段逻辑写成脚本存进 `.claude/workflows/`，它就变成了可以读、可以审、可以版本控制、可以在团队间共享的代码。这对工程实践的影响不小——你可以 review 一段编排逻辑，就像 review 任何一段代码一样。

第二，**扩展方式从"装更多上下文"变成了"让代码持有中间状态"**。长久以来，解决"任务太大"的思路是扩大上下文窗口——1M token、2M token。Workflow 走的是另一条路：上下文只放最终结果，中间过程交给脚本变量持有。这是一个从"堆容量"到"改架构"的转变。

第三，**它跟 Opus 4.8 同天发布不是巧合**。几百个 agent 并行、互相 review 彼此结论时，每个节点的可靠性就被放大了——节点是概率性的 LLM，多步流程里的不确定性会层层累积。Opus 4.8 这一代专门强化了"不放过自己不确定的东西"，这恰恰是交叉验证能成立的前提。强模型不是 Workflow 的可选项，是它的承重墙。

最后，把它和 Codex 的 Goals（持久目标）摆在一起看很有意思。两者都想解决"大任务怎么持续推进"，但路径相反：Codex Goals 押注的是**目标持久化**——把目标钉在那，让模型自己找路逼近；Claude Code Workflow 走的是**编排代码化**——把过程写成脚本，靠脚本保证不跑偏。一个管"往哪走"，一个管"怎么走"，是两个方向上的工程探索。哪条路跑得更远现在下结论还太早，但两家头部产品在"承载超大规模工作"这个问题上同时发力，本身就说明这是 AI Coding 下一阶段的核心命题。

## 总结

Dynamic Workflows 把一件事讲清楚了：当任务大到一次对话装不下时，不该期待模型更聪明地管理上下文，而该把编排逻辑从模型手里拿出来，写成代码。

它的核心设计选择很明确——**JavaScript 运行时做调度（确定性、无 LLM），subagent 做执行（有 LLM），主 Agent 只在收结果时介入**。这个分工让"数百个 agent 并行 + 交叉验证"成为可能，也让编排本身变成了可存、可审、可复用的代码。

边界同样清晰：它适合大规模排查、迁移和需要多轮对抗式验证的决策，不适合小修补、探索性工作和安全敏感改动。token 成本显著高于普通对话，值得跑之前算一笔账。

我个人判断是：一年之内，这套"模型现写编排脚本、调度一支 agent 舰队"的打法，会从一家的研究预览变成几乎所有 coding agent 的标配。不是因为它更"智能"，而是因为它把 agent 协作的工程复杂度从"模型能不能"变成了"代码怎么写"——而"代码怎么写"是一个更可控、更可改进的问题。
