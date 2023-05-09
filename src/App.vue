<script setup lang="ts">
import ChessBoard from './components/ChessBoard.vue';
import InfoBar from './components/InfoBar.vue';
import { BOARD_SIZE } from './stores/stores';
</script>

<template>
  <main>
    <div class="container">
      <div class="child-container">
        <InfoBar />
        <div class="board-square">
          <ChessBoard :size="BOARD_SIZE" />
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.container {
  display: flex;
  align-items: center;

  justify-content: center;
  width: 100vw;
  height: 100vh;
}

.child-container {
  display: flex;
  flex-direction: column;
  gap: 1em;
}
.board-square {
  aspect-ratio: 1/1;
  height: 80vmin;
}
</style>
