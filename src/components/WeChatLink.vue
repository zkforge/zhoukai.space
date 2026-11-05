<script setup lang="ts">
import confetti from 'canvas-confetti'
import { t } from '~/logics'

const props = defineProps<{
  wechatId: string
}>()

const colors = ['#ff4d6d', '#ffb703', '#2ec4b6', '#4895ef', '#9b5de5', '#f15bb5', '#07c160']
const status = ref<'copied' | 'failed' | ''>('')
const button = ref<HTMLButtonElement | null>(null)
let resetTimer: ReturnType<typeof setTimeout> | undefined

const { copy, copied, isSupported } = useClipboard()

function launchConfetti() {
  const rect = button.value?.getBoundingClientRect()
  if (!rect)
    return

  try {
    const y = (rect.top + rect.height / 2) / window.innerHeight
    const leftOrigin = { x: Math.max(0, (rect.left - 4) / window.innerWidth), y }
    const rightOrigin = { x: Math.min(1, (rect.right + 4) / window.innerWidth), y }
    const centerOrigin = { x: (rect.left + rect.width / 2) / window.innerWidth, y }

    for (const [angle, origin] of [[60, leftOrigin], [120, rightOrigin]] as const) {
      confetti({
        particleCount: 20,
        angle,
        spread: 44,
        startVelocity: 31,
        gravity: 0.82,
        decay: 0.9,
        ticks: 88,
        scalar: 0.8,
        origin,
        colors,
        shapes: ['square', 'circle', 'star'],
        disableForReducedMotion: true,
      })
    }

    confetti({
      particleCount: 12,
      spread: 360,
      startVelocity: 20,
      gravity: 0.9,
      decay: 0.91,
      ticks: 82,
      scalar: 0.65,
      origin: centerOrigin,
      colors,
      shapes: ['star', 'circle'],
      disableForReducedMotion: true,
    })
  }
  catch (error) {
    console.error('Could not play the copy confirmation animation.', error)
  }
}

async function copyWechatId() {
  try {
    if (!isSupported.value)
      throw new Error('Clipboard API is unavailable')

    await copy(props.wechatId)
    if (!copied.value)
      throw new Error('Clipboard write did not complete')

    status.value = 'copied'
    launchConfetti()
  }
  catch {
    status.value = 'failed'
  }

  if (resetTimer)
    clearTimeout(resetTimer)
  resetTimer = setTimeout(() => status.value = '', 1800)
}

onBeforeUnmount(() => {
  if (resetTimer)
    clearTimeout(resetTimer)
})
</script>

<template>
  <button
    ref="button"
    type="button"
    class="wechat-copy"
    :aria-label="`${t('复制微信号', 'Copy WeChat ID')} ${wechatId}`"
    @click="copyWechatId"
  >
    <span class="wechat-label">
      <span aria-hidden="true" class="wechat-icon i-simple-icons-wechat op75" />
      <span class="wechat-text"><I18n zh="微信" en="WeChat" /></span>
    </span>
    <span class="wechat-tooltip" :class="{ 'is-visible': !!status }" aria-hidden="true">
      <I18n v-if="status === 'copied'" zh="已复制！" en="Copied!" />
      <I18n v-else-if="status === 'failed'" zh="复制失败" en="Copy failed" />
      <template v-else>
        {{ wechatId }}
      </template>
    </span>
    <span class="sr-only" aria-live="polite">
      {{ status === 'copied' ? t('微信号已复制', 'WeChat ID copied') : status === 'failed' ? t('无法复制微信号', 'Could not copy WeChat ID') : '' }}
    </span>
  </button>
</template>

<style scoped>
.wechat-copy {
  position: relative;
  display: inline-flex;
  align-items: center;
  padding: 0;
  border: 0;
  border-bottom: 1px solid rgba(125, 125, 125, 0.3);
  color: var(--fg-deeper);
  font: inherit;
  line-height: inherit;
  background: none;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: border 0.3s ease-in-out;
}

.wechat-copy:hover,
.wechat-copy:focus-visible {
  border-bottom-color: var(--fg);
}

.wechat-label {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  white-space: nowrap;
}

.wechat-icon {
  width: 1.2em;
  height: 1.2em;
}

.wechat-copy:focus-visible {
  outline: 2px solid #07c160;
  outline-offset: 3px;
  border-radius: 2px;
}

.wechat-tooltip {
  position: absolute;
  z-index: 10;
  bottom: calc(100% + 0.65rem);
  left: 50%;
  padding: 0.3rem 0.55rem;
  border: 1px solid color-mix(in srgb, var(--fg) 14%, transparent);
  border-radius: 0.4rem;
  color: var(--fg-deeper);
  background: var(--c-bg);
  box-shadow: 0 4px 14px #0002;
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 0.8rem;
  font-weight: 400;
  line-height: 1.4;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transform: translate(-50%, 0.2rem);
  transition:
    opacity 120ms ease,
    transform 120ms ease;
}

.wechat-copy:hover .wechat-tooltip,
.wechat-copy:focus-visible .wechat-tooltip,
.wechat-copy:active .wechat-tooltip {
  opacity: 1;
  transform: translate(-50%, 0);
}

.wechat-tooltip.is-visible {
  opacity: 1;
  transform: translate(-50%, 0);
}

@media (prefers-reduced-motion: reduce) {
  .wechat-tooltip {
    transition: none;
  }
}
</style>
