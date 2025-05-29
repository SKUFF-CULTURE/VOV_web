import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import '@/assets/input.css'   // подключение Tailwind
import { useThemeStore, applyTheme } from '@/store/theme'
import { useAuthStore } from '@/store/auth';
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";
// Nasrano
// if ('serviceWorker' in navigator) {
//   navigator.serviceWorker.getRegistrations().then(regs => {
//     for (const reg of regs) {
//       reg.unregister();
//     }
//   });
// }

const app = createApp(App)
const pinia = createPinia()

app.use(Toast)
app.use(pinia)
app.use(router)

const theme = useThemeStore(pinia)
applyTheme(theme.mode)

const authStore = useAuthStore();
authStore.initialize().then(() => {
  app.mount('#app');
});
