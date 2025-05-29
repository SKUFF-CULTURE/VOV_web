<template>
  <!-- оверлей под мини-плеером -->
  <div
      ref="overlayRef"
      v-if="isVisible"
      class="fixed left-0 right-0 bottom-0 z-60 flex flex-col rounded-t-lg shadow-lg overflow-hidden"
      :style="overlayStyle"
  >
    <!-- header (по нему свайпаем) -->
    <div
        class="sticky top-0 flex justify-between items-center px-4 py-3
             bg-gradient-to-b from-black/30 to-transparent z-20"
        @touchstart="onTouchStart"
        @touchmove="onTouchMove"
        @touchend="onTouchEnd"
    >
      <h2 class="text-lg font-semibold text-white">Текст песни</h2>
      <button @click="closeInstant" class="p-2 hover:scale-110 active:scale-95">
        <ChevronDownIcon class="w-6 h-6 text-white"/>
      </button>
    </div>

    <!-- karaoke / fallback -->
    <div class="flex-1 overflow-y-auto px-4 pb-6 flex items-start justify-center">
      <template v-if="lyrics.length === 0">
        <span class="text-white">
          {{ player.currentTrackId ? 'Загрузка…' : 'Текст песни отсутствует' }}
        </span>
      </template>
      <template v-else>
        <!-- начинаем выше: h-[55vh] -->
        <LyricsKaraoke class="h-[55vh] w-full"/>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { usePlayerStore }      from '@/store/player';
import LyricsKaraoke           from './LyricsKaraoke.vue';
import { ChevronDownIcon }     from '@heroicons/vue/24/outline';

/* ---------- props / store ----------------------------------------- */
const props = defineProps({
  dominantColor:  { type:Array, default:() => [0,0,0] },
  secondaryColor: { type:Array, default:() => [0,0,0] },
});
const emit = defineEmits(['close']);

const player   = usePlayerStore();
const lyrics   = computed(() => player.currentLyrics);
const isVisible = ref(true);

/* ---------- градиент + геометрия ---------------------------------- */
const overlayStyle = computed(() => {
  const [r1,g1,b1] = props.dominantColor;
  const [r2,g2,b2] = props.secondaryColor;
  return {
    top: '57px',
    height: 'calc(100vh - 57px)',
    background: `linear-gradient(to bottom,rgb(${r1},${g1},${b1}),rgb(${r2},${g2},${b2}))`,
  };
});

/* ---------- swipe-down логика ------------------------------------- */
const overlayRef          = ref(null);
const startY              = ref(0);
const currentY            = ref(0);
const swiping             = ref(false);

function onTouchStart(e){
  if (!e.target.closest('.sticky')) return;
  startY.value = currentY.value = e.touches[0].clientY;
  swiping.value = true;
  overlayRef.value.style.transition = 'none';
}
function onTouchMove(e){
  if (!swiping.value) return;
  currentY.value = e.touches[0].clientY;
  const dy = currentY.value - startY.value;
  if (dy>0){
    overlayRef.value.style.transform = `translateY(${dy}px)`;
    overlayRef.value.style.opacity   = 1 - Math.min(dy/300,1);
  }
}
function onTouchEnd(){
  if (!swiping.value) return;
  const dy = currentY.value - startY.value;
  swiping.value = false;

  if (dy > 100){                     // закрываем с анимацией
    overlayRef.value.style.transition = 'transform .25s ease, opacity .25s ease';
    overlayRef.value.style.transform  = 'translateY(100%)';
    overlayRef.value.style.opacity    = '0';
    setTimeout(() => emit('close'), 250);
  }else{                             // возвращаем обратно
    overlayRef.value.style.transition = 'transform .25s ease, opacity .25s ease';
    overlayRef.value.style.transform  = '';
    overlayRef.value.style.opacity    = '';
    setTimeout(()=>overlayRef.value.style.transition='',250);
  }
}
function closeInstant(){ emit('close'); }
</script>

<style scoped>
.overlay-enter{ animation:slide-up .25s ease forwards }
@keyframes slide-up{
  from{transform:translateY(100%);opacity:0}
  to  {transform:translateY(0);   opacity:1}
}
</style>
