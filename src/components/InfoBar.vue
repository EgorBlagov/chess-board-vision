<script setup lang="ts">
import { usePause, useTimer, useTargetStore } from '@/stores/stores';

const pauseStore = usePause();
const timerStore = useTimer();
const targetStore = useTargetStore();
</script>

<template>
  <div class="body">
    <div class="header">Chess board Vision</div>
    <div class="controls">
      <div
        class="pause-bar"
        @mouseenter="pauseStore.onHover(true)"
        @mouseleave="pauseStore.onHover(false)"
      >
        ⏸
      </div>
      <div
        class="current-color"
        :class="{ white: targetStore.isWhite }"
        @click="targetStore.toggle()"
      >
        {{ targetStore.isWhite ? 'white' : 'black' }}
      </div>
      <div class="target-code">
        <div :class="{ white: targetStore.isWhite }">{{ targetStore.code }}</div>
      </div>
      <div class="filler"></div>
      <div class="time">{{ timerStore.timePassed.toFixed(2) }}s</div>
    </div>
  </div>
</template>

<style scoped>
.body {
  display: flex;
  flex-direction: column;
  align-items: center;
  user-select: None;
  width: 100%;
}

.controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5em;
  font-size: 5vmin;
  width: 100%;
}

.header {
  font-size: 5vmin;
}

.filler {
  flex: 1 1 auto;
}
.pause-bar {
  opacity: 0.5;
  background-color: black;
  color: white;
  padding-left: 0.3em;
  padding-right: 0.3em;
  border-radius: 0.2em;
}

.current-color {
  font-weight: 900;
  cursor: pointer;
}

.target-code {
  font-weight: 900;
}
.time {
  font-family: 'Lucida Console', 'Courier New', monospace;
  font-weight: 900;
}
.white {
  color: white;
  text-shadow: 0 0 2px #000, 0 0 2px #000, 0 0 2px #000;
}
</style>
