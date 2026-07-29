<script setup lang="ts">
defineProps<{
  github?: string
  collective?: string
  afdian?: string
}>()
</script>

<template>
  <p v-if="github || collective || afdian" flex="~ gap-2 wrap">
    <SponsorButtonCollective v-if="collective" :href="collective" />
    <a
      v-if="github"
      :href="github"
      target="_blank"
      class="group btn-rose inline-block"
    >
      <div
        i-ph-heart-duotone
        group-hover="i-ph-heart-fill text-rose"
        transition-all duration-200 ease-out
      />
      GitHub Sponsors
    </a>
    <a
      v-if="afdian"
      :href="afdian"
      target="_blank"
      class="group btn-yellow inline-block"
    >
      <div
        i-ph-lightning-duotone
        group-hover="i-ph-lightning-fill text-yellow"
        transition-all duration-200 ease-out
      />
      爱发电
    </a>
  </p>
</template>
