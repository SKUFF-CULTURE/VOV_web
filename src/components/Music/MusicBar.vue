<template>
  <div
      class="bg-light-surface dark:bg-dark-surface border-t border-gray-200 dark:border-dark-border py-4 px-6 flex flex-wrap items-center justify-between h-20 gap-y-2 md:gap-y-0"
  >
    <div class="flex items-center space-x-3 w-1/4 min-w-[200px]">
      <img
          :src="currentTrack?.coverUrl || defaultCover"
          alt="Cover"
          class="w-12 h-12 object-cover rounded bg-gray-100 dark:bg-gray-700"
      />
      <div class="flex flex-col truncate">
        <p class="text-sm font-semibold text-light-text dark:text-dark-text truncate">
          {{ currentTrack?.title || 'Трек' }}
        </p>
        <p class="text-xs text-light-text-muted dark:text-dark-text-muted truncate">
          {{ currentTrack?.author || 'Исполнитель' }}
        </p>
      </div>
      <button
          @click="onToggleLibrary"
          class="p-2 rounded text-light-text dark:text-dark-text hover:scale-110 active:scale-95 transition-transform duration-200"
      >
        <HeartIcon :class="['w-5 h-5', isInLibrary ? 'dark:text-dark-primary text-light-primary fill-current' : '']" />
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
              class="absolute left-1/2 -translate-x-1/2 bottom-12 w-64 p-3 bg-light-surface dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded shadow-lg text-sm text-light-text dark:text-dark-text z-10"
          >
            <p><strong>Год:</strong> {{ currentTrack?.year || 'Unknown' }}</p>
            <p><strong>Альбом:</strong> {{ currentTrack?.album || 'Unknown' }}</p>
            <p><strong>Страна:</strong> {{ currentTrack?.country || 'Unknown' }}</p>
            <p><strong>Лайки:</strong> {{ currentTrack?.likes || 0 }}</p>
            <p><strong>Прослушивания:</strong> {{ currentTrack?.playCount || 0 }}</p>
          </div>
        </transition>
      </div>
      <div
          class="relative"
          @mouseenter="handleMouseEnter"
          @mouseleave="handleMouseLeave"
      >
        <button
            class="p-2 rounded text-light-text dark:text-dark-text hover:scale-110 active:scale-95 transition-transform duration-200"
            title="Пожаловаться на трек"
        >
          <FlagIcon class="w-5 h-5" />
        </button>
        <transition name="fade">
          <div
              v-if="showReportTooltip && currentTrack"
              @mouseleave="handleTooltipMouseLeave"
              class="absolute left-1/2 -translate-x-1/2 bottom-12 w-64 p-3 bg-light-bg dark:bg-dark-bg rounded shadow-lg text-sm text-light-text dark:text-dark-text z-10"
          >
            <p class="mb-2">Пожаловаться на трек "{{ currentTrack?.title || 'Трек' }}"</p>
            <button
                @click="onReportTrack"
                class="w-full px-3 py-1 rounded-md text-sm bg-light-primary dark:bg-dark-primary text-light-text dark:text-dark-text hover:bg-light-primary/80 dark:hover:bg-dark-primary/80 transition-colors"
            >
              Пожаловаться
            </button>
          </div>
        </transition>
      </div>
    </div>

    <div class="flex flex-col items-center flex-1">
      <div class="flex items-center space-x-4">
        <button
            @click="onShuffle"
            :class="playerStore.shuffleActive ? 'text-light-primary dark:text-dark-primary' : 'text-light-text dark:text-dark-text'"
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
        <button
            @click="onPrev"
            class="p-2 rounded text-light-text dark:text-dark-text hover:scale-110 active:scale-95 transition-transform duration-200"
        >
          <ChevronLeftIcon class="w-6 h-6" />
        </button>
        <button
            @click="onTogglePlay"
            class="p-2 rounded-full bg-light-primary dark:bg-dark-primary text-dark-text hover:scale-110 active:scale-95 transition-transform duration-200"
        >
          <component :is="playerStore.isPlaying ? PauseIcon : PlayIcon" class="w-6 h-6" />
        </button>
        <button
            @click="onNext"
            class="p-2 rounded text-light-text dark:text-dark-text hover:scale-110 active:scale-95 transition-transform duration-200"
        >
          <ChevronRightIcon class="w-6 h-6" />
        </button>
        <button
            @click="onToggleLoop"
            :class="loopClass"
            class="p-2 rounded hover:scale-110 active:scale-95 transition-transform duration-200"
            title="Режим повтора"
        >
          <div class="relative w-6 h-6">
            <ArrowPathRoundedSquareIcon class="w-full h-full" />
            <span
                v-if="playerStore.loopMode === 'one'"
                class="absolute bottom-0 right-0 bg-light-primary dark:bg-dark-primary text-white text-[10px] font-bold rounded-full w-3 h-3 flex items-center justify-center"
            >1</span>
          </div>
        </button>
      </div>
      <div class="flex items-center space-x-2 w-full max-w-2xl mt-1">
        <span class="text-xs text-light-text dark:text-dark-text">{{ formatTime(currentTime) }}</span>
        <input
            type="range"
            min="0"
            :max="duration"
            v-model.number="currentTime"
            @input="onSeek"
            class="flex-1 progress-bar-time"
            :style="{ '--progress': `${(currentTime / duration) * 100}%`, '--buffered-progress': `${bufferedProgress}%` }"
        />
        <span class="text-xs text-light-text dark:text-dark-text">{{ formatTime(duration) }}</span>
      </div>
    </div>

    <div class="flex items-center space-x-4 w-1/4 justify-end min-w-[200px] relative">
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
            class="w-5 h-5 text-light-primary dark:text-dark-primary hover:scale-110 active:scale-95"
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
      <button @click="onToggleQueue" class="p-2 rounded">
        <QueueListIcon class="w-5 h-5 text-light-text dark:text-dark-text hover:scale-110 active:scale-95 transition-transform duration-200"/>
      </button>
      <QueuePopOver v-if="showQueue" @close="showQueue = false" />
      <button
          @click="onToggleMute"
          class="p-2 rounded text-light-text dark:text-dark-text hover:scale-110 active:scale-95 transition-transform duration-200"
      >
        <component :is="isMuted ? SpeakerXMarkIcon : SpeakerWaveIcon" class="w-5 h-5" />
      </button>
      <div class="flex items-center space-x-2">
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
          @click="onToggleFloat"
          class="p-2 rounded text-light-text dark:text-dark-text hover:scale-110 active:scale-95 transition-transform duration-200"
      >
        <ArrowsPointingOutIcon class="w-5 h-5" />
      </button>
    </div>
    <DesktopLyricsOverlay v-model:visible="showLyricsOverlay" />
  </div>
</template>

<script setup>
import QueuePopOver from '@/components/Music/QueuePopOver.vue';
import DesktopLyricsOverlay from '@/components/Music/DesktopLyricsOverlay.vue';
import { ref, computed } from 'vue';
import { usePlayerStore } from '@/store/player';
import { useTrackStore } from '@/store/track';
import { useMusicStore } from '@/store/music';
import { useToast } from 'vue-toastification';
import {
  HeartIcon,
  PlayIcon,
  PauseIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowPathRoundedSquareIcon,
  MicrophoneIcon,
  ArrowsPointingOutIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  QueueListIcon,
  InformationCircleIcon,
  FlagIcon,
} from '@heroicons/vue/24/outline';

defineProps({
  audioElement: {
    type: Object,
    default: null
  }
});

const playerStore = usePlayerStore();
const trackStore = useTrackStore();
const musicStore = useMusicStore();
const toast = useToast();

const showVolumeHint = ref(false);
const showQueue = ref(false);
const showInfoTooltip = ref(false);
const showReportTooltip = ref(false);
const currentVersion = ref('processed');
let tooltipTimeout = null;
const defaultCover = 'src/assets/question-svg.svg';

const showLyricsOverlay = ref(false);

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
  set: (value) => playerStore.seek(value)
});
const duration = computed(() => playerStore.duration);
const volume = computed({
  get: () => playerStore.volume,
  set: (value) => playerStore.updateVolume(value)
});
const isMuted = computed(() => playerStore.isMuted);
const bufferedProgress = computed(() => playerStore.bufferedProgress);

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

async function onReportTrack() {
  if (!currentTrack.value?.trackId) {
    toast.error('Не выбран трек для жалобы');
    return;
  }
  try {
    await trackStore.reportTrack(currentTrack.value.trackId);
    toast.success('Жалоба отправлена');
    showReportTooltip.value = false; // Закрываем окно после отправки
    clearTimeout(tooltipTimeout);
  } catch (error) {
    console.error('Report track error:', error);
    toast.error('Не удалось отправить жалобу');
  }
}

const handleMouseEnter = () => {
  clearTimeout(tooltipTimeout); // Сбрасываем таймер при наведении
  showReportTooltip.value = true;
};

const handleMouseLeave = () => {
  tooltipTimeout = setTimeout(() => {
    showReportTooltip.value = false;
  }, 1000);
};

const handleTooltipMouseLeave = () => {
  // Закрываем окно сразу, если покинули само окно
  clearTimeout(tooltipTimeout); // Очищаем таймер
  showReportTooltip.value = false;
};


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

function onToggleQueue() {
  showQueue.value = !showQueue.value;
}

function onSpeechToText(){ showLyricsOverlay.value = true; }

function onToggleFloat() {
  musicStore.toggleSidebar();
}

function onSeek() {
  playerStore.seek(currentTime.value);
}

function onUpdateVolume() {
  playerStore.updateVolume(volume.value);
}

function onToggleMute() {
  playerStore.toggleMute();
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

.icon-offset {
  transform: translateX(1px);
}
</style>