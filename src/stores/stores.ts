import { ref, computed, type Ref, watchEffect, watch } from 'vue';
import { defineStore } from 'pinia';

export const BOARD_SIZE: number = 8;

export const useCounterStore = defineStore('counter', () => {
  const count = ref(0);
  const doubleCount = computed(() => count.value * 2);
  function increment() {
    count.value++;
  }

  return { count, doubleCount, increment };
});

export class Point {
  column: number;
  row: number;

  constructor(column: number, row: number) {
    this.column = column;
    this.row = row;
  }

  code(isWhite: boolean): string {
    let [row, column] = [this.row, this.column];
    if (!isWhite) {
      column = BOARD_SIZE - 1 - column;
      row = BOARD_SIZE - 1 - row;
    }
    return 'abcdefgh'[column] + (1 + row);
  }

  equals(rhs: Point): boolean {
    return this.column === rhs.column && this.row == rhs.row;
  }
}

export class CellData {
  static TIME_CAPACITY = 5;
  times: number[];
  rating: number;
  blink: boolean;

  constructor() {
    this.times = [];
    this.rating = 0.5;
    this.blink = false;
  }

  shift(delta: number) {
    this.rating += delta;
    this.rating = Math.min(1, this.rating);
    this.rating = Math.max(0, this.rating);
  }

  updateTime(time: number) {
    this.times.push(time);
    if (this.times.length > CellData.TIME_CAPACITY) {
      this.times.shift();
    }
  }

  get avgTime(): number {
    return this.times.reduce((a, b) => a + b, 0) / this.times.length || 0;
  }

  get knowledgeFactor() {
    return this.rating / (this.avgTime + 1);
  }

  knowledgeFactorNormalized(min: number, max: number) {
    return (this.knowledgeFactor - min) / (max - min);
  }
}

export const useBoardStatsStore = defineStore('boardStats', () => {
  const cellInfos: CellData[][] = [];
  for (let i = 0; i < BOARD_SIZE; i++) {
    const row: CellData[] = [];
    for (let j = 0; j < BOARD_SIZE; j++) {
      row.push(new CellData());
    }
    cellInfos.push(row);
  }

  const cellRefs = ref(cellInfos);
  function shift(p: Point, delta: number) {
    cellRefs.value[p.row][p.column].shift(delta);
  }

  function updateTime(p: Point, time: number) {
    cellRefs.value[p.row][p.column].updateTime(time);
  }

  function setTimeForAll(time: number) {
    cellRefs.value.forEach((row) => row.forEach((cell) => cell.updateTime(time)));
  }

  function blink(p: Point, isBlink: boolean) {
    cellRefs.value[p.row][p.column].blink = isBlink;
  }

  function cellInfo(p: Point) {
    return cellRefs.value[p.row][p.column];
  }

  const knowledgeLimits = computed<[number, number]>(() => {
    let min = Infinity;
    let max = -Infinity;
    cellRefs.value.forEach((row) =>
      row.forEach((cell) => {
        if (cell.knowledgeFactor > max) {
          max = cell.knowledgeFactor;
        }

        if (cell.knowledgeFactor < min) {
          min = cell.knowledgeFactor;
        }
      })
    );

    return [min, max];
  });
  return { cellInfo, shift, blink, updateTime, setTimeForAll, knowledgeLimits };
});

const rootTime = Date.now();
function timeNow() {
  return (Date.now() - rootTime) / 1000;
}


export const useTimer = defineStore('timerStore', () => {
  const timeHandler = ref<number | null>(null);
  const startedTime = ref<number | null>(null);
  const currentTime = ref(timeNow());

  function startTimer() {
    if (timeHandler.value) {
      clearInterval(timeHandler.value);
    }
    timeHandler.value = setInterval(() => {
      currentTime.value = timeNow();
    }, 100);
    startedTime.value = timeNow();
  }

  function stopTimer() {
    if (timeHandler.value) {
      clearInterval(timeHandler.value);
      timeHandler.value = null;
    }
  }

  const timePassed = computed(() => {
    if (startedTime.value) {
      return Math.max(currentTime.value, timeNow()) - startedTime.value;
    }

    return 0;
  });

  return { startTimer, stopTimer, timePassed };
});

function asyncEventHandler<T = void>(): [(v: T) => void, () => Promise<T>] {
  const event = ref<T>();
  const eventId = ref(0);
  const pendingId = ref(0);

  function handle(value: T) {
    event.value = value;
    eventId.value = pendingId.value;
  }

  async function waitEvent() {
    const expectedEventId = ++pendingId.value;
    event.value = undefined;
    return new Promise<T>((resolve, reject) => {
      const stopWatcher = watch(event, () => {
        const eventValue = event.value;
        const eventIdValue = eventId.value;
        if (eventValue !== undefined && eventValue !== null && eventIdValue === expectedEventId) {
          resolve(eventValue);
        } else {
          reject();
        }
        stopWatcher();
      });
    });
  }

  return [handle, waitEvent];
}

export const usePause = defineStore('pauseStore', () => {
  const [hover, wait] = asyncEventHandler<boolean>();
  const isHovered = ref(false);

  function onHover(hovered: boolean) {
    if (hovered) {
      hover(true);
    } else {
      hover(false);
    }
    isHovered.value = hovered;
  }

  function waitSpecific(target: boolean) {
    return async function () {
      while (true) {
        const res = await wait();
        if (res === target) {
          return target;
        }
      }
    };
  }

  return { waitHover: waitSpecific(true), waitUnhover: waitSpecific(false), onHover, isHovered };
});

export const useBoardClickStore = defineStore('boardClickStore', () => {
  const [clickCell, waitClick] = asyncEventHandler<Point>();

  return { clickCell, waitClick };
});

export const useTargetStore = defineStore('targetStore', () => {
  const isWhite = ref(true);
  const target = ref(new Point(0,0));

  function toggle() {
    isWhite.value = !isWhite.value;
  }

  const code = computed(() => target.value.code(isWhite.value));

  function setTarget(point: Point) {
    target.value = point;
  }

  return {isWhite, toggle, code, setTarget}
});
