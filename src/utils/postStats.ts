export interface PostStats {
  wordCount: number;
  readingMinutes: number;
}

const FENCED_CODE_BLOCK = /```[\s\S]*?```/g;
const INLINE_CODE = /`[^`\n]+`/g;
const CJK_CHAR = /[\u3400-\u9fff\uf900-\ufaff]/g;
const LATIN_WORD = /[A-Za-z0-9]+(?:[-'][A-Za-z0-9]+)*/g;

function countTextUnits(text: string) {
  const cjkCount = text.match(CJK_CHAR)?.length ?? 0;
  const latinCount = text.replace(CJK_CHAR, " ").match(LATIN_WORD)?.length ?? 0;

  return cjkCount + latinCount;
}

export function getPostStats(markdown: string): PostStats {
  const codeBlocks = markdown.match(FENCED_CODE_BLOCK) ?? [];
  const prose = markdown
    .replace(FENCED_CODE_BLOCK, " ")
    .replace(INLINE_CODE, " ");

  const proseCount = countTextUnits(prose);
  const codeCount = countTextUnits(codeBlocks.join("\n"));

  // 技术文章通常包含较多命令和配置片段，代码块计入统计但降低阅读权重。
  const wordCount = proseCount + Math.round(codeCount * 0.35);
  const readingMinutes = Math.max(1, Math.ceil(wordCount / 450));

  return { wordCount, readingMinutes };
}
