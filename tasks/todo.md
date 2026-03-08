# 当前任务：在 OpenClaw 部署文章追加更新说明

## 计划

- [x] 定位目标文章与上下文结构
- [x] 在文章中追加“更新”段落，说明 `tools.profile = full`
- [x] 检查 Markdown 格式与内容准确性

## 变更说明（已完成）

- 已定位目标文件：`src/data/blog/2026/02/openclaw-feishu-tutorial.md`
- 已新增“更新（2026-03-08）”段落，说明默认 Web 功能关闭及 `openclaw.json` 的 `tools.profile` 调整方式

## 审查

- 通过 `pnpm build` 验证，构建成功（`astro check`、静态构建、`pagefind` 全部通过）
