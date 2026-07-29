<script setup lang="ts">
defineProps<{
  href: string
}>()
</script>

<template>
  <a
    :href="href"
    target="_blank"
    class="group btn-rose text-base p2 px3 pr2"
  >
    <div
      i-ph-hand-heart-duotone
      group-hover="i-ph-hand-heart-fill text-rose"
      transition-all duration-200 ease-out
    />
    Open Collective
  </a>
</template>
