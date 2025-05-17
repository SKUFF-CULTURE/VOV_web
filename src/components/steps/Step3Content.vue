<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { useRestorationStore } from '@/store/restoration';
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
const error = ref('');
const pollingInterval = ref(null);

const checkIsReady = async () => {
  if (!restorationStore.trackId) {
    error.value = 'ID трека отсутствует';
    return;
  }

  try {
    const response = await axios.get(`http://localhost:5000/restoration/isReady?trackId=${restorationStore.trackId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
      },
    });
    if (response.status === 200) {
      clearInterval(pollingInterval.value);
      restorationStore.setCurrentStep(4);
    }
  } catch (err) {
    if (err.response && err.response.status === 400) {
      console.log('Трек ещё не готов, повторная проверка...');
    } else {
      error.value = 'Ошибка проверки статуса. Попробуйте снова.';
      clearInterval(pollingInterval.value);
    }
  }
};

onMounted(() => {
  pollingInterval.value = setInterval(checkIsReady, 5000);
  checkIsReady();
});

onUnmounted(() => {
  if (pollingInterval.value) {
    clearInterval(pollingInterval.value);
  }
});
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
    <h1 class="text-3xl font-bold text-light-text dark:text-dark-text mb-6">Обработка аудио</h1>
    <div class="bg-light-surface dark:bg-dark-surface p-6 rounded-lg shadow-lg w-full max-w-md text-center">
      <div v-if="error" class="text-sm text-red-500 mb-4">
        {{ error }}
      </div>
      <div v-else class="text-lg text-light-text dark:text-dark-text">
        Ваш трек обрабатывается, пожалуйста, подождите...
      </div>
    </div>
  </div>
</template>
