```vue
<template>
  <div
      v-if="isVisible"
      class="fixed bottom-0 left-0 right-0 z-60 rounded-t-lg shadow-lg overlay-enter flex flex-col"
      :style="{ top: '57px', height: 'calc(100vh - 57px)', background: backgroundStyle.background }"
  >
    <!-- Header with swipe handle -->
    <div
        class="flex justify-between items-center px-4 py-3 sticky top-0 bg-gradient-to-b from-black/30 to-transparent z-20 flex-shrink-0"
        @touchstart="onOverlayTouchStart"
        @touchmove="onOverlayTouchMove"
        @touchend="onOverlayTouchEnd"
    >
      <h2 class="text-lg font-semibold text-white">Очередь воспроизведения</h2>
      <button
          @click="$emit('close')"
          class="p-2 rounded hover:scale-110 active:scale-95 transition-transform duration-200"
          aria-label="Close queue"
      >
        <ChevronDownIcon class="w-6 h-6 text-white"/>
      </button>
    </div>

    <!-- Tracks container with internal scroll -->
    <div class="flex-1 overflow-y-auto px-4">
      <!-- Current track -->
      <div v-if="currentTrack" class="mb-4">
        <h3 class="text-sm font-semibold text-gray-200 mb-2">Сейчас играет</h3>
        <div
            class="flex items-center p-3 rounded-lg bg-white/10"
            :class="{ 'ring-2 ring-light-primary dark:ring-dark-primary': isCurrentPlaying(currentTrack) }"
        >
          <img
              :src="currentTrack.coverUrl || 'https://via.placeholder.com/40'"
              class="w-10 h-10 rounded mr-3 object-cover"
              alt="Cover"
          />
          <div class="flex-1">
            <p class="text-sm font-medium text-white truncate">{{ currentTrack.title || 'Неизвестный трек' }}</p>
            <p class="text-xs text-gray-300 truncate">{{ currentTrack.author || 'Неизвестный автор' }}</p>
          </div>
          <button
              @click.stop="handlePlayClick(currentTrack)"
              class="ml-2 text-white hover:scale-110 active:scale-95 transition-transform duration-200"
          >
            <component :is="isCurrentPlaying(currentTrack) ? PauseIcon : PlayIcon" class="h-5 w-5"/>
          </button>
        </div>
      </div>

      <!-- Custom queue -->
      <div v-if="customTracks.length" class="mb-4">
        <h3 class="text-sm font-semibold text-gray-200 mb-2">Добавлено мной</h3>
        <div class="grid grid-cols-[1fr,auto] gap-2 items-center space-y-2">
          <draggable
              v-model="customTracks"
              item-key="trackId"
              tag="ul"
              class="space-y-2 col-span-1"
              :animation="0"
              :group="'queue'"
              :force-fallback="true"
              ghost-class="ghost"
              chosen-class="chosen"
              v-if="customTracks.length"
              @start="onDragStart"
              @end="onDragEnd"
          >
            <template #item="{ element: track, index: idx }">
              <li
                  :key="track.trackId"
                  class="flex items-center p-3 rounded-lg bg-white/5 hover:bg-white/10 cursor-move draggable-item relative"
                  :class="{
                    'ring-2 ring-light-primary dark:ring-dark-primary': isCurrentPlaying(track) || selectedTrackId === track.trackId,
                    'bg-white/15': selectedTrackId === track.trackId,
                    'z-10': isDragging && selectedTrackId === track.trackId,
                  }"
                  @touchstart="startTrackSelection($event, track.trackId)"
                  @touchend="endTrackSelection"
                  @click="handleTrackClick(track)"
              >
                <span class="w-5 text-xs text-gray-300 mr-1">{{ idx + 1 }}</span>
                <img
                    :src="track.coverUrl || 'https://via.placeholder.com/32'"
                    class="w-8 h-8 rounded mr-3 object-cover"
                    alt="Cover"
                />
                <div class="flex-1">
                  <p class="text-sm text-white truncate">{{ track.title || 'Неизвестный трек' }}</p>
                  <p class="text-xs text-gray-300 truncate">{{ track.author || 'Неизвестный автор' }}</p>
                </div>
              </li>
            </template>
          </draggable>
          <!-- Buttons for custom tracks -->
          <ul class="space-y-2 col-span-1">
            <li v-for="track in customTracks" :key="track.trackId" class="flex items-center h-[60px]">
              <button
                  @click.stop="handlePlayClick(track)"
                  class="text-white hover:scale-110 active:scale-95 transition-transform duration-200"
              >
                <component :is="isCurrentPlaying(track) ? PauseIcon : PlayIcon" class="h-5 w-5"/>
              </button>
            </li>
          </ul>
        </div>
      </div>

      <!-- Upcoming queue -->
      <div v-if="upcomingTracks.length" class="mb-4">
        <h3 class="text-sm font-semibold text-gray-200 mb-2">Далее в очереди</h3>
        <div class="grid grid-cols-[1fr,auto] gap-2 items-center space-y-2">
          <draggable
              v-model="upcomingTracks"
              item-key="trackId"
              tag="ul"
              class="space-y-2 col-span-1"
              :animation="0"
              :group="'queue'"
              :force-fallback="true"
              ghost-class="ghost"
              chosen-class="chosen"
              v-if="upcomingTracks.length"
              @start="onDragStart"
              @end="onDragEnd"
          >
            <template #item="{ element: track, index: idx }">
              <li
                  :key="track.trackId"
                  class="flex items-center p-3 rounded-lg bg-white/5 hover:bg-white/10 cursor-move draggable-item relative"
                  :class="{
                    'ring-2 ring-light-primary dark:ring-dark-primary': isCurrentPlaying(track) || selectedTrackId === track.trackId,
                    'bg-white/15': selectedTrackId === track.trackId,
                    'z-10': isDragging && selectedTrackId === track.trackId,
                  }"
                  @touchstart="startTrackSelection($event, track.trackId)"
                  @touchend="endTrackSelection"
                  @click="handleTrackClick(track)"
              >
                <span class="w-5 text-xs text-gray-300 mr-1">{{ idx + 1 }}</span>
                <img
                    :src="track.coverUrl || 'https://via.placeholder.com/32'"
                    class="w-8 h-8 rounded mr-3 object-cover"
                    alt="Cover"
                />
                <div class="flex-1">
                  <p class="text-sm text-white truncate">{{ track.title || 'Неизвестный трек' }}</p>
                  <p class="text-xs text-gray-300 truncate">{{ track.author || 'Неизвестный автор' }}</p>
                </div>
              </li>
            </template>
          </draggable>
          <!-- Buttons for upcoming tracks -->
          <ul class="space-y-2 col-span-1">
            <li v-for="track in upcomingTracks" :key="track.trackId" class="flex items-center h-[60px]">
              <button
                  @click.stop="handlePlayClick(track)"
                  class="text-white hover:scale-110 active:scale-95 transition-transform duration-200"
              >
                <component :is="isCurrentPlaying(track) ? PauseIcon : PlayIcon" class="h-5 w-5"/>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Footer with clear queue -->
    <div
        v-if="queueTracks.length"
        class="px-4 py-3 flex justify-between items-center border-t border-gray-300/20 flex-shrink-0"
        :style="footerStyle"
    >
      <span class="text-sm text-gray-300">Всего треков: {{ queueTracks.length }}</span>
      <button
          @click="clearAll"
          class="px-3 py-1 text-sm bg-red-500/20 text-red-400 rounded hover:bg-red-500/30"
      >
        Очистить все
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, defineProps, ref } from 'vue';
import { usePlayerStore } from '@/store/player';
import { useTrackStore } from '@/store/track';
import { PlayIcon, PauseIcon, ChevronDownIcon } from '@heroicons/vue/24/outline';
import { trackService } from '@/services/trackService';
import draggable from 'vuedraggable';

const props = defineProps({
  dominantColor: {
    type: Array,
    default: () => [0, 0, 0],
  },
  secondaryColor: {
    type: Array,
    default: () => [0, 0, 0],
  },
});

const emit = defineEmits(['close']);
const player = usePlayerStore();
const trackStore = useTrackStore();
const isVisible = ref(true);

// Swipe handling for overlay
const overlayTouchStartY = ref(0);
const overlayTouchCurrentY = ref(0);
const isOverlaySwiping = ref(false);

function onOverlayTouchStart(e) {
  if (e.target.closest('.sticky')) {
    overlayTouchStartY.value = e.touches[0].clientY;
    overlayTouchCurrentY.value = overlayTouchStartY.value;
    isOverlaySwiping.value = true;
  }
}

function onOverlayTouchMove(e) {
  if (!isOverlaySwiping.value) return;
  overlayTouchCurrentY.value = e.touches[0].clientY;
  const deltaY = overlayTouchCurrentY.value - overlayTouchStartY.value;
  if (deltaY > 0) {
    e.currentTarget.parentElement.style.transform = `translateY(${deltaY}px)`;
    e.currentTarget.parentElement.style.opacity = 1 - Math.min(deltaY / 300, 1);
  }
}

function onOverlayTouchEnd(e) {
  if (!isOverlaySwiping.value) return;
  const deltaY = overlayTouchCurrentY.value - overlayTouchStartY.value;
  if (deltaY > 100) {
    emit('close');
  }
  isOverlaySwiping.value = false;
  e.currentTarget.parentElement.style.transform = '';
  e.currentTarget.parentElement.style.opacity = '';
}

// Track selection and drag handling
const selectedTrackId = ref(null);
const isDragging = ref(false);
let longPressTimeout = null;

function startTrackSelection(e, trackId) {
  if (e.target.closest('.draggable-item') && !e.target.closest('button')) {
    longPressTimeout = setTimeout(() => {
      selectedTrackId.value = trackId;
    }, 300);
  }
}

function endTrackSelection() {
  clearTimeout(longPressTimeout);
  if (!isDragging.value) {
    selectedTrackId.value = null;
  }
}

function onDragStart() {
  isDragging.value = true;
}

function onDragEnd() {
  isDragging.value = false;
  selectedTrackId.value = null;
}

// Handle track click
function handleTrackClick(track) {
  if (isDragging.value || selectedTrackId.value) return; // Игнорируем клик, если идет перетаскивание или долгое нажатие
  if (!track || !track.trackId) return;
  handlePlayClick(track);
}

// Background style
const backgroundStyle = computed(() => {
  const [r1 = 0, g1 = 0, b1 = 0] = props.dominantColor || [0, 0, 0];
  const [r2 = 0, g2 = 0, b2 = 0] = props.secondaryColor || [0, 0, 0];
  return {
    background: `linear-gradient(to bottom, rgb(${r1}, ${g1}, ${b1}), rgb(${r2}, ${g2}, ${b2}))`,
  };
});

// Footer style
const footerStyle = computed(() => {
  const [r1 = 0, g1 = 0, b1 = 0] = props.dominantColor || [0, 0, 0];
  return {
    background: `rgba(${r1}, ${g1}, ${b1}, 0.3)`,
    boxShadow: '0 -2px 4px rgba(0, 0, 0, 0.1)',
  };
});

// Track map
const trackMap = computed(() => {
  const map = new Map();
  const tracks = [
    ...trackStore.userLibrary,
    ...trackStore.topPlays,
    ...trackStore.topLikes,
    ...trackStore.newTracks,
    ...trackStore.searchResults,
  ];
  tracks.forEach((track) => track && track.trackId && map.set(track.trackId, track));
  return map;
});

const queueTracks = computed(() => {
  const tracks = player.queueTracks.map((id) => {
    const t = trackMap.value.get(id);
    return t
        ? { ...t, streamUrl: trackService.getStreamUrl(t.trackId) || '' }
        : { trackId: id, title: '…', author: '', coverUrl: '', streamUrl: '' };
  }).filter(track => track && track.trackId);
  return tracks;
});

const currentTrack = computed(() => {
  const track = queueTracks.value.find((t) => t.trackId === player.currentTrackId) || null;
  return track;
});

const customTracks = computed({
  get() {
    const tracks = queueTracks.value
        .filter((t) => player.customQueue.includes(t.trackId))
        .filter((t) => t.trackId !== player.currentTrackId);
    return tracks;
  },
  set(newTracks) {
    if (!Array.isArray(newTracks) || newTracks.some((track) => !track || !track.trackId)) {
      console.error('Invalid customTracks:', newTracks);
      return;
    }
    const newCustomQueue = newTracks.map((track) => track.trackId);
    const newQueue = [
      ...(player.currentTrackId ? [player.currentTrackId] : []),
      ...newCustomQueue,
      ...player.baseQueue.filter((id) => !newCustomQueue.includes(id)),
    ];
    player.customQueue = newCustomQueue;
    player.queueTracks = newQueue;
  },
});

const upcomingTracks = computed({
  get() {
    const tracks = queueTracks.value.filter(
        (t) => t.trackId !== player.currentTrackId && !player.customQueue.includes(t.trackId)
    );
    return tracks;
  },
  set(newTracks) {
    if (!Array.isArray(newTracks) || newTracks.some((track) => !track || !track.trackId)) {
      console.error('Invalid upcomingTracks:', newTracks);
      return;
    }
    const newBaseQueue = newTracks.map((track) => track.trackId);
    const newQueue = [
      ...(player.currentTrackId ? [player.currentTrackId] : []),
      ...player.customQueue,
      ...newBaseQueue,
    ];
    player.baseQueue = newBaseQueue;
    player.queueTracks = newQueue;
  },
});

const isCurrentPlaying = computed(() => (t) => t && t.trackId && player.currentTrackId === t.trackId && player.isPlaying);

function handlePlayClick(track) {
  if (!track || !track.trackId) return;
  if (isCurrentPlaying.value(track)) {
    player.pause();
  } else {
    player.playTrack(track.trackId);
  }
}

function clearAll() {
  player.clearQueue();
  emit('close');
}
</script>

<style scoped>
.overlay-enter {
  animation: slide-up 0.3s ease;
}
.overlay-exit {
  animation: slide-up 0.3s ease reverse;
}

@keyframes slide-up {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.draggable-item {
  transition: background-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
}
.draggable-item:hover {
  cursor: grab;
}
.dragging .draggable-item {
  cursor: grabbing;
  transform: scale(1.03);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.ghost {
  opacity: 0.3;
  background: rgba(255, 255, 255, 0.1);
  border: 1px dashed rgba(255, 255, 255, 0.5);
}

.chosen {
  opacity: 0 !important;
  visibility: hidden !important;
}

.list-move,
.list-enter-active {
  transition: all 0.1s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background-color: transparent;
}
::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
}

/* Ensure buttons align with draggable items */
.grid {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
}
.grid ul {
  margin: 0;
}
.grid li {
  height: 60px; /* Match the height of draggable items */
}
</style>
```
