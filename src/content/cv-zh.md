[[toc]]

吉林大学人工智能专业硕士在读，专注于大模型与 Agent 算法。我致力于构建可靠的多模态 Agent、工具调用系统，以及训练和评测它们所需的基础设施。

<p flex="~ gap-3 wrap" class="print:hidden">
  <a href="/cv/kai-zhou-resume.pdf" target="_blank"><span op75 i-ri-file-pdf-2-line /> 查看 PDF</a>
  <a href="/cv/kai-zhou-resume.pdf" download><span op75 i-ri-download-line /> 下载 PDF</a>
  <a href="mailto:kaizhou0305@gmail.com"><span op75 i-ri-mail-line /> 邮件</a>
  <a href="https://github.com/zkforge" target="_blank"><span op75 i-simple-icons-github /> GitHub</a>
</p>

## 实习经历

### 得物 - Agent 算法实习生

_多模态电商客服 Agent 系统 · 2026.7 - 2026.10_

- 针对复杂多跳请求、低质量图片、新增工具和工具调用失败恢复等场景，迭代 Agentic SFT 数据。
- 参与维护 23 个可组合工具，覆盖视觉处理、信息检索和业务操作。
- 在真实工具环境中，基于 8,000 道高难度多跳问题引入 Agentic RL，并设计格式、答案和过程质量奖励。
- 针对长工具调用轨迹改进 GRPO 的信用分配：在失败 step 处截断后续梯度，并对负向轨迹的 advantage 做单侧归零。
- 在 1,000 题评测集上将准确率从 64.6% 提升至 71.8%，转人工率从 21.1% 降至 15.6%，工具成功率达到 99%。

### 蔚来 - Agent 开发实习生

_蔚来汽车智能审核平台 · 2026.3 - 2026.6_

- 为 2D 工程图纸设计“全图粗审 → YOLO 布局检测 → OCR 精识别 → 语义匹配 → 二次细审”五阶段多模态审核 Pipeline。
- 使用 MinerU 和 PyMuPDF 解析长篇 SOR 文档，保留页码、边界框和块级证据，使结论可追溯。
- 基于 LangGraph、MySQL checkpoint、Neo4j、Milvus 和 MinIO 编排可配置的审核工作流。
- 在 Docker Compose 部署中实现异步批量调度、重试、取消、回调和 WebSocket 进度推送。
- 在约 300 份真实文档上，将端到端审核耗时从约两小时缩短至 20 分钟以内，误报减少约 40%，人工一次通过率约 90%。

## 教育背景

### 吉林大学

_人工智能专业 · 硕士 · 2025.9 - 2028.6_

- 专业排名 4/42，前 10%。
- CAD Wireframe 神经压缩挑战赛优胜奖。

### 南京信息工程大学

_数据科学与大数据技术专业 · 本科 · 2021.9 - 2025.6_

- 专业排名 8/87，前 10%。
- 国家励志奖学金、校三好学生、优秀毕业生，通过 CET-4、CET-6。

## 开源贡献

- [cc-switch #4140](https://github.com/farion1231/cc-switch/pull/4140) - 修复 macOS 和 Linux 上服务商终端的 Shell 配置加载问题，并补充启动测试。
- [ByteDance DeerFlow #3897](https://github.com/bytedance/deer-flow/pull/3897) - 修复 Docker 环境中缺失的 PostgreSQL 依赖。
- [ByteDance DeerFlow #4797](https://github.com/bytedance/deer-flow/pull/4797) - 为子 Agent 隔离日期上下文。

## 技能

- **训练与对齐：** GRPO、PPO、RLHF、RLVR、SFT 数据构建、奖励设计、verl、vLLM、PyTorch。
- **大模型系统：** RAG、Dense/BM25 检索、RRF、重排序、Milvus、LangGraph、Langfuse、MCP、Skills、多模态文档解析与评测。
- **工程能力：** Python、FastAPI、MySQL、Redis、Linux、Git、Docker、微服务、CI/CD、异步并发、WebSocket、SSE。
