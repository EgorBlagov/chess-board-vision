<script setup lang="ts">
import { usePause, useTargetStore } from '@/stores/stores';
import ChessCell from './ChessCell.vue';

defineProps<{
  size: number;
}>();

const target = useTargetStore();
const pauseStore = usePause();
</script>

<template>
  <div class="board">
    <div class="row" v-for="(_, rowIndex) in size">
      <ChessCell v-for="(_, columnIndex) in size" :row="rowIndex" :column="columnIndex" />
    </div>

    <Transition appear>
      <div
        :key="target.code"
        class="code"
        :class="{ white: target.isWhite, 'hide-code': pauseStore.isHovered }"
      >
        <div>{{ target.code }}</div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.row {
  display: flex;
  flex: auto;
}

.board {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column-reverse;
}

.white {
  color: white;
  text-shadow: 0 0 2px #000, 0 0 2px #000, 0 0 2px #000;
}
.code {
  position: absolute;
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: 10em;
  font-weight: 900;
  opacity: 0;
}

.hide-code {
  opacity: 0%;
}


.v-enter-active {
  transition: opacity 2s ease;
}
.v-enter-from {
  opacity: 100%;
}
.v-enter-to {
  opacity: 0%;
}
</style>
