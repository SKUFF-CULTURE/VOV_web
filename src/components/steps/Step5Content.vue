<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRestorationStore } from '@/store/restoration';
import { useAuthStore } from '@/store/auth';
import IconArrowLeft from '@/components/icons/IconArrowLeft.vue';
import axios from 'axios';

defineProps({
  goToPreviousStep: {
    type: Function,
    default: () => {},
  },
  showBackButton: {
    type: Boolean,
    default: false,
  },
});

const restorationStore = useRestorationStore();
const authStore = useAuthStore();
const error = ref('');

onMounted(async () => {
  await authStore.initialize(); // Инициализация authStore
  fetchRestoredAudioUrl();
});

const metadata = computed(() => ({
  title: restorationStore.title || 'Sample Title',
  author: restorationStore.author || 'Sample Author',
  year: restorationStore.year || 'Не указан',
  album: restorationStore.album || 'Не указан',
  country: restorationStore.country || 'Не указана',
  cover: restorationStore.coverUrl || 'https://via.placeholder.com/150',
  restoredAudioUrl: restorationStore.restoredAudioUrl || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
}));

const fetchRestoredAudioUrl = async () => {
  try {
    const response = await axios.get(`http://localhost:5000/restoration/download/${restorationStore.trackId}?version=original`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
      },
      params: {
        version: 'processed',
      },
    });
    console.log(response.data.url)
    restorationStore.setRestoredAudioUrl(response.data.url);
  } catch (err) {
    console.error('Failed to fetch restored audio URL:', err);
    error.value = 'Не удалось загрузить трек.';
  }
};

const addToCollection = async () => {
  if (!authStore.user || !authStore.user.id) {
    error.value = 'Пользователь не авторизован. Пожалуйста, войдите в систему.';
    return;
  }

  try {
    await axios.post('http://localhost:5000/users/library', {
      userId: parseInt(authStore.user.id), // Используем user.id
      trackId: restorationStore.trackId,
    }, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
        'Content-Type': 'application/json',
      },
    });
    alert('Трек добавлен в вашу коллекцию!');
  } catch (err) {
    console.error('Failed to add to collection:', err);
    error.value = 'Не удалось добавить трек в коллекцию.';
  }
};

const downloadAudio = async () => {
  if (restorationStore.restoredAudioUrl) {
    window.open(restorationStore.restoredAudioUrl, '_blank');
  } else {
    error.value = 'URL трека недоступен.';
  }
};

const restart = () => {
  restorationStore.reset();
};
</script>

<template>
  <div class="relative h-full flex flex-col items-center justify-center p-4">
    <div class="flex justify-start w-full max-w-md mb-4">
      <button
        v-if="showBackButton"
        class="flex items-center text-light-text dark:text-dark-text px-4 py-2 rounded cursor-pointer"
        @click="goToPreviousStep"
      >
        <IconArrowLeft class="h-5 w-5 mr-2" />
      </button>
    </div>
    <h1 class="text-3xl font-bold text-light-text dark:text-dark-text mb-6">Реставрация завершена</h1>
    <div class="bg-light-surface dark:bg-dark-surface p-6 rounded-lg shadow-lg w-full max-w-md text-left">
      <div v-if="error" class="text-sm text-red-500 mb-4">
        {{ error }}
      </div>
      <div class="flex flex-wrap justify-around mb-4">
        <img :src="metadata.cover" alt="Cover" class="w-32 h-32 rounded" />
        <div class="flex flex-col text-left justify-center">
          <div class="flex flex-row">
            <p class="text-lg text-light-text-muted dark:text-dark-text-muted mr-4">Название:</p>
            <p class="text-lg text-light-text dark:text-dark-text">{{ metadata.title }}</p>
          </div>
          <div class="flex flex-row">
            <p class="text-lg text-light-text-muted dark:text-dark-text-muted mr-4">Автор:</p>
            <p class="text-lg text-light-text dark:text-dark-text">{{ metadata.author }}</p>
          </div>
          <div class="flex flex-row">
            <p class="text-lg text-light-text-muted dark:text-dark-text-muted mr-4">Год:</p>
            <p class="text-lg text-light-text dark:text-dark-text">{{ metadata.year }}</p>
          </div>
          <div class="flex flex-row">
            <p class="text-lg text-light-text-muted dark:text-dark-text-muted mr-4">Альбом:</p>
            <p class="text-lg text-light-text dark:text-dark-text">{{ metadata.album }}</p>
          </div>
          <div class="flex flex-row">
            <p class="text-lg text-light-text-muted dark:text-dark-text-muted mr-4">Страна:</p>
            <p class="text-lg text-light-text dark:text-dark-text">{{ metadata.country }}</p>
          </div>
        </div>
      </div>
      <audio :src="metadata.restoredAudioUrl" controls class="w-full mb-4"></audio>
      <div class="flex justify-center gap-3">
        <button
          class="px-4 py-2 rounded bg-light-primary dark:bg-dark-primary text-dark-text hover:bg-light-secondary dark:hover:bg-dark-secondary"
          @click="downloadAudio"
        >
          Скачать
        </button>
        <button
          class="px-4 py-2 rounded bg-light-primary dark:bg-dark-primary text-dark-text hover:bg-light-secondary dark:hover:bg-dark-secondary"
          @click="addToCollection"
        >
          Добавить в коллекцию
        </button>
        <button
          class="px-4 py-2 rounded bg-gray-300 dark:bg-gray-600 text-dark-text hover:bg-gray-400 dark:hover:bg-gray-500"
          @click="restart"
        >
          В начало
        </button>
      </div>
    </div>
  </div>
</template>
