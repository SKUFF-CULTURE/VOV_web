<!-- src/components/TrackCard.vue -->
<script setup>
import { ref, computed, reactive, onMounted, onUnmounted } from 'vue'
import { usePlayerStore } from '@/store/player'
import {
  PlayIcon,
  PauseIcon
} from '@heroicons/vue/24/outline'

let lastTap = 0

/* ────────── props / emits ────────── */
const props = defineProps({
  track:   { type: Object, required: true },
  section: { type: String, default: 'userLibrary' }
})
const emit = defineEmits([
  'play-track', 'toggle-play',
  'add-to-queue', 'add-next', 'remove-from-library'
])

/* ────────── stores / state ────────── */
const player = usePlayerStore()

const isCurrent = computed(() => player.currentTrackId === props.track.trackId)
const isPlaying = computed(() => player.isPlaying && isCurrent.value)

const windowWidth = ref(window.innerWidth)
const isMobile    = computed(() => windowWidth.value <= 768)

const showOverlay = ref(false)   // только мобилка
const showMenu    = ref(false)

const triggerRef = ref(null)
const menuRef    = ref(null)

/* ────────── overlay (mobile) ────────── */
function handleCardClick () { if (isMobile.value) showOverlay.value = true }
function hideOverlay ()      { showOverlay.value = false }

/* ────────── меню ────────── */
function toggleMenu () { showMenu.value = !showMenu.value }
function closeMenu ()  { showMenu.value = false }

const menuStyle = reactive({ left:'0px', top:'0px' })
function calcMenuPos () {
  if (!triggerRef.value || !showMenu.value) return
  const r = triggerRef.value.getBoundingClientRect()
  menuStyle.left = `${r.left}px`
  menuStyle.top  = `${r.bottom}px`
}

/* ────────── клик/hover вне меню / карточки ────────── */
function handleCardMouseLeave (e) {
  if (isMobile.value) return            // только ПК
  if (menuRef.value?.contains(e.relatedTarget)) return
  closeMenu()
}
function handleClickOutside (e) {
  // закрытие меню
  if (
      showMenu.value &&
      !menuRef.value?.contains(e.target) &&
      !triggerRef.value?.contains(e.target)
  ) closeMenu()

  // закрытие оверлея (только мобилка)
  if (
      isMobile.value && showOverlay.value &&
      !e.target.closest('.group')?.contains(triggerRef.value) && // клик вне текущей карточки
      !menuRef.value?.contains(e.target)    // и не меню
  ) hideOverlay()
}

function onTrigger () {
  const now = Date.now()
  if (now - lastTap < 200) return            // игнорируем второй (синтетический) клик
  lastTap = now

  showMenu.value = !showMenu.value
  if (showMenu.value) calcMenuPos()
  if (isMobile.value) showOverlay.value = true
}

/* ────────── действия ────────── */
function onPlay () {
  if (isCurrent.value) emit('toggle-play')
  else                 emit('play-track', props.track.trackId, props.section)
}
const onAddNext        = () => { emit('add-next',           props.track.trackId); closeMenu() }
const onAddToQueue     = () => { emit('add-to-queue',       props.track.trackId); closeMenu() }
const onRemoveFromLib  = () => { emit('remove-from-library',props.track.trackId); closeMenu() }

/* ────────── lifecycle ────────── */
onMounted(() => {
  document.addEventListener('click',      handleClickOutside)
  document.addEventListener('touchstart', handleClickOutside)
  window.addEventListener('resize', () => {
    windowWidth.value = window.innerWidth
    calcMenuPos()
  })
  window.addEventListener('scroll', calcMenuPos, { passive: true })
})
onUnmounted(() => {
  document.removeEventListener('click',      handleClickOutside)
  document.removeEventListener('touchstart', handleClickOutside)
  window.removeEventListener('resize',       calcMenuPos)
  window.removeEventListener('scroll',       calcMenuPos)
})
</script>

<template>
  <div
      class="bg-light-surface dark:bg-dark-surface shadow-lg rounded p-3
           overflow-visible group relative"
      @click="handleCardClick"
      @touchstart="handleCardClick"
      @mouseleave="handleCardMouseLeave"
  >
    <!-- обложка -->
    <div class="w-full aspect-square overflow-hidden rounded">
      <img
          :src="props.track.coverUrl || 'https://via.placeholder.com/256'"
          :alt="props.track.title || 'Трек'"
          class="w-full h-full object-cover"
      />
    </div>

    <!-- overlay -->
    <div
        class="absolute inset-0 rounded flex items-center justify-evenly
             bg-black transition-opacity duration-200 z-[5]"
        :class="{
        'opacity-0 group-hover:opacity-60' : !isMobile,
        'opacity-60'                       :  isMobile && showOverlay,
        'opacity-0'                        :  isMobile && !showOverlay
      }"
    >
      <!-- play / pause -->
      <button
          @click.stop="onPlay"
          class="p-1 hover:scale-110 text-white transition-transform duration-200"
          :disabled="isMobile && !showOverlay"
      >
        <component :is="isPlaying ? PauseIcon : PlayIcon" class="w-8 h-8" />
      </button>

      <!-- три точки -->
      <div class="relative">
        <button
            ref="triggerRef"
            @click.stop="onTrigger"
            @mouseenter="!isMobile && (showMenu = true); calcMenuPos()"
            class="p-1 hover:scale-110 text-white transition-transform duration-200"
           :disabled="isMobile && !showOverlay"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
               fill="currentColor" viewBox="0 0 16 16">
            <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5
                     0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5
                     0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- меню -->
    <transition name="fade">
      <div
          v-if="showMenu"
          ref="menuRef"
          class="fixed z-[100] w-40 bg-white dark:bg-dark-surface
               shadow-xl rounded-md overflow-hidden"
          :style="menuStyle"
      >
        <button
            @click="onAddNext"
            class="block w-full text-left px-4 py-2 text-sm
                 text-light-text dark:text-dark-text
                 hover:bg-light-primary dark:hover:bg-dark-primary"
        >Добавить следующим</button>

        <button
            @click="onAddToQueue"
            class="block w-full text-left px-4 py-2 text-sm
                 text-light-text dark:text-dark-text
                 hover:bg-light-primary dark:hover:bg-dark-primary"
        >Добавить в очередь</button>

        <button
            @click="onRemoveFromLib"
            class="block w-full text-left px-4 py-2 text-sm
                 text-light-text dark:text-dark-text
                 hover:bg-light-primary dark:hover:bg-dark-primary"
        >Удалить из коллекции</button>
      </div>
    </transition>

    <!-- название / автор -->
    <div class="p-3">
      <h3 class="text-xs sm:text-base text-light-text dark:text-dark-text text-base font-semibold truncate">
        {{ props.track.title || 'Без названия' }}
      </h3>
      <p class="text-xs sm:text-xs text-light-text-muted dark:text-dark-text-muted text-sm truncate">
        {{ props.track.author || 'Неизвестный исполнитель' }}
        <span v-if="props.track.year"> – {{ props.track.year }}</span>
      </p>
    </div>
  </div>
</template>

<style scoped>
.text-light-text-muted { font-size:.875rem; color:#6b7280 }
.dark .text-dark-text-muted { color:#9ca3af }

.fade-enter-active, .fade-leave-active {
  transition: opacity .15s ease, transform .15s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity:0; transform:translateY(-4px);
}
button:disabled { opacity:.5; cursor:not-allowed }
</style>
