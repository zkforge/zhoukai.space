<script setup lang="ts">
interface Link {
  name: string
  desc: string
  link: string
  icon?: string
}

defineProps<{ links: Link[] }>()
</script>

<template>
  <div class="max-w-300 mx-auto">
    <div
      class="link-grid py-2 max-w-500 w-max mx-auto"
      grid="~ cols-1 md:cols-2 gap-4 lg:cols-3"
    >
      <a
        v-for="item in links"
        :key="item.link"
        class="item relative flex items-center"
        :href="item.link"
        target="_blank"
        :title="item.name"
      >
        <div v-if="item.icon" class="pt-2 pr-5">
          <div class="text-3xl opacity-50" :class="item.icon" />
        </div>
        <div class="flex-auto">
          <div class="text-normal">{{ item.name }}</div>
          <div class="desc text-sm opacity-50 font-normal" v-html="item.desc" />
        </div>
      </a>
    </div>
  </div>
</template>

<style scoped>
.link-grid a.item {
  background: transparent;
  font-size: 1.1rem;
  width: 350px;
  max-width: 100%;
  padding: 0.5rem 0.875rem 0.875rem;
  border-radius: 6px;
}

.link-grid a.item:hover {
  background: #88888811;
}
</style>
