<script setup lang='ts'>
import { t, toggleDark } from '~/logics'
</script>

<template>
  <a class="select-none" :title="t('切换深浅色', 'Toggle color scheme')" @click="toggleDark">
    <div i-ri-sun-line dark:i-ri-moon-line />
  </a>
</template>
