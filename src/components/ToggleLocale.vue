<script setup lang='ts'>
import { locale, t, toggleLocale } from '~/logics'
</script>

<template>
  <a
    class="toggle-locale select-none"
    role="button"
    :title="t('切换到英文', 'Switch to Chinese')"
    :aria-label="t('切换到英文', 'Switch to Chinese')"
    :aria-pressed="locale === 'en'"
    @click="toggleLocale"
  >
    <span class="i18n-zh" lang="zh-CN">中</span>
    <span class="i18n-en" lang="en">EN</span>
  </a>
</template>

<style scoped>
.toggle-locale {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.5em;
  height: 1.2em;
  font-size: 0.95em;
  font-weight: 500;
  line-height: 1;
  letter-spacing: 0.02em;
}
</style>
