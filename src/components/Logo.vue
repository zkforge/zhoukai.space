<template>
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <title>周凯</title>
    <circle cx="50" cy="50" r="38" class="ring" />
    <path class="mark" d="M25 32H48L25 68H48M59 32V68M59 50L77 32M59 50L78 68" />
  </svg>
</template>

<style scoped>
.ring,
.mark {
  stroke: #303030;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.ring {
  stroke-width: 3;
  opacity: 0.25;
}
.mark {
  stroke-width: 5;
}
.dark .ring,
.dark .mark {
  stroke: #fdfdfd;
}
</style>
