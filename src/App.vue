<script setup lang="ts">
import ChessBoard from './components/ChessBoard.vue';
import InfoBar from './components/InfoBar.vue';
import { BOARD_SIZE } from './stores/stores';
</script>

<template>
    <div class="container">
      <div class="child-container">
        <InfoBar />
        <div class="board-square">
          <ChessBoard :size="BOARD_SIZE" />
        </div>
      </div>
    </div>
</template>

<style scoped>
.container {
  display: flex;
  align-items: center;

  justify-content: center;
  width: 100vw;
  height: 100vh;
  flex-direction: column;
}

.child-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1em;
}
.board-square {
  aspect-ratio: 1 / 1;
  height: 80vmin;
  width: 80vmin;
}
</style>
