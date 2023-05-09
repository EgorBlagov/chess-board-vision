import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';

import './assets/main.css';
import {
  BOARD_SIZE,
  Point,
  useBoardStatsStore,
  useBoardClickStore,
  usePause,
  useTimer,
  useTargetStore
} from './stores/stores';

async function waitMs(ms: number) {
  await new Promise<void>((resolve, _) => {
    setTimeout(resolve, ms);
  });
}

const app = createApp(App);

app.use(createPinia());

function randomChoose<T>(items: T[], weights: number[]) {
  if (items.length !== weights.length) {
    throw new Error('Items and Weights length mismatch');
  }

  const choice = Math.random() * weights.reduce((a, b) => a + b, 0);
  let total = 0;
  for (const [i, weight] of weights.entries()) {
    total += weight;
    if (choice <= total) {
      return items[i];
    }
  }

  throw new Error('Internal logic error');
}

function getNextTarget(previous: Point | null): Point {
  const boardState = useBoardStatsStore();
  const [min, max] = boardState.knowledgeLimits;
  const items: Point[] = [];
  const weights: number[] = [];

  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      const p = new Point(y, x);
      if (previous && p.equals(previous)) {
        continue;
      }
      items.push(p);
      const weight = 1 - boardState.cellInfo(p).knowledgeFactorNormalized(min, max) + 0.1;
      if (isNaN(weight)) {
        weights.push(0.5);
      } else {
        weights.push(weight);
      }
    }
  }
  return randomChoose(items, weights);
}

const MISTAKE_DELTA = -0.1;
const CORRECT_DELTA = 0.1;

async function showHover(targetPoint: Point) {
  const boardState = useBoardStatsStore();
  const pause = usePause();
  boardState.blink(targetPoint, true);
  await pause.waitUnhover();
  boardState.blink(targetPoint, false);
}

async function main() {
  const clicker = useBoardClickStore();
  const boardState = useBoardStatsStore();
  const timer = useTimer();
  const pause = usePause();
  const targetStore = useTargetStore();
  let firstClick = true;
  let targetPoint = null;
  while (true) {
    targetPoint = getNextTarget(targetPoint);
    targetStore.setTarget(targetPoint);
    timer.startTimer();
    const click = await Promise.any([clicker.waitClick(), pause.waitHover()]);
    timer.stopTimer();

    if (!(click instanceof Point)) {
      await showHover(targetPoint);
      continue;
    }

    if (targetPoint.equals(click)) {
      boardState.shift(targetPoint, CORRECT_DELTA);
      if (firstClick) {
        boardState.setTimeForAll(timer.timePassed);
        firstClick = false;
      }
      boardState.updateTime(targetPoint, timer.timePassed);
      continue;
    }
    boardState.shift(targetPoint, MISTAKE_DELTA);
    boardState.shift(click, MISTAKE_DELTA);

    boardState.blink(targetPoint, true);
    const result = await Promise.any([waitMs(2000), clicker.waitClick(), pause.waitHover()]);
    if (typeof result === 'boolean') {
      await showHover(targetPoint);
      continue;
    }

    boardState.blink(targetPoint, false);
  }
}

main().catch((ex) => console.error(ex));
app.mount('#app');
