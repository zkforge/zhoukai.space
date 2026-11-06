<script setup lang="ts">
import { t } from '~/logics'

function toTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
}

const { y: scroll } = useWindowScroll()
</script>

<template>
  <header class="header z-40">
    <RouterLink
      class="w-12 h-12 absolute xl:fixed m-5 select-none outline-none"
      to="/"
      focusable="false"
    >
      <Logo />
    </RouterLink>
    <button
      :title="t('回到顶部', 'Scroll to top')"
      fixed right-3 bottom-3 w-10 h-10 hover:op100 rounded-full
      hover-bg-hex-8883 transition duration-300 z-100 print:hidden
      :class="scroll > 300 ? 'op30' : 'op0! pointer-events-none'"
      @click="toTop()"
    >
      <div i-ri-arrow-up-line />
    </button>
    <nav class="nav">
      <div class="spacer" />
      <div class="right" print:op0>
        <RouterLink class="nav-item" to="/portfolio" :title="t('作品集', 'Portfolio')">
          <div i-ri-lightbulb-line />
          <I18n zh="作品集" en="Portfolio" />
        </RouterLink>
        <RouterLink class="nav-item" to="/posts" :title="t('博客', 'Blog')" :aria-label="t('博客', 'Blog')">
          <div i-ri-article-line />
        </RouterLink>
        <RouterLink class="nav-item" to="/photos" :title="t('照片', 'Photos')" :aria-label="t('照片', 'Photos')">
          <div i-ri-camera-3-line />
        </RouterLink>
        <!-- <RouterLink class="nav-item" to="/nav" title="Links">
          <div i-ri-compass-3-line />
          <span class="lt-md:hidden">Links</span>
        </RouterLink> -->
        <a href="https://bsky.app/profile/zhoukai.space" target="_blank" title="Bluesky" aria-label="Bluesky" class="lt-md:hidden">
          <div i-ri-bluesky-line />
        </a>
        <a href="https://github.com/zkforge" target="_blank" title="GitHub" class="lt-md:hidden">
          <div i-uil-github-alt />
        </a>
        <a href="/feed.xml" target="_blank" title="RSS" class="lt-md:hidden">
          <div i-ri-rss-line />
        </a>
        <ToggleLocale />
        <ToggleTheme />
      </div>
    </nav>
  </header>
</template>

<style scoped>
.header h1 {
  margin-bottom: 0;
}

.logo {
  position: absolute;
  top: 1.5rem;
  left: 1.5rem;
}

.nav {
  padding: 2rem;
  width: 100%;
  display: grid;
  grid-template-columns: auto max-content;
  box-sizing: border-box;
}

.nav > * {
  margin: auto;
}

.nav img {
  margin-bottom: 0;
}

.nav a {
  cursor: pointer;
  text-decoration: none;
  color: inherit;
  transition: opacity 0.2s ease;
  opacity: 0.6;
  outline: none;
}

.nav a:hover {
  opacity: 1;
  text-decoration-color: inherit;
}

.nav .right {
  display: grid;
  grid-gap: 1.2rem;
  grid-auto-flow: column;
}

.nav .right > * {
  margin: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}
</style>
