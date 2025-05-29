<script setup>
import { ref, computed, watch } from 'vue';
import { useRestorationStore } from '@/store/restoration';
import IconArrowLeft from '@/components/icons/IconArrowLeft.vue';
import api from '@/services/api'; // Импорт api вместо axios

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
const isDragging = ref(false);
const coverError = ref('');
const submissionError = ref('');

const validateCoverFile = (file) => {
  const maxSizeMB = 5;
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  const allowedType = 'image/png';

  if (file.type !== allowedType) {
    return 'Файл должен быть в формате PNG.';
  }
  if (file.size > maxSizeBytes) {
    return `Файл должен быть меньше ${maxSizeMB} МБ.`;
  }
  return '';
};

const hasValidCover = computed(() => {
  return !restorationStore.coverUrl || !coverError.value;
});

const coverPreview = computed(() => restorationStore.coverUrl ? restorationStore.coverUrl : null);

watch(() => restorationStore.title, (newTitle) => {
  restorationStore.setTitle(newTitle);
});
watch(() => restorationStore.author, (newAuthor) => {
  restorationStore.setAuthor(newAuthor);
});
watch(() => restorationStore.year, (newYear) => {
  restorationStore.setYear(newYear);
});
watch(() => restorationStore.album, (newAlbum) => {
  restorationStore.setAlbum(newAlbum);
});
watch(() => restorationStore.country, (newCountry) => {
  restorationStore.setCountry(newCountry);
});

const onDragOver = (event) => {
  event.preventDefault();
  isDragging.value = true;
};

const onDragLeave = () => {
  isDragging.value = false;
};

const onDrop = (event) => {
  event.preventDefault();
  isDragging.value = false;
  const files = event.dataTransfer.files;
  if (files.length) {
    const file = files[0];
    coverError.value = validateCoverFile(file);
    if (!coverError.value) {
      restorationStore.setCoverUrl(URL.createObjectURL(file));
    } else {
      restorationStore.setCoverUrl(null);
    }
  }
};

const onCoverSelect = (event) => {
  const file = event.target.files[0];
  if (file) {
    coverError.value = validateCoverFile(file);
    if (!coverError.value) {
      restorationStore.setCoverUrl(URL.createObjectURL(file));
    } else {
      restorationStore.setCoverUrl(null);
    }
  }
};

const blobToBase64 = async (blobUrl) => {
  try {
    const response = await fetch(blobUrl);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error converting blob to base64:', error);
    return null;
  }
};

const goToNext = async () => {
  if (hasValidCover.value) {
    // Преобразуем coverUrl если это blob
    let coverUrlToSend = restorationStore.coverUrl;
    if (coverUrlToSend && coverUrlToSend.startsWith('blob:')) {
      coverUrlToSend = await blobToBase64(coverUrlToSend);
      if (!coverUrlToSend) {
        submissionError.value = 'Не удалось обработать обложку';
        return;
      }
    }

    const metadata = {
      trackId: restorationStore.trackId,
      title: restorationStore.title || 'Unknown Title',
      author: restorationStore.author || 'Unknown Artist',
      year: restorationStore.year || '',
      album: restorationStore.album || '',
      country: restorationStore.country || '',
      coverUrl: coverUrlToSend || null, // Используем преобразованный URL
    };

    try {
      await api.post('/restoration/metadata', metadata, {
        headers: {
          'Content-Type': 'application/json', // Оставляем только Content-Type, Authorization добавит интерцептор
        },
      });
      restorationStore.setCurrentStep(5);
    } catch (err) {
      console.error('Failed to save metadata:', err);
      submissionError.value = 'Не удалось сохранить метаданные. Попробуйте снова.';
    }
  }
};
</script>

<template>
  <div class="relative flex flex-col items-center justify-center pb-16 pt-16">
    <div class="flex justify-start w-full max-w-screen-lg mb-4">
      <button
        v-if="showBackButton"
        class="flex items-center text-light-text dark:text-dark-text px-4 py-2 rounded cursor-pointer"
        @click="goToPreviousStep"
      >
        <IconArrowLeft class="h-5 w-5 mr-2" />
      </button>
    </div>
    <h1 class="text-3xl font-bold text-light-text dark:text-dark-text mb-6">Редактирование метаданных</h1>
    <div class="bg-light-surface dark:bg-dark-surface p-6 rounded-lg shadow-lg w-full max-w-screen-lg mb-16 sm:mb-0">
      <div v-if="submissionError" class="text-sm text-red-500 mb-4">
        {{ submissionError }}
      </div>
      <div class="">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-15">
        <div>
          <h2 class="text-xl mb-2 text-light-text dark:text-dark-text">Обложка</h2>
          <div
            class="relative w-48 h-48 mx-auto border-2 border-dashed rounded-lg text-center"
            :class="isDragging ? 'border-light-primary bg-light-primary/20 dark:border-dark-primary dark:bg-dark-primary/20' : 'border-gray-500 dark:border-gray-400'"
            @dragover="onDragOver"
            @dragleave="onDragLeave"
            @drop="onDrop"
          >
            <img
              v-if="coverPreview"
              :src="coverPreview"
              alt="Cover"
              class="absolute top-0 left-0 w-full h-full object-cover rounded-lg"
            />
            <div v-else class="flex items-center justify-center h-full text-sm text-light-text-muted dark:text-dark-text-muted">
              Перетащите обложку
            </div>
            <label class="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-light-secondary hover:bg-light-primary text-white px-2 py-1 rounded dark:bg-dark-secondary dark:hover:bg-dark-primary cursor-pointer text-sm">
              <span>Выбрать</span>
              <input type="file" accept="image/png" @change="onCoverSelect" class="hidden" />
            </label>
          </div>
          <div v-if="coverError" class="mt-2 text-sm text-red-500">
            {{ coverError }}
          </div>
          <div v-else-if="restorationStore.coverUrl" class="mt-2 text-sm text-gray-500 dark:text-gray-400 text-center">
            Файл выбран
          </div>
        </div>
        <!-- <div class="flex flex-wrap justify-around gap-x-10"> -->
        <div class="flex flex-col">
          <div class="mb-6">
            <h2 class="text-xl mb-2 text-light-text dark:text-dark-text">Название</h2>
            <input
              type="text"
              v-model="restorationStore.title"
              class="w-full p-2 border border-light-text dark:border-dark-text rounded bg-light-bg text-light-text dark:bg-dark-bg dark:text-dark-text"
              placeholder="Введите название"
            />
          </div>
          <div class="mb-6">
            <h2 class="text-xl mb-2 text-light-text dark:text-dark-text">Автор</h2>
            <input
              type="text"
              v-model="restorationStore.author"
              class="w-full p-2 border border-light-text dark:border-dark-text rounded bg-light-bg text-light-text dark:bg-dark-bg dark:text-dark-text"
              placeholder="Введите автора"
            />
          </div>
          <div class="mb-6">
            <h2 class="text-xl mb-2 text-light-text dark:text-dark-text">Альбом</h2>
            <input
              type="text"
              v-model="restorationStore.album"
              class="w-full p-2 border border-light-text dark:border-dark-text rounded bg-light-bg text-light-text dark:bg-dark-bg dark:text-dark-text"
              placeholder="Введите альбом"
            />
          </div>
        </div>
        <div class="lg:hidden"></div>
        <div class="flex flex-col">
          <div class="mb-6">
            <h2 class="text-xl mb-2 text-light-text dark:text-dark-text">Год</h2>
            <input
              type="text"
              v-model="restorationStore.year"
              class="w-full p-2 border border-light-text dark:border-dark-text rounded bg-light-bg text-light-text dark:bg-dark-bg dark:text-dark-text"
              placeholder="Введите год"
            />
          </div>
          <div class="mb-6">
            <h2 class="text-xl mb-2 text-light-text dark:text-dark-text">Страна</h2>
            <input
              type="text"
              v-model="restorationStore.country"
              class="w-full p-2 border border-light-text dark:border-dark-text rounded bg-light-bg text-light-text dark:bg-dark-bg dark:text-dark-text"
              placeholder="Введите страну"
            />
          </div>
        </div>
        </div>
      </div>
      <button
        class="w-full px-4 py-2 rounded bg-light-primary dark:bg-dark-primary text-dark-text hover:bg-light-secondary dark:hover:bg-dark-secondary"
        @click="goToNext"
      >
        Продолжить
      </button>
    </div>

  </div>
</template>
