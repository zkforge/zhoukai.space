<template>
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <title>周凯</title>
    <mask id="mask0_634_3" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="18" y="1" width="72" height="97">
      <path
        d="M26 39C34 37 42 35 42 38C39 44 34 48 30 51C36 50 41 50 44 55C48 62 42 78 36 87C31 95 27 93 29 86C32 75 41 63 47 51C48 38 47 18 52 9C55 5 57 8 56 14C55 24 50 34 47 40C45 46 46 51 48 54C52 60 58 59 60 54C62 49 60 44 56 45C51 46 48 52 50 58C55 66 61 71 67 72C72 73 77 67 79 61"
        fill="none" stroke="white" stroke-width="7" stroke-linecap="round"
      />
    </mask>
    <g mask="url(#mask0_634_3)">
      <path
        class="path1"
        d="M26 39C34 37 42 35 42 38C39 44 34 48 30 51C36 50 41 50 44 55C48 62 42 78 36 87C31 95 27 93 29 86C32 75 41 63 47 51C48 38 47 18 52 9C55 5 57 8 56 14C55 24 50 34 47 40C45 46 46 51 48 54C52 60 58 59 60 54C62 49 60 44 56 45C51 46 48 52 50 58C55 66 61 71 67 72C72 73 77 67 79 61"
        stroke="black" stroke-width="2.5" stroke-linecap="round"
      />
    </g>
  </svg>
</template>

<style scoped>
@media (prefers-reduced-motion) {
  .path1 {
    animation: none !important;
    stroke-dasharray: unset !important;
  }
}
@media print {
  .path1 {
    animation: none !important;
    stroke-dasharray: unset !important;
  }
}
@keyframes grow {
  0% {
    stroke-dashoffset: 1px;
    stroke-dasharray: 0 350px;
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  40% {
    stroke-dasharray: 350px 0;
  }
  85% {
    stroke-dasharray: 350px 0;
  }
  95%,
  to {
    stroke-dasharray: 0 350px;
  }
}
.path1 {
  stroke-dashoffset: 1px;
  stroke-dasharray: 350px 0;
  animation: grow 10s ease forwards infinite;
  transform-origin: center;
  stroke: #303030;
  animation-delay: 0s;
}
.dark .path1 {
  stroke: #fdfdfd;
}
</style>
