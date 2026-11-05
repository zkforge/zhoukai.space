<script setup lang="ts">
import raw from '../../../photos/data'
import { galleryView, t } from '../../logics'

const props = defineProps<{
  limit?: number
}>()

const photos = computed(() => {
  if (props.limit)
    return raw.slice(0, props.limit)
  return raw
})

function toggleView() {
  galleryView.value = galleryView.value === 'cover' ? 'contain' : 'cover'
}
</script>

<template>
  <div flex="~ gap-1 col items-center justify-center" absolute sm:fixed left-6 top-20>
    <button
      :title="t('切换视图', 'Switch view')"
      rounded-full p2 op20 hover="op100 bg-#8881"
      @click="toggleView"
    >
      <div :class="galleryView === 'cover' ? 'i-ri-grid-line' : 'i-ri-layout-masonry-line'" />
    </button>
  </div>
  <PhotoGrid :photos="photos" :view="galleryView" />
</template>
