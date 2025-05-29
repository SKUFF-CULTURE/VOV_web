<template>
  <teleport to="body">
    <transition name="fade-scale">
      <div
          v-if="visible"
          class="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center select-none backdrop-blur-sm"
          @click.self="close"
      >

        <div class="w-full max-w-2xl px-6">
          <template v-if="player.currentLyrics.length === 0">
            <div class="h-[300px] w-full flex items-center justify-center text-white/90 text-sm">
              {{ player.currentTrackId ? 'Загрузка…' : 'Текст песни отсутствует' }}
            </div>
          </template>

          <template v-else>
            <div class="h-[300px] w-full relative">
              <LyricsKaraoke class="absolute inset-0" />
            </div>
          </template>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { defineProps, defineEmits, onMounted, onBeforeUnmount } from 'vue'
import { usePlayerStore } from '@/store/player'
import LyricsKaraoke from './LyricsKaraoke.vue'

defineProps({ visible: Boolean })
const emit = defineEmits(['update:visible'])

const player = usePlayerStore()


function close () { emit('update:visible', false) }
function onEsc (e) { if (e.key === 'Escape') close() }

onMounted(() => window.addEventListener('keydown', onEsc))
onBeforeUnmount(() => window.removeEventListener('keydown', onEsc))
</script>