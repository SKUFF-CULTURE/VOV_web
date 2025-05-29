<template>
  <div
      v-if="isVisible"
      class="fixed bottom-0 left-0 right-0 top-[80px] z-60 rounded-t-lg shadow-lg overflow-y-auto overlay-enter"
      :style="backgroundStyle"
      @touchstart="onOverlayTouchStart"
      @touchmove="onOverlayTouchMove"
      @touchend="onOverlayTouchEnd"
  >
    <!----- заголовок и «крестик» – без изменений ------------------------ -->
    <div class="flex justify-between items-center px-4 py-3">
      <h2 class="text-lg font-semibold text-white">Текст песни</h2>
      <button
          @click="$emit('close')"
          class="p-2 rounded hover:scale-110 active:scale-95 transition-transform duration-200"
          aria-label="Close lyrics"
      >
        <ChevronDownIcon class="w-6 h-6 text-white" />
      </button>
    </div>

    <div class="px-4 pb-4">
      <div v-if="lyrics.length === 0" class="text-white text-center">
        <div v-if="playerStore.currentTrackId" class="animate-spin">Загрузка...</div>
        <div v-else>Текст песни отсутствует.</div>
      </div>

      <!----- КАРАОКЕ ------------------------------------------------ -->
      <div class="karaoke-container h-[60vh] relative overflow-hidden flex items-center justify-center">
        <TransitionGroup
            name="line-slide"
            tag="div"
            class="absolute inset-0 flex flex-col items-center justify-center gap-2"
        >
          <div
              v-for="(line, idx) in visibleLines"
              :key="line?.start ?? idx"
              :class="lineClass(idx)"
              class="line-item select-none"
          >
            <!-- текущая строка — посимвольная подсветка -->
            <template v-if="idx === 1 && line">
              <span
                  v-for="(char, i) in line.text.split('')"
                  :key="i"
                  :class="{
                  'text-white/30': i >= currentCharIndex,
                  'text-white':    i <  currentCharIndex
                }"
              >{{ char }}</span>
            </template>

            <!-- предыдущая / следующая -->
            <template v-else-if="line">
              {{ line.text }}
            </template>
          </div>
        </TransitionGroup>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { ChevronDownIcon } from '@heroicons/vue/24/outline';
import { usePlayerStore } from '@/store/player';

const props = defineProps({
  dominantColor:  { type: Array, default: () => [0, 0, 0] },
  secondaryColor: { type: Array, default: () => [0, 0, 0] },
});
const emit = defineEmits(['close']);
const playerStore = usePlayerStore();

/*-------------------------------- state --------------------------------*/
const isVisible         = ref(true);
const lyrics            = computed(() => playerStore.currentLyrics);
const currentLineIndex  = ref(-1);
const currentCharIndex  = ref(0);
let   charTimer         = null;

/* три видимые строки */
const visibleLines = computed(() => [
  lyrics.value[currentLineIndex.value - 1] || null,
  lyrics.value[currentLineIndex.value]     || null,
  lyrics.value[currentLineIndex.value + 1] || null,
]);

/*-------------------------------- UI helpers ---------------------------*/
function lineClass(idx) {
  if (idx === 0) return 'line-base text-white/60';
  if (idx === 1) return 'line-base text-white font-semibold text-2xl';
  if (idx === 2) return 'line-base text-white/60';
  return '';
}

/*-------------------------------- char animation -----------------------*/
function animateChars(start, end, text) {
  clearInterval(charTimer);
  currentCharIndex.value = 0;
  if (!text) return;

  const charDuration = (end - start) / text.length;
  charTimer = setInterval(() => {
    if (currentCharIndex.value < text.length) currentCharIndex.value++;
    else clearInterval(charTimer);
  }, charDuration * 1000);
}

/*-------------------------------- sync with audio ----------------------*/
function setCurrentLine(newIdx) {
  if (newIdx === currentLineIndex.value) return;
  currentLineIndex.value = newIdx;

  const line = lyrics.value[newIdx];
  if (line) animateChars(line.start, line.end, line.text);
}

function syncLyrics() {
  if (!playerStore.audioElement || !lyrics.value.length) return;
  const t   = playerStore.audioElement.currentTime;
  const idx = lyrics.value.findIndex(l => t >= l.start && t < l.end);
  if (idx !== -1) setCurrentLine(idx);
}

onMounted   (() => playerStore.audioElement?.addEventListener('timeupdate', syncLyrics));
onUnmounted (() => {
  playerStore.audioElement?.removeEventListener('timeupdate', syncLyrics);
  clearInterval(charTimer);
});

watch(() => playerStore.currentTrackId, () => {
  currentLineIndex.value = -1;
  currentCharIndex.value = 0;
  clearInterval(charTimer);
});

/*-------------------------------- bg gradient --------------------------*/
const backgroundStyle = computed(() => {
  const [r1,g1,b1] = props.dominantColor;
  const [r2,g2,b2] = props.secondaryColor;
  return { background:`linear-gradient(to bottom, rgb(${r1},${g1},${b1}), rgb(${r2},${g2},${b2}))` };
});

/* touch-закрытие (ваш код) --------------------------------------------*/
const overlayTouchStartY = ref(0), overlayTouchCurrentY = ref(0), isOverlaySwiping = ref(false);
function onOverlayTouchStart(e) { /* … */ }
function onOverlayTouchMove (e) { /* … */ }
function onOverlayTouchEnd  (e) { /* … */ }
</script>

<style scoped>
/* появление всего оверлея */
.overlay-enter { animation: slide-up 0.25s ease forwards; }
@keyframes slide-up { from{transform:translateY(100%);opacity:0} to{transform:translateY(0);opacity:1} }

/* базовая строка — фиксируем высоту, чтобы layout не прыгал */
.line-base        { height:2.5rem; line-height:2.5rem; text-align:center; }
.line-item        { width:100%; select:none; }

/*----------  TransitionGroup  ----------------------------------------*/
/* leave-элемент позиционируем абсолютно — исключаем из потока! */
.line-slide-leave-active {
  position:absolute;
  left:0; right:0;
}

/* анимация перемещения (FLIP) */
.line-slide-move {
  transition: transform 0.45s cubic-bezier(.22,1,.36,1);
  will-change: transform;
}

/* fade-in / fade-out */
.line-slide-enter-active,
.line-slide-leave-active { transition: opacity 0.3s ease; }
.line-slide-enter-from,
.line-slide-leave-to     { opacity:0; }

/* скролл-бар — как было */
::-webkit-scrollbar      { width:6px; }
::-webkit-scrollbar-thumb{ background:rgba(255,255,255,.3); border-radius:3px; }
.dark ::-webkit-scrollbar-thumb{ background:rgba(255,255,255,.2); }
</style>
