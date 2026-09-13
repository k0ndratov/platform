<script setup>
defineProps({
  size: { type: Number, default: 140 },
})
// Pixel "21" drawn on a 7x7 grid inside the square
const cells = [
  // "2"
  [0, 0], [1, 0], [2, 0],
  [2, 1],
  [0, 2], [1, 2], [2, 2],
  [0, 3],
  [0, 4], [1, 4], [2, 4],
  // "1"
  [4, 0], [5, 0],
  [5, 1], [5, 2], [5, 3], [5, 4],
]
</script>

<template>
  <svg class="logo" :width="size" :height="size" viewBox="0 0 140 140" aria-label="School 21">
    <rect width="140" height="140" rx="22" fill="#2ad6c9" />
    <g transform="translate(26 30)" fill="#1d2633">
      <rect v-for="([x, y], i) in cells" :key="i" :x="x * 11" :y="y * 11" width="10.5" height="10.5" rx="1.5" />
    </g>
    <text
      x="102"
      y="30"
      transform="rotate(90 102 30)"
      font-size="10"
      font-weight="800"
      letter-spacing="2.5"
      fill="#1d2633"
      font-family="Manrope, sans-serif"
    >
      SCHOOL
    </text>
    <text x="70" y="119" text-anchor="middle" font-size="12" font-weight="800" fill="#1d2633" font-family="Manrope, sans-serif">
      ⊘ SBER
    </text>
  </svg>
</template>

<style scoped>
.logo {
  display: block;
}
</style>
