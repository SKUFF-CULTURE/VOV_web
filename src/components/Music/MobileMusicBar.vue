<template>
  <div class="bg-light-surface dark:bg-dark-surface border-t border-gray-200 dark:border-gray-700 py-2 px-4 flex items-center justify-between h-16 md:hidden">
    <!-- Compact view -->
    <div v-if="!isFullscreen" class="flex items-center justify-between w-full" @click="toggleFullscreen">
      <div class="flex items-center space-x-3 flex-1 min-w-0">
        <img
            :src="currentTrack?.coverUrl || defaultCover"
            alt="Cover"
            class="w-10 h-10 object-cover rounded bg-gray-100 dark:bg-gray-700 flex-shrink-0"
        />
        <div class="flex flex-col truncate min-w-0">
          <p class="text-sm font-semibold text-white truncate">
            {{ currentTrack?.title || 'Трек' }}
          </p>
          <p class="text-xs text-light-text-muted dark:text-dark-text-muted truncate">
            {{ currentTrack?.author || 'Исполнитель' }}
          </p>
        </div>
      </div>
      <button
          @click.stop="onTogglePlay"
          class="p-2 rounded-full hover:scale-110 active:scale-95 transition-transform duration-200"
      >
        <component :is="playerStore.isPlaying ? PauseIcon : PlayIcon" class="w-6 h-6 text-white"/>
      </button>
    </div>

    <!-- Fullscreen view -->
    <transition name="slide-up">
      <div
          v-if="isFullscreen"
          class="fixed inset-0 z-150 flex flex-col pt-16 px-4"
          :style="backgroundStyle"
          @touchstart="onTouchStart"
          @touchmove="onTouchMove"
          @touchend="onTouchEnd"
      >
        <!-- Swipe handle and close button -->
        <div class="absolute top-0 left-0 right-0">
          <button
              @click="toggleFullscreen"
              class="absolute top-4 left-4 p-2 hover:scale-110 active:scale-95 transition-transform duration-200"
              aria-label="Close fullscreen"
          >
            <ChevronDownIcon class="w-6 h-6 text-white"/>
          </button>
          <div class="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-gray-400 dark:bg-gray-600 rounded-full"></div>
        </div>

        <!-- Mini player when overlay is open -->
        <transition name="fade">
          <div
              v-if="showQueueOverlay || showLyricsOverlay"
              class="absolute top-0 left-0 right-0 px-4 py-2 flex items-center space-x-3 z-60 border-b border-gray-200 dark:border-gray-700"
              :style="miniPlayerBackground"
          >
            <img
                :src="currentTrack?.coverUrl || defaultCover"
                alt="Cover"
                class="w-10 h-10 object-cover rounded bg-gray-100 dark:bg-gray-700 flex-shrink-0"
            />
            <div class="flex flex-col truncate flex-1 min-w-0">
              <p class="text-sm font-semibold text-white truncate">
                {{ currentTrack?.title || 'Трек' }}
              </p>
              <p class="text-xs text-light-text-muted dark:text-dark-text-muted truncate">
                {{ currentTrack?.author || 'Исполнитель' }}
              </p>
            </div>
            <button
                @click="onTogglePlay"
                class="p-2 rounded-full hover:scale-110 active:scale-95 transition-transform duration-200"
            >
              <component :is="playerStore.isPlaying ? PauseIcon : PlayIcon" class="w-6 h-6 text-white"/>
            </button>
          </div>
        </transition>

        <!-- Track cover and controls -->
        <div
            v-if="!showQueueOverlay && !showLyricsOverlay"
            class="relative flex justify-center w-full overflow-hidden"
            style="margin-top: 15px; margin-bottom: 25px; height: 60vh;"
            @touchstart="startSwipe"
            @touchmove="moveSwipe"
            @touchend="endSwipe"
        >
          <!-- Контейнер для всех обложек -->
          <div class="relative w-full h-full flex items-center justify-center">
            <!-- Previous track cover (слева) -->
            <div
                v-if="prevTrack?.coverUrl"
                class="absolute left-0 z-10 w-1/4 max-w-[100px] h-3/4"
                :style="{
        transform: `translateX(${-100 + (swipeOffset * 0.3)}%) scale(0.8)`,
        opacity: 0.6 - Math.abs(swipeOffset) / 500,
        transition: isSwipingCover ? 'none' : 'all 0.5s ease'
      }"
            >
              <img
                  :src="prevTrack.coverUrl || defaultCover"
                  alt="Previous Cover"
                  class="object-cover w-full h-full rounded-lg shadow-lg"
              />
            </div>

            <!-- Current track cover (центр) -->
            <div
                class="relative z-20 transition-all duration-500 ease-in-out"
                :style="{
        transform: `translateX(${swipeOffset}px) scale(${1 - Math.abs(swipeOffset) / 1000})`,
        opacity: 1 - Math.abs(swipeOffset) / 500,
        zIndex: 20
      }"
            >
              <img
                  ref="coverImage"
                  :src="currentTrack?.coverUrl || defaultCover"
                  alt="Cover"
                  @load="updateBackgroundColor"
                  crossorigin="anonymous"
                  style="width: 75vw; max-width: 360px;"
                  class="aspect-square object-cover rounded-lg shadow-lg"
              />
            </div>

            <!-- Next track cover (справа) -->
            <div
                v-if="nextTrack?.coverUrl"
                class="absolute right-0 z-10 w-1/4 max-w-[100px] h-3/4"
                :style="{
        transform: `translateX(${100 + (swipeOffset * 0.3)}%) scale(0.8)`,
        opacity: 0.6 - Math.abs(swipeOffset) / 500,
        transition: isSwipingCover ? 'none' : 'all 0.5s ease'
      }"
            >
              <img
                  :src="nextTrack.coverUrl || defaultCover"
                  alt="Next Cover"
                  class="object-cover w-full h-full rounded-lg shadow-lg"
              />
            </div>

            <!-- Incoming track (для анимации) -->
            <div
                v-if="(nextCoverUrl || prevCoverUrl) && isSwipingCover"
                class="absolute z-30 transition-all duration-500 ease-in-out"
                :style="{
        transform: incomingTransform,
        opacity: incomingOpacity,
        width: '75vw',
        maxWidth: '360px'
      }"
            >
              <img
                  :src="nextCoverUrl || prevCoverUrl"
                  alt="Incoming Cover"
                  class="aspect-square object-cover rounded-lg shadow-lg w-full"
              />
            </div>
          </div>

          <!-- Индикатор направления свайпа -->
          <div
              v-if="isSwipingCover"
              class="absolute inset-0 flex items-center justify-center z-40 pointer-events-none"
          >
            <div
                class="w-16 h-16 rounded-full bg-black bg-opacity-50 flex items-center justify-center"
                :style="{
        transform: `translateX(${swipeOffset / 4}px)`,
        opacity: Math.min(Math.abs(swipeOffset) / 200, 0.7)
      }"
            >
              <component
                  :is="swipeOffset > 0 ? ChevronLeftIcon : ChevronRightIcon"
                  class="w-8 h-8 text-white"
              />
            </div>
          </div>
        </div>

        <!-- Controls -->
        <div class="flex-1 flex flex-col justify-end pb-6" :class="{ 'mt-16': showQueueOverlay || showLyricsOverlay }">
          <!-- Track info -->
          <div v-if="!showQueueOverlay && !showLyricsOverlay" class="flex items-center justify-between mb-4 px-2">
            <div class="flex flex-col truncate max-w-[60%]">
              <p class="text-lg font-semibold text-white truncate">
                {{ currentTrack?.title || 'Трек' }}
              </p>
              <p class="text-sm text-light-text-muted dark:text-dark-text-muted truncate">
                {{ currentTrack?.author || 'Исполнитель' }}
              </p>
            </div>
            <div class="flex items-center space-x-3">
              <button @click="onToggleLibrary" class="p-2 rounded hover:scale-110 active:scale-95 transition-transform duration-200">
                <HeartIcon
                    :class="['w-6 h-6', isInLibrary
                    ? 'dark:text-dark-primary text-light-primary fill-current'
                    : 'text-white']"
                />
              </button>
              <div class="relative">
                <button @click="showInfoTooltip = !showInfoTooltip" class="p-2 rounded hover:scale-110 active:scale-95 transition-transform duration-200">
                  <InformationCircleIcon class="w-6 h-6 text-white"/>
                </button>
                <transition name="fade">
                  <div
                      v-if="showInfoTooltip && currentTrack"
                      class="absolute right-0 top-12 w-64 p-3 bg-light-surface dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg shadow-lg text-sm text-white z-30"
                  >
                    <p><strong>Год:</strong> {{ currentTrack?.year || 'Unknown' }}</p>
                    <p><strong>Альбом:</strong> {{ currentTrack?.album || 'Unknown' }}</p>
                    <p><strong>Страна:</strong> {{ currentTrack?.country || 'Unknown' }}</p>
                    <p><strong>Лайки:</strong> {{ currentTrack?.likes || 0 }}</p>
                    <p><strong>Прослушивания:</strong> {{ currentTrack?.playCount || 0 }}</p>
                  </div>
                </transition>
              </div>
            </div>
          </div>

          <!-- Progress bar -->
          <div v-if="!showQueueOverlay && !showLyricsOverlay" class="flex items-center space-x-2 w-full mb-6 px-2">
            <span class="text-xs text-white">{{ formatTime(currentTime) }}</span>
            <input
                type="range"
                min="0"
                :max="duration"
                v-model.number="currentTime"
                @input="onSeek"
                class="flex-1 progress-bar-time"
                :style="{ '--progress': `${(currentTime/duration)*100}%`, '--buffered-progress': `${bufferedProgress}%` }"
            />
            <span class="text-xs text-white">{{ formatTime(duration) }}</span>
          </div>

          <!-- Playback controls -->
          <div v-if="!showQueueOverlay && !showLyricsOverlay" class="flex justify-center items-center space-x-6 mb-6 px-2">
            <button
                @click="onShuffle"
                :class="playerStore.shuffleActive
                ? 'text-light-primary dark:text-dark-primary'
                : 'text-white'"
                class="p-2 rounded hover:scale-110 active:scale-95 transition-transform duration-200"
            >
              <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  class="w-5 h-5 bi bi-shuffle"
                  viewBox="0 0 16 16"
              >
                <path
                    fill-rule="evenodd"
                    d="M0 3.5A.5.5 0 0 1 .5 3H1c2.202 0 3.827 1.24 4.874 2.418.49.552.865 1.102 1.126 1.532.26-.43.636-.98 1.126-1.532C9.173 4.24 10.798 3 13 3v1c-1.798 0-3.173 1.01-4.126 2.082A9.624 9.624 0 0 0 7.556 8a9.624 9.624 0 0 0 1.317 1.918C9.828 10.99 11.204 12 13 12v1c-2.202 0-3.827-1.24-4.874-2.418A10.595 10.595 0 0 1 7 9.05c-.26.43-.636.98-1.126 1.532C4.827 11.76 3.202 13 1 13H.5a.5.5 0 0 1 0-1H1c1.798 0 3.173-1.01 4.126-2.082A9.624 9.624 0 0 0 6.444 8a9.624 9.624 0 0 0-1.317-1.918C4.172 5.01 2.796 4 1 4H.5a.5.5 0 0 1-.5-.5z"
                />
                <path
                    d="M13 5.466V1.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384l-2.36 1.966a.25.25 0 0 1-.41-.192zm0 9v-3.932a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384l-2.36 1.966a.25.25 0 0 1-.41-.192z"
                />
              </svg>
            </button>
            <button @click="onPrev" class="p-2 rounded hover:scale-110 active:scale-95 transition-transform duration-200">
              <ChevronLeftIcon class="w-6 h-6 text-white"/>
            </button>
            <button @click="onTogglePlay" class="p-3 rounded-full bg-light-primary dark:bg-dark-primary hover:scale-110 active:scale-95 transition-transform duration-200">
              <component :is="playerStore.isPlaying ? PauseIcon : PlayIcon" class="w-8 h-8 text-white"/>
            </button>
            <button @click="onNext" class="p-2 rounded hover:scale-110 active:scale-95 transition-transform duration-200">
              <ChevronRightIcon class="w-6 h-6 text-white"/>
            </button>
            <button @click="onToggleLoop" class="relative p-2 rounded hover:scale-110 active:scale-95 transition-transform duration-200" title="Режим повтора">
              <ArrowPathRoundedSquareIcon :class="['w-6 h-6', loopClass]"/>
              <span v-if="playerStore.loopMode === 'one'" class="absolute bottom-0 right-0 bg-light-primary dark:bg-dark-primary text-white text-[10px] font-bold rounded-full w-3 h-3 flex items-center justify-center">1</span>
            </button>
          </div>

          <!-- Queue and voice input -->
          <div class="flex justify-between items-center px-4 mb-4">
            <button @click="toggleQueueOverlay" class="p-2 rounded hover:scale-110 active:scale-95 transition-transform duration-200">
              <QueueListIcon class="w-6 h-6 text-white"/>
            </button>
            <button @click="toggleLyricsOverlay" class="p-2 rounded hover:scale-110 active:scale-95 transition-transform duration-200">
              <MicrophoneIcon class="w-6 h-6 text-white"/>
            </button>
          </div>
        </div>

        <!-- Overlays -->
        <QueueOverlay
            v-if="showQueueOverlay"
            :dominant-color="dominantColor"
            :secondary-color="secondaryColor"
            @close="showQueueOverlay = false"
        />
        <MobileLyricsOverlay
            v-if="showLyricsOverlay"
            :dominant-color="dominantColor"
            :secondary-color="secondaryColor"
            @close="showLyricsOverlay = false"
        />
      </div>
    </transition>
  </div>
</template>

<script setup>
import QueueOverlay from '@/components/Music/QueueOverlay.vue';
import MobileLyricsOverlay from '@/components/Music/MobileLyricsOverlay.vue';
import { ref, computed, watch, nextTick } from 'vue';
import { usePlayerStore } from '@/store/player';
import { useTrackStore } from '@/store/track';
import { useToast } from 'vue-toastification';
import ColorThief from 'colorthief';
import {
  HeartIcon,
  PlayIcon,
  PauseIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowPathRoundedSquareIcon,
  MicrophoneIcon,
  QueueListIcon,
  InformationCircleIcon,
  ChevronDownIcon,
} from '@heroicons/vue/24/outline';

defineProps({
  audioElement: {
    type: Object,
    default: null,
  },
});

const playerStore = usePlayerStore();
const trackStore = useTrackStore();
const toast = useToast();

// State & refs
const isFullscreen = ref(false);
const showQueueOverlay = ref(false);
const showLyricsOverlay = ref(false);
const showInfoTooltip = ref(false);
const defaultCover = 'https://via.placeholder.com/48';
const touchStartY = ref(0);
const touchCurrentY = ref(0);
const isSwiping = ref(false);
const coverImage = ref(null);
const dominantColor = ref([0, 0, 0]);
const secondaryColor = ref([0, 0, 0]);
const swipeStartX = ref(0);
const swipeCurrentX = ref(0);
const swipeOffset = ref(0);
const incomingOffset = ref(0);
const isSwipingCover = ref(false);
const swipeDirection = ref(null);
const animateDirection = ref(null);
const nextCoverUrl = ref(null);
const prevCoverUrl = ref(null);

// Computed props
const currentTrack = computed(() => playerStore.currentTrack);
const prevTrack = computed(() => playerStore.getPrevTrack());
const nextTrack = computed(() => playerStore.getNextTrack());
const isInLibrary = computed(() =>
    currentTrack.value && trackStore.userLibrary.some(t => t.trackId === currentTrack.value.trackId)
);
const loopClass = computed(() =>
    playerStore.loopMode === 'none'
        ? 'text-white'
        : 'text-light-primary dark:text-dark-primary'
);
const currentTime = computed({
  get: () => playerStore.currentTime,
  set: v => playerStore.seek(v)
});
const duration = computed(() => playerStore.duration);
const bufferedProgress = computed(() => playerStore.bufferedProgress);

const backgroundStyle = computed(() => {
  const [r1, g1, b1] = dominantColor.value;
  const [r2, g2, b2] = secondaryColor.value;
  return {
    background: `linear-gradient(to bottom, rgb(${r1}, ${g1}, ${b1}), rgb(${r2}, ${g2}, ${b2}))`
  };
});

const miniPlayerBackground = computed(() => {
  if (!showQueueOverlay.value && !showLyricsOverlay.value) {
    return {
      background: 'rgb(var(--light-surface) / 1)',
    };
  }
  const [r1, g1, b1] = dominantColor.value;
  const [r2, g2, b2] = secondaryColor.value;
  return {
    background: `linear-gradient(to bottom, rgb(${r1}, ${g1}, ${b1}), rgb(${r2}, ${g2}, ${b2}))`,
  };
});

const incomingTransform = computed(() => {
  if (!isSwipingCover.value) return 'translateX(0) scale(1)';
  if (swipeDirection.value === 'next') {
    return `translateX(${window.innerWidth + swipeOffset.value}px) scale(0.9)`;
  } else {
    return `translateX(${-window.innerWidth + swipeOffset.value}px) scale(0.9)`;
  }
});

const incomingOpacity = computed(() => {
  return isSwipingCover.value ? Math.min(Math.abs(swipeOffset.value) / 200, 0.8) : 0;
});


// Methods
function toggleFullscreen() {
  isFullscreen.value = !isFullscreen.value;
  showQueueOverlay.value = false;
  showLyricsOverlay.value = false;
}

async function toggleQueueOverlay() {
  await nextTick();
  showQueueOverlay.value = !showQueueOverlay.value;
  showLyricsOverlay.value = false;
}

async function toggleLyricsOverlay() {
  await nextTick();
  showLyricsOverlay.value = !showLyricsOverlay.value;
  showQueueOverlay.value = false;
}

async function onToggleLibrary() {
  if (!currentTrack.value) return;
  try {
    if (isInLibrary.value) {
      await trackStore.removeFromLibrary(currentTrack.value.trackId);
      toast.success('Трек удален из коллекции!');
    } else {
      await trackStore.addToLibrary(currentTrack.value.trackId);
      toast.success('Трек добавлен в коллекцию!');
    }
  } catch (e) {
    console.error('Не удалось обновить библиотеку:', e);
    toast.error('Не удалось обновить коллекцию');
  }
}

function onShuffle() { playerStore.toggleShuffle(); }

function animateSwipe(targetOffset, direction, callback) {
  const duration = 400;
  const startTime = performance.now();
  const initialOffset = swipeOffset.value;

  function step(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easing = progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;

    swipeOffset.value = initialOffset + (targetOffset - initialOffset) * easing;

    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      callback();
      swipeOffset.value = 0;
      nextCoverUrl.value = null;
      prevCoverUrl.value = null;
      isSwipingCover.value = false;
    }
  }

  requestAnimationFrame(step);
}

function onPrev() {
  if (!prevTrack.value) return;
  animateDirection.value = 'prev';
  prevCoverUrl.value = prevTrack.value.coverUrl || defaultCover;
  animateSwipe(window.innerWidth, 'prev', () => {
    playerStore.prevTrack();
  });
}

function onTogglePlay() { playerStore.isPlaying ? playerStore.pause() : playerStore.play(); }

function onNext() {
  if (!nextTrack.value) return;
  animateDirection.value = 'next';
  nextCoverUrl.value = nextTrack.value.coverUrl || defaultCover;
  animateSwipe(-window.innerWidth, 'next', () => {
    playerStore.nextTrack();
  });
}

function onToggleLoop() { playerStore.toggleLoopMode(); }
function onSeek() { playerStore.seek(currentTime.value); }
function formatTime(seconds = 0) {
  const m = String(Math.floor(seconds / 60)).padStart(2, '0');
  const s = String(Math.floor(seconds % 60)).padStart(2, '0');
  return `${m}:${s}`;
}

// Touch handling for fullscreen view
function onTouchStart(e) {
  if (showQueueOverlay.value || showLyricsOverlay.value) return;
  touchStartY.value = e.touches[0].clientY;
  touchCurrentY.value = touchStartY.value;
  isSwiping.value = true;
  // Отключаем transition во время свайпа
  e.currentTarget.style.transition = 'none';
}

function onTouchMove(e) {
  if (!isSwiping.value || showQueueOverlay.value || showLyricsOverlay.value) return;
  touchCurrentY.value = e.touches[0].clientY;
  const deltaY = touchCurrentY.value - touchStartY.value;

  // Разрешаем только свайп вниз
  if (deltaY > 0) {
    e.currentTarget.style.transform = `translateY(${deltaY}px)`;
    e.currentTarget.style.opacity = 1 - Math.min(deltaY / 300, 1);
  }

  // Отменяем событие прокрутки страницы
  e.preventDefault();
}

function onTouchEnd(e) {
  if (!isSwiping.value || showQueueOverlay.value || showLyricsOverlay.value) return;
  const deltaY = touchCurrentY.value - touchStartY.value;

  // Включаем transition обратно
  e.currentTarget.style.transition = 'transform 0.3s ease, opacity 0.3s ease';

  if (deltaY > 100) {
    // Если свайп достаточный, закрываем сразу
    isFullscreen.value = false;
    // Сбрасываем transform
    e.currentTarget.style.transform = '';
    e.currentTarget.style.opacity = '';
  } else {
    // Если свайп недостаточный, плавно возвращаем на место
    e.currentTarget.style.transform = '';
    e.currentTarget.style.opacity = '';
  }

  isSwiping.value = false;
}

// Swipe handling for track covers
function startSwipe(e) {
  if ((!prevTrack.value && !nextTrack.value) || showQueueOverlay.value || showLyricsOverlay.value) return;
  swipeStartX.value = e.touches[0].clientX;
  swipeCurrentX.value = swipeStartX.value;
  isSwipingCover.value = true;
  swipeOffset.value = 0;
}

function moveSwipe(e) {
  if (!isSwipingCover.value) return;
  swipeCurrentX.value = e.touches[0].clientX;
  swipeOffset.value = swipeCurrentX.value - swipeStartX.value;

  // Определяем направление свайпа
  swipeDirection.value = swipeOffset.value > 0 ? 'prev' : 'next';

  // Подготавливаем следующую обложку
  if (swipeDirection.value === 'next' && nextTrack.value) {
    nextCoverUrl.value = nextTrack.value.coverUrl || defaultCover;
  } else if (swipeDirection.value === 'prev' && prevTrack.value) {
    prevCoverUrl.value = prevTrack.value.coverUrl || defaultCover;
  }
}

function endSwipe() {
  if (!isSwipingCover.value) return;

  const threshold = window.innerWidth / 5;
  const absOffset = Math.abs(swipeOffset.value);

  if (absOffset > threshold) {
    if (swipeDirection.value === 'prev' && prevTrack.value) {
      animateSwipe(window.innerWidth, 'prev', () => {
        playerStore.prevTrack();
      });
    } else if (swipeDirection.value === 'next' && nextTrack.value) {
      animateSwipe(-window.innerWidth, 'next', () => {
        playerStore.nextTrack();
      });
    } else {
      // Возвращаем на место, если трека нет
      animateSwipe(0, null, () => {
        swipeOffset.value = 0;
        nextCoverUrl.value = null;
        prevCoverUrl.value = null;
      });
    }
  } else {
    // Возвращаем на место, если свайп недостаточно сильный
    animateSwipe(0, null, () => {
      swipeOffset.value = 0;
      nextCoverUrl.value = null;
      prevCoverUrl.value = null;
    });
  }
}

function updateBackgroundColor() {
  if (!coverImage.value) return;
  const colorThief = new ColorThief();
  try {
    const palette = colorThief.getPalette(coverImage.value, 2);
    const rawDominant = palette[0] || [0,0,0];
    const primary = rawDominant.map(c => Math.min(c,220));
    const secondary = primary.map(c => Math.floor(c*0.5));
    dominantColor.value = primary;
    secondaryColor.value = secondary;
  } catch (e) {
    console.error('Ошибка при извлечении цветов обложки:', e);
    dominantColor.value = [0,0,0];
    secondaryColor.value = [0,0,0];
  }
}

// Lifecycle hooks
watch(currentTrack, () => {
  if (coverImage.value?.complete) updateBackgroundColor();
});
</script>

<style scoped>
:root {
  --progress: 0%;
  --buffered-progress: 0%;
}

input[type="range"] {
  appearance: none;
  border-radius: 9999px;
  height: 0.375rem;
  background-color: #d1d5db;
  background-repeat: no-repeat;
  background-image:
      linear-gradient(to right, #6366f1 var(--progress), transparent var(--progress)),
      linear-gradient(to right, #9ca3af var(--buffered-progress), transparent var(--buffered-progress));
}

.dark input[type="range"] {
  background-color: #4b5563;
  background-image:
      linear-gradient(to right, #8b5cf6 var(--progress), transparent var(--progress)),
      linear-gradient(to right, #6b7280 var(--buffered-progress), transparent var(--buffered-progress));
}

input[type="range"]::-webkit-slider-thumb {
  appearance: none;
  border-radius: 9999px;
  height: 1rem;
  width: 1rem;
  background-color: #6366f1;
  cursor: pointer;
}

.dark input[type="range"]::-webkit-slider-thumb {
  background-color: #8b5cf6;
}

input[type="range"]::-moz-range-thumb {
  border-radius: 9999px;
  height: 1rem;
  width: 1rem;
  background-color: #6366f1;
  cursor: pointer;
  border: none;
}

.dark input[type="range"]::-moz-range-thumb {
  background-color: #8b5cf6;
}

input[type="range"]::-moz-range-progress {
  background-color: #6366f1;
  border-radius: 9999px;
  height: 0.375rem;
}

.dark input[type="range"]::-moz-range-progress {
  background-color: #8b5cf6;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.5, 1),
  opacity 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
}

.slide-up-enter-from {
  transform: translateY(100%);
  opacity: 0;
}

.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

.track-enter-active,
.track-leave-active {
  transition: all 0.3s ease;
}

.track-enter-from {
  transform: translateX(100%) scale(0.9);
  opacity: 0;
}

.track-leave-to {
  transform: translateX(-100%) scale(0.9);
  opacity: 0;
}

/* Эффект глубины для обложек */
.track-cover {
  transition: transform 0.3s ease, opacity 0.3s ease;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
}

/* Плавное появление/исчезание */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fixed.inset-0.z-150.flex.flex-col.pt-16.px-4 {
  will-change: transform, opacity; /* Улучшает производительность анимации */
  touch-action: pan-y; /* Разрешаем только вертикальные свайпы */
}
</style>
