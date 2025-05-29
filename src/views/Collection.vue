<template>
    <div class="flex-1 flex flex-col min-h-0 max-w-screen-lg mx-auto mt-20">
      <div class="flex items-center justify-between mb-4">
        <h1 class="text-xl font-bold text-gray-900 dark:text-gray-100">Коллекция</h1>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="tag in availableTags"
            :key="tag"
            @click="toggleTag(tag)"
            :class="[
              'px-3 py-1 rounded-full text-sm',
              selectedTags.includes(tag)
                    ? 'bg-light-primary dark:bg-dark-primary text-dark-text'
                    : 'bg-light-surface dark:bg-dark-surface text-light-text dark:text-dark-text'
            ]"
          >
            {{ tag }}
          </button>
        </div>
      </div>
      <div class="flex overflow-auto transition-colors duration-150 justify-center">
        <div class="flex flex-wrap justify-start gap-5">
          <TrackCard
            class="w-38 sm:w-60"
            v-for="t in userLibrary"
            :key="t.trackId"
            :track="t"
            section="userLibrary"
            @play-track="playTrack"
            @toggle-play="togglePlay"
            @add-to-queue="addToQueue"
            @add-next="addNext"
            @remove-from-library="removeFromLibrary"
          />
        </div>
      </div>
    </div>
  </template>

  <script setup>
  import { ref, onMounted } from 'vue';
  import { useTrackStore } from '@/store/track';
  import { usePlayerStore } from '@/store/player';
  import { useAuthStore } from '@/store/auth';
  import { useToast } from 'vue-toastification';

  import TrackCard from '@/components/TrackLayout/TrackCard.vue';

  const trackStore = useTrackStore();
  const playerStore = usePlayerStore();
  const authStore = useAuthStore();
  const toast = useToast();

  // Локальный массив для рендера
  const userLibrary = ref([]);

  // Теги для коллекции
  const availableTags = ['Sad', 'Heroic', 'Positive', 'Depressive', 'Patriotic', 'Victorious', 'Lyrical'];
  const selectedTags = ref([]);

  // Загрузка коллекции при монтировании
  onMounted(async () => {
    if (!authStore.userId) {
      userLibrary.value = [];
      return;
    }
    try {
      await trackStore.fetchUserLibrary();
      userLibrary.value = trackStore.userLibrary;
    } catch (err) {
      console.error('Ошибка загрузки коллекции:', err);
      toast.error('Не удалось загрузить вашу коллекцию');
    }
  });

  // Обработчик переключения тегов
  const toggleTag = async (tag) => {
    if (selectedTags.value.includes(tag)) {
      selectedTags.value = selectedTags.value.filter(t => t !== tag);
    } else {
      selectedTags.value = [...selectedTags.value, tag];
    }
    try {
      await trackStore.fetchUserLibrary(selectedTags.value);
      userLibrary.value = trackStore.userLibrary;
    } catch (err) {
      console.error('Ошибка загрузки коллекции по тегам:', err);
      toast.error('Не удалось загрузить коллекцию по тегам');
    }
  };

  // События от карточек
  const playTrack = trackId => {
    playerStore.playTrack(trackId, 'userLibrary', { skipQueue: true });
  };
  const togglePlay = trackId => {
    playerStore.togglePlay(trackId);
  };
  const addToQueue = trackId => {
    playerStore.enqueue(trackId);
    toast.success('Трек добавлен в очередь');
  };
  const addToNext = trackId => {
    playerStore.enqueueNext(trackId);
    toast.success('Трек добавлен следующим');
  };
  const removeFromLibrary = async trackId => {
    try {
      await trackStore.removeFromLibrary(trackId);
      userLibrary.value = trackStore.userLibrary;
      toast.success('Трек удалён из коллекции');
    } catch (err) {
      console.error('Ошибка удаления из коллекции:', err);
      toast.error('Не удалось удалить трек');
    }
  };
  </script>

  <style scoped>
  /* Стили аналогичны предыдущим */
  </style>
