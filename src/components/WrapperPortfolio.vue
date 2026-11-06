<script setup lang="ts">
import { formatDate } from '~/logics'

const { frontmatter, video, date } = defineProps({
  frontmatter: {
    type: Object,
    required: true,
  },
  video: {
    type: String,
  },
  date: {
    type: String,
    required: true,
  },
})

const githubRepo = computed(() => /^https:\/\/github\.com\/([^/]+\/[^/#?]+)\/?$/.exec(frontmatter.link ?? '')?.[1])
const stars = ref<number | undefined>(frontmatter.stars)

onMounted(async () => {
  if (!githubRepo.value)
    return

  try {
    const response = await fetch(`https://api.github.com/repos/${githubRepo.value}`)
    if (!response.ok)
      return

    const repo = await response.json()
    if (typeof repo.stargazers_count === 'number')
      stars.value = repo.stargazers_count
  }
  catch {
    // Keep the recorded count when GitHub is unavailable or rate limited.
  }
})
</script>

<template>
  <div>
    <a
      border="~ base rounded-lg" block of-hidden
      class="group"
      hover="scale-101 shadow-xl z-10" transition-all duration-500 bg-base relative
      :href="frontmatter.link"
      target="_blank"
      rel="noopener noreferrer"
    >
      <video
        v-if="video"
        :src="video"
        w-full autoplay loop muted playsinline border="b base"
      />

      <div class="prose prose-sm p4 m0 pb3">
        <slot />
        <div flex="~ items-center justify-between gap-3" text-sm pt2>
          <span op50>
            <I18n :zh="formatDate(date, false, 'zh')" :en="formatDate(date, false)" />
          </span>
          <span
            v-if="githubRepo && stars != null"
            class="inline-flex items-center gap-1.5 rounded-full px2 py0.5 text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800"
            :aria-label="`${stars} GitHub stars`"
            :title="`${stars} GitHub stars`"
          >
            <span class="i-ri-star-fill text-[#EAC54F]" aria-hidden="true" />
            <span font-mono tabular-nums>{{ stars.toLocaleString('en-US') }}</span>
          </span>
        </div>
      </div>
    </a>
  </div>
</template>
