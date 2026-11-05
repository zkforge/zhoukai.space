<script setup lang="ts">
defineProps<{
  zh: string
  en: string
}>()
</script>

<template>
  <span class="i18n-zh" lang="zh-CN">{{ zh }}</span><span class="i18n-en" lang="en">{{ en }}</span>
</template>
