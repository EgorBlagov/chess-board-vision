<script setup lang="ts">
import { Point, useBoardStatsStore, useBoardClickStore, usePause } from '@/stores/stores';
import { computed } from 'vue';

const props = defineProps<{
  row: number;
  column: number;
}>();

const store = useBoardStatsStore();
const clicker = useBoardClickStore();
const pause = usePause();

const point = computed(() => new Point(props.column, props.row));
const cellInfo = computed(() => store.cellInfo(point.value));
const percent = computed(() => {
  const [min, max] = store.knowledgeLimits;
  const res = cellInfo.value.knowledgeFactorNormalized(min, max);
  if (isNaN(res)) {
    return 0.5;
  }

  return res;
});

const lightness = computed(() => {
  const res = (percent.value * 0.8 + 0.2) * 100;
  return res;
});
// conditional info hover show
</script>

<template>
  <div class="cell" :class="{ bright: (row + column) % 2 }" @click="clicker.clickCell(point)">
    <div class="blinker" :class="{ blink: cellInfo.blink }"></div>
    <div
      class="info"
      :style="{ backgroundColor: `hsl(0,0%,${lightness}%)`, opacity: pause.isHovered ? 1 : 0 }"
    >
      <div class="rating">{{ (cellInfo.rating * 100).toFixed(0) }}%</div>
      <div class="time">~{{ cellInfo.avgTime.toFixed(2) }}s</div>
    </div>
  </div>
</template>

<style scoped>
.cell {
  /* width: v-bind(cellSize);
  height: v-bind(cellSize); */
  flex: auto;
  background-color: rgb(181, 136, 99);
  user-select: none;
  border-color: transparent;
  position: relative;
}

.bright {
  background-color: #f0d9b5;
}

.info {
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 0.75em;
  transition: all 500ms;
}

.rating {
  font-weight: 900;
}

.blinker {
  z-index: 100;
  width: 100%;
  height: 100%;
  position: absolute;
  background-color: rgb(47, 255, 0);
  opacity: 0%;
  mix-blend-mode: hard-light;
}

.blink {
  animation: blink-animation 400ms steps(8, start) infinite alternate;
  animation-timing-function: ease-in-out;
}

.time {
  opacity: 60%;
}

@keyframes blink-animation {
  to {
    opacity: 100%;
  }
}
</style>
