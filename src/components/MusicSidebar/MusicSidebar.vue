<template>
  <div
      class="fixed right-0 bottom-0 bg-light-surface dark:bg-dark-surface shadow-xl w-96 flex flex-col p-4 overflow-hidden border-l border-gray-200 dark:border-dark-border z-50"
      :style="{ height: `calc(100vh - ${headerHeight}px)` }"
  >
    <!-- 1) Обложка + инфо + лайк -->
    <div class="flex flex-col items-center">
      <div class="relative w-40 h-40 rounded-full overflow-hidden mb-4" :class="{ 'animate-spin': playerStore.isPlaying }">
        <img
            :src="currentTrack?.coverUrl || defaultCover"
            alt="Cover"
            class="w-full h-full object-cover bg-gray-100 dark:bg-gray-700"
        />
      </div>
      <div class="relative w-full">
        <div class="flex flex-col items-center">
          <h2 class="text-lg font-semibold text-light-text dark:text-dark-text truncate w-full text-center">
            {{ currentTrack?.title || 'Трек' }}
          </h2>
          <p class="text-sm text-light-text-muted dark:text-dark-text-muted truncate w-full text-center">
            {{ currentTrack?.author || 'Исполнитель' }}
          </p>
        </div>
        <button
            @click="onToggleLibrary"
            class="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded text-light-text dark:text-dark-text hover:scale-110 active:scale-95 transition-transform duration-200"
        >
          <HeartIcon
              :class="[
                'w-6 h-6',
                isInLibrary ? 'text-light-primary dark:text-dark-primary fill-current' : ''
              ]"
          />
        </button>
      </div>
    </div>

    <!-- 2) Управление + прогресс -->
    <div class="mt-4">
      <div class="flex items-center space-x-4 justify-center mb-2">
        <!-- Shuffle -->
        <button
            @click="onShuffle"
            :class="playerStore.shuffleActive ? 'text-light-primary dark:text-dark-primary' : 'text-light-text dark:text-dark-text'"
            class="p-2 rounded hover:scale-110 active:scale-95 transition-transform duration-200"
        >
          <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              class="w-5 h-5"
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

        <!-- Prev -->
        <button
            @click="onPrev"
            class="p-2 rounded text-light-text dark:text-dark-text hover:scale-110 active:scale-95 transition-transform duration-200"
        >
          <ChevronLeftIcon class="w-6 h-6" />
        </button>

        <!-- Play/Pause -->
        <button
            @click="onTogglePlay"
            class="p-3 rounded-full bg-light-primary dark:bg-dark-primary text-dark-text hover:scale-110 active:scale-95 transition-transform duration-200"
        >
          <component :is="playerStore.isPlaying ? PauseIcon : PlayIcon" class="w-6 h-6" />
        </button>

        <!-- Next -->
        <button
            @click="onNext"
            class="p-2 rounded text-light-text dark:text-dark-text hover:scale-110 active:scale-95 transition-transform duration-200"
        >
          <ChevronRightIcon class="w-6 h-6" />
        </button>

        <!-- Loop -->
        <button
            @click="onToggleLoop"
            :class="loopClass"
            class="p-2 rounded hover:scale-110 active:scale-95 transition-transform duration-200"
            title="Режим повтора"
        >
          <div class="relative w-5 h-5">
            <ArrowPathRoundedSquareIcon class="w-full h-full" />
            <span
                v-if="playerStore.loopMode === 'one'"
                class="absolute bottom-0 right-0 bg-light-primary dark:bg-dark-primary text-white text-[10px] font-bold rounded-full w-3 h-3 flex items-center justify-center"
            >1</span>
          </div>
        </button>
      </div>

      <!-- Progress bar -->
      <div class="flex items-center space-x-2 text-xs text-light-text dark:text-dark-text">
        <span>{{ formatTime(currentTime) }}</span>
        <input
            type="range"
            min="0"
            :max="duration"
            v-model.number="currentTime"
            @input="onSeek"
            class="flex-1 progress-bar-time"
            :style="{ '--progress': `${(currentTime / duration) * 100}%`, '--buffered-progress': `${bufferedProgress}%` }"
        />
        <span>{{ formatTime(duration) }}</span>
      </div>
    </div>

    <!-- 3) Доп функции + громкость + close -->
    <div class="mt-6 flex items-center justify-between">
      <div class="flex items-center space-x-4">
        <button
            @click="onSpeechToText"
            class="p-2 rounded text-light-text dark:text-dark-text hover:scale-110 active:scale-95 transition-transform duration-200"
        >
          <MicrophoneIcon class="w-5 h-5" />
        </button>
        <button
            @click="onToggleVersion"
            class="p-2 rounded text-light-text dark:text-dark-text hover:scale-110 active:scale-95 transition-transform duration-200"
        >
          <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              class="w-5 h-5"
          >
            <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.5"></circle>
            <path
                d="M7.40381 16.5967C4.8654 14.0583 4.8654 9.94271 7.40381 7.4043M16.5962 7.4043C17.6103 8.41836 18.2192 9.68413 18.4231 11.0005M16.5962 16.5967C17.0785 16.1144 17.4692 15.5751 17.7682 15.0005"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
            ></path>
            <path
                d="M7 3.33782C8.47087 2.48697 10.1786 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 22 22 12 22C6.47715 22 2 17.5228 2 12C2 10.1786 2.48697 8.47087 3.33782 7"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
            ></path>
          </svg>
        </button>
        <div class="relative">
          <button
              @mouseenter="showInfoTooltip = true"
              @mouseleave="showInfoTooltip = false"
              class="p-2 rounded text-light-text dark:text-dark-text hover:scale-110 active:scale-95 transition-transform duration-200"
          >
            <InformationCircleIcon class="w-5 h-5" />
          </button>
          <transition name="fade">
            <div
                v-if="showInfoTooltip && currentTrack"
                class="absolute left-1/2 -translate-x-1/2 bottom-10 w-64 p-3 bg-light-surface dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded shadow-lg text-sm text-light-text dark:text-dark-text z-10"
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
      <div class="flex items-center space-x-2">
        <button
            @click="onToggleMute"
            class="p-2 rounded text-light-text dark:text-dark-text hover:scale-110 active:scale-95 transition-transform duration-200"
        >
          <component :is="isMuted ? SpeakerXMarkIcon : SpeakerWaveIcon" class="w-5 h-5" />
        </button>
        <div class="relative w-20 h-6 flex items-center">
          <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              v-model.number="volume"
              @input="onUpdateVolume"
              @mouseenter="showVolumeHint = true"
              @mouseleave="showVolumeHint = false"
              class="w-full h-full progress-bar-volume"
              :style="{ '--progress': `${volume * 100}%` }"
          />
          <transition name="fade">
            <span
                v-if="showVolumeHint"
                class="absolute text-xs text-light-primary dark:text-dark-primary bg-light-surface dark:bg-dark-surface px-1 rounded shadow-sm whitespace-nowrap"
                :style="{
                  left: `calc(${volume * 100}% + 0.375rem - 0.75rem * ${volume})`,
                  transform: 'translateX(-50%)',
                  top: '-1rem'
                }"
            >
              {{ Math.round(volume * 100) }}%
            </span>
          </transition>
        </div>
      </div>
      <button
          @click="closeSidebar"
          class="p-2 rounded text-light-text dark:text-dark-text hover:scale-110 active:scale-95 transition-transform duration-200"
      >
        <ChevronDownIcon class="w-6 h-6" />
      </button>
    </div>

    <!-- 4) Очередь -->
    <div class="mt-4 flex-1">
      <QueueSidebar />
    </div>
    <DesktopLyricsOverlay v-model:visible="showLyricsOverlay" />
  </div>
</template>

<script setup>
import DesktopLyricsOverlay from '@/components/Music/DesktopLyricsOverlay.vue';
import { ref, computed } from 'vue';
import { usePlayerStore } from '@/store/player.js';
import { useTrackStore } from '@/store/track.js';
import { useMusicStore } from '@/store/music.js';
import { useToast } from 'vue-toastification';
import {
  HeartIcon,
  ChevronLeftIcon,
  PlayIcon,
  PauseIcon,
  ChevronRightIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  MicrophoneIcon,
  ChevronDownIcon,
  ArrowPathRoundedSquareIcon,
  InformationCircleIcon,
} from '@heroicons/vue/24/outline';
import QueueSidebar from '@/components/MusicSidebar/QueueSidebar.vue';

const playerStore = usePlayerStore();
const trackStore = useTrackStore();
const musicStore = useMusicStore();
const toast = useToast();

// Layout
const headerHeight = 64;
const defaultCover = 'src/assets/question-svg.svg';

// State & refs
const showVolumeHint = ref(false);
const showInfoTooltip = ref(false);
const currentVersion = ref('processed');
const showLyricsOverlay = ref(false);

// Computed properties from playerStore
const currentTrack = computed(() => playerStore.currentTrack);
const isInLibrary = computed(() =>
    currentTrack.value && trackStore.userLibrary.some(t => t.trackId === currentTrack.value.trackId)
);
const loopClass = computed(() =>
    playerStore.loopMode === 'none'
        ? 'text-light-text dark:text-dark-text'
        : 'text-light-primary dark:text-dark-primary'
);
const currentTime = computed({
  get: () => playerStore.currentTime,
  set: (value) => playerStore.seek(value),
});
const duration = computed(() => playerStore.duration);
const volume = computed({
  get: () => playerStore.volume,
  set: (value) => playerStore.updateVolume(value),
});
const isMuted = computed(() => playerStore.isMuted);
const bufferedProgress = computed(() => playerStore.bufferedProgress);

// Methods
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

function onShuffle() {
  playerStore.toggleShuffle();
}

function onPrev() {
  playerStore.prevTrack();
}

function onTogglePlay() {
  playerStore.isPlaying ? playerStore.pause() : playerStore.play();
}

function onNext() {
  playerStore.nextTrack();
}

function onToggleLoop() {
  playerStore.toggleLoopMode();
}

function onToggleVersion() {
  currentVersion.value = currentVersion.value === 'processed' ? 'original' : 'processed';
}

function onSpeechToText(){ showLyricsOverlay.value = true; }

function onUpdateVolume() {
  playerStore.updateVolume(volume.value);
}

function onToggleMute() {
  playerStore.toggleMute();
}

function onSeek() {
  playerStore.seek(currentTime.value);
}

function closeSidebar() {
  musicStore.toggleSidebar();
}

function formatTime(sec = 0) {
  const m = String(Math.floor(sec / 60)).padStart(2, '0');
  const s = String(Math.floor(sec % 60)).padStart(2, '0');
  return `${m}:${s}`;
}
</script>

<style scoped>
:root {
  --progress: 0%;
  --buffered-progress: 0%;
}

.animate-spin {
  animation: spin 7s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

input[type="range"] {
  appearance: none;
  border-radius: 9999px;
  height: 0.25rem;
  background-color: #d1d5db;
  background-repeat: no-repeat;
  background-image:
      linear-gradient(to right, #6366f1 var(--progress, 0%), transparent var(--progress, 0%)),
      linear-gradient(to right, #9ca3af var(--buffered-progress, 0%), transparent var(--buffered-progress, 0%));
}

.dark input[type="range"] {
  background-color: #4b5563;
  background-image:
      linear-gradient(to right, #8b5cf6 var(--progress, 0%), transparent var(--progress, 0%)),
      linear-gradient(to right, #6b7280 var(--buffered-progress, 0%), transparent var(--buffered-progress, 0%));
}

input[type="range"]::-webkit-slider-thumb {
  appearance: none;
  border-radius: 9999px;
  height: 0.75rem;
  width: 0.75rem;
  background-color: #6366f1;
  cursor: pointer;
}

.dark input[type="range"]::-webkit-slider-thumb {
  background-color: #8b5cf6;
}

input[type="range"]::-moz-range-thumb {
  border-radius: 9999px;
  height: 0.75rem;
  width: 0.75rem;
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
  height: 0.25rem;
}

.dark input[type="range"]::-moz-range-progress {
  background-color: #8b5cf6;
}

.progress-bar-volume {
  appearance: none;
  height: 0.25rem;
  background-color: #d1d5db;
  background-image: linear-gradient(to right, #6366f1 var(--progress), transparent 0);
  border-radius: 9999px;
}

.dark .progress-bar-volume {
  background-color: #4b5563;
  background-image: linear-gradient(to right, #8b5cf6 var(--progress), transparent 0);
}

.progress-bar-volume::-webkit-slider-thumb {
  appearance: none;
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 9999px;
  background-color: #6366f1;
  cursor: pointer;
}

.dark .progress-bar-volume::-webkit-slider-thumb {
  background-color: #8b5cf6;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(2px) translateX(-50%);
}

.mt-4.flex-1 {
  scrollbar-width: thin;
  scrollbar-color: #c1c1c1 #f1f1f1;
}
.mt-4.flex-1 {
  overflow: hidden; /* Prevent queue from overflowing the sidebar */
}
.mt-4.flex-1::-webkit-scrollbar {
  width: 6px;
}
.mt-4.flex-1::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}
.mt-4.flex-1::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}
.dark .mt-4.flex-1 {
  scrollbar-color: #4a5568 #2d3748;
}
.dark .mt-4.flex-1::-webkit-scrollbar-track {
  background: #2d3748;
}
.dark .mt-4.flex-1::-webkit-scrollbar-thumb {
  background: #3a3d46;
}
.relative.w-40.h-40.rounded-full {
  border: 2px solid #4b5563; /* Тонкая обводка для светлой темы */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2), inset 0 0 8px rgba(0, 0, 0, 0.1); /* Внешняя и внутренняя тень */
  background: radial-gradient(circle, #1f2937 10%, transparent 11%); /* Центральный круг для винила */
  background-size: 100% 100%;
  background-position: center;
}

.dark .relative.w-40.h-40.rounded-full {
  border: 2px solid #9ca3af; /* Обводка для темной темы */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3), inset 0 0 8px rgba(0, 0, 0, 0.2);
  background: radial-gradient(circle, #4b5563 10%, transparent 11%); /* Центральный круг для темной темы */
}
</style>