---
title: CV
description: Curriculum vitae of Kai Zhou
lang: en
art: dots
---

[[toc]]

Master's student in Artificial Intelligence at Jilin University, focused on LLM and Agent algorithms. I build reliable multimodal agents, tool-using systems, and the infrastructure needed to train and evaluate them.

<p flex="~ gap-3 wrap" class="print:hidden">
  <a href="/cv/kai-zhou-resume.pdf" target="_blank"><span op75 i-ri-file-pdf-2-line /> View PDF</a>
  <a href="/cv/kai-zhou-resume.pdf" download><span op75 i-ri-download-line /> Download PDF</a>
  <a href="mailto:kaizhou0305@gmail.com"><span op75 i-ri-mail-line /> Email</a>
  <a href="https://github.com/zkforge" target="_blank"><span op75 i-simple-icons-github /> GitHub</a>
</p>

## Experience

### Dewu - Agent Algorithm Intern

_Multimodal E-commerce Customer Service Agent · Jul 2026 - Oct 2026_

- Iterated Agentic SFT data for complex multi-hop requests, low-quality images, new tools, and tool-failure recovery.
- Helped maintain 23 composable tools spanning visual processing, information retrieval, and business operations.
- Introduced Agentic RL over 8,000 difficult multi-hop questions in a real tool environment, using format, answer, and process-quality rewards.
- Improved GRPO credit assignment for long tool-use trajectories by truncating gradients after failed steps and selectively zeroing negative trajectory advantages.
- Raised accuracy from 64.6% to 71.8% on a 1,000-question evaluation set, reduced human handoff from 21.1% to 15.6%, and achieved a 99% tool success rate.

### NIO - Agent Development Intern

_Intelligent Engineering Review Platform · Mar 2026 - Jun 2026_

- Built a five-stage multimodal review pipeline for 2D engineering drawings: full-page review, YOLO layout detection, OCR, semantic matching, and focused second-pass review.
- Parsed long SOR documents with MinerU and PyMuPDF, preserving page, bounding-box, and block-level evidence for traceable conclusions.
- Orchestrated configurable review workflows with LangGraph, MySQL checkpoints, Neo4j, Milvus, and MinIO.
- Implemented asynchronous batch scheduling, retries, cancellation, callbacks, and WebSocket progress updates in a Docker Compose deployment.
- Reduced end-to-end review time from about two hours to under 20 minutes across roughly 300 real documents, lowered false positives by about 40%, and achieved around 90% first-pass human approval.

## Education

### Jilin University

_MEng in Artificial Intelligence · Sep 2025 - Jun 2028_

- Ranked 4/42, top 10%.
- Winner, CAD Wireframe Neural Compression Challenge.

### Nanjing University of Information Science and Technology

_BEng in Data Science and Big Data Technology · Sep 2021 - Jun 2025_

- Ranked 8/87, top 10%.
- National Encouragement Scholarship, Outstanding Student, Outstanding Graduate, CET-4, and CET-6.

## Open Source

- [cc-switch #4140](https://github.com/farion1231/cc-switch/pull/4140) - fixed shell configuration loading for provider terminals on macOS and Linux, with startup tests.
- [ByteDance DeerFlow #3897](https://github.com/bytedance/deer-flow/pull/3897) - fixed a missing PostgreSQL dependency in the Docker environment.
- [ByteDance DeerFlow #4797](https://github.com/bytedance/deer-flow/pull/4797) - isolated date context for sub-agents.

## Skills

- **Training and alignment:** GRPO, PPO, RLHF, RLVR, SFT data construction, reward design, verl, vLLM, PyTorch.
- **LLM systems:** RAG, Dense/BM25 retrieval, RRF, reranking, Milvus, LangGraph, Langfuse, MCP, Skills, multimodal document parsing and evaluation.
- **Engineering:** Python, FastAPI, MySQL, Redis, Linux, Git, Docker, microservices, CI/CD, asynchronous concurrency, WebSocket, SSE.
