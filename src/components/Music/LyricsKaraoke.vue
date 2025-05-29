<!-- src/components/Music/LyricsKaraoke.vue -->
<template>
  <!-- контейнер наследует высоту от родителя -->
  <div class="karaoke-root relative h-full overflow-hidden flex items-center justify-center">
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
        <!-- текущая строка ─ подсветка символов -->
        <template v-if="idx === 1 && line">
          <span
              v-for="(ch,i) in line.text.split('')"
              :key="i"
              :class="{
              'text-white/30': i >= currentChar,
              'text-white':    i <  currentChar
            }"
          >{{ ch }}</span>
        </template>

        <!-- предыдущая / следующая -->
        <template v-else-if="line">{{ line.text }}</template>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { usePlayerStore } from '@/store/player';

/* ---------- состояние --------------------------------------------- */
const store        = usePlayerStore();
const lyrics       = computed(() => store.currentLyrics);

const currentIdx   = ref(-1);      // индекс строки
const currentChar  = ref(0);       // активный символ
let   charTimer    = null;

/* ---------- вычисляем видимые 3 строки ----------------------------- */
const visibleLines = computed(() => [
  lyrics.value[currentIdx.value - 1] || null,
  lyrics.value[currentIdx.value]     || null,
  lyrics.value[currentIdx.value + 1] || null,
]);

function lineClass(i){
  if (i === 0) return 'line-base text-white/60';
  if (i === 1) return 'line-base text-white font-semibold text-2xl';
  if (i === 2) return 'line-base text-white/60';
  return '';
}

/* ---------- посимвольная подсветка --------------------------------- */
function animateChars(start, end, text){
  clearInterval(charTimer);
  currentChar.value = 0;
  if (!text) return;

  const charDur = (end - start) / text.length;
  charTimer = setInterval(() => {
    if (currentChar.value < text.length) currentChar.value++;
    else clearInterval(charTimer);
  }, charDur * 1000);
}

/* ---------- определяем активную строку по времени ------------------ */
function syncByTime(t){
  const idx = lyrics.value.findIndex(l => t >= l.start && t < l.end);
  if (idx !== -1 && idx !== currentIdx.value){
    currentIdx.value = idx;
    const l = lyrics.value[idx];
    animateChars(l.start, l.end, l.text);
  }
}

/* реагируем на изменение времени                                      */
watch(() => store.currentTime, t => syncByTime(t));

/* когда пришёл сам текст (мог подгрузиться чуть позже)                */
watch(lyrics,           () => syncByTime(store.currentTime));

/* и сразу при монтировании                                            */
onMounted(()            => syncByTime(store.currentTime));

onUnmounted(() => clearInterval(charTimer));
</script>

<style scoped>
.line-base { height:2.5rem; line-height:2.5rem; text-align:center; }
.line-item { width:100%; }

.line-slide-leave-active{ position:absolute; left:0; right:0; }

.line-slide-move{
  transition:transform .45s cubic-bezier(.22,1,.36,1);
  will-change:transform;
}

.line-slide-enter-active,
.line-slide-leave-active{ transition:opacity .3s ease; }
.line-slide-enter-from,
.line-slide-leave-to    { opacity:0; }
</style>
