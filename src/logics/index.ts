import dayjs from 'dayjs'

export const isDark = useDark()
export const englishOnly = useLocalStorage('zhoukai-english-only', false)
export const galleryView = useLocalStorage<'cover' | 'contain'>('zhoukai-gallery-view', 'cover')

// Visible copy renders both languages and CSS hides the inactive one (see main.css),
// so SSG output and hydration stay stable. The inline script in index.html applies the
// saved choice before paint; App.vue syncs this ref on mount for attributes and titles.
export const locale = ref<'zh' | 'en'>('zh')

export function toggleLocale() {
  locale.value = locale.value === 'zh' ? 'en' : 'zh'
  document.documentElement.classList.toggle('lang-en', locale.value === 'en')
  document.documentElement.lang = locale.value === 'en' ? 'en' : 'zh-CN'
  localStorage.setItem('zhoukai-locale', locale.value)
}

export function t(zh: string, en: string) {
  return locale.value === 'en' ? en : zh
}

/**
 * Credit to [@hooray](https://github.com/hooray)
 * @see https://github.com/vuejs/vitepress/pull/2347
 */
export function toggleDark(event: MouseEvent) {
  // @ts-expect-error experimental API
  const isAppearanceTransition = document.startViewTransition
    && !window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (!isAppearanceTransition) {
    isDark.value = !isDark.value
    return
  }

  const x = event.clientX
  const y = event.clientY
  const endRadius = Math.hypot(
    Math.max(x, innerWidth - x),
    Math.max(y, innerHeight - y),
  )
  const transition = document.startViewTransition(async () => {
    isDark.value = !isDark.value
    await nextTick()
  })
  transition.ready
    .then(() => {
      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`,
      ]
      document.documentElement.animate(
        {
          clipPath: isDark.value
            ? [...clipPath].reverse()
            : clipPath,
        },
        {
          duration: 400,
          easing: 'ease-out',
          fill: 'forwards',
          pseudoElement: isDark.value
            ? '::view-transition-old(root)'
            : '::view-transition-new(root)',
        },
      )
    })
}

export function formatDate(d: string | Date, onlyDate = true, lang: 'zh' | 'en' = 'en') {
  const date = dayjs(d)
  if (onlyDate || date.year() === dayjs().year())
    return date.format(lang === 'zh' ? 'M月D日' : 'MMM D')
  return date.format(lang === 'zh' ? 'YYYY年M月D日' : 'MMM D, YYYY')
}
