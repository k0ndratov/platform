<script setup>
/**
 * Decorative "staircase" ribbon used in the School 21 design.
 * `blocks` is a list of rounded squares. Consecutive blocks are connected
 * with a thin diagonal band (top-right corner -> bottom-left corner).
 */
import { computed, useId } from 'vue'

const props = defineProps({
  blocks: { type: Array, required: true }, // [{ x, y, s }]
  from: { type: String, default: '#25c1cb' },
  to: { type: String, default: '#3f95d2' },
  mid: { type: String, default: '' },
  angle: { type: Number, default: 90 },
  width: { type: Number, default: 460 },
  height: { type: Number, default: 560 },
  band: { type: Number, default: 10 },
  radius: { type: Number, default: 20 },
})

const id = useId()

const path = computed(() => {
  const w = props.band
  const parts = []
  props.blocks.forEach((b, i) => {
    parts.push(`M${b.x} ${b.y} h${b.s} v${b.s} h${-b.s} Z`)
    const n = props.blocks[i + 1]
    if (!n) return
    if (n.y + n.s <= b.y) {
      // Next block is up-right: band from top-right corner of b to bottom-left corner of n
      const ax = b.x + b.s, ay = b.y
      const bx = n.x, by = n.y + n.s
      parts.push(`M${ax - w} ${ay} L${bx} ${by - w} L${bx + w} ${by} L${ax} ${ay + w} Z`)
    } else {
      // Next block is down-right: band from bottom-right corner of b to top-left corner of n
      const ax = b.x + b.s, ay = b.y + b.s
      const bx = n.x, by = n.y
      parts.push(`M${ax - w} ${ay} L${bx} ${by + w} L${bx + w} ${by} L${ax} ${ay - w} Z`)
    }
  })
  return parts.join(' ')
})

const gradientCoords = computed(() => {
  const a = (props.angle * Math.PI) / 180
  return {
    x1: `${50 - Math.cos(a) * 50}%`,
    y1: `${50 - Math.sin(a) * 50}%`,
    x2: `${50 + Math.cos(a) * 50}%`,
    y2: `${50 + Math.sin(a) * 50}%`,
  }
})
</script>

<template>
  <svg
    class="ribbon"
    :viewBox="`0 0 ${width} ${height}`"
    :width="width"
    :height="height"
    aria-hidden="true"
  >
    <defs>
      <linearGradient :id="id" v-bind="gradientCoords">
        <stop offset="0" :stop-color="from" />
        <stop v-if="mid" offset="0.5" :stop-color="mid" />
        <stop offset="1" :stop-color="to" />
      </linearGradient>
    </defs>
    <path
      :d="path"
      :fill="`url(#${id})`"
      :stroke="`url(#${id})`"
      :stroke-width="radius"
      stroke-linejoin="round"
      fill-rule="nonzero"
    />
    <slot />
  </svg>
</template>

<style scoped>
.ribbon {
  display: block;
  pointer-events: none;
  overflow: visible;
}
</style>
