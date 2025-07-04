import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/store/auth';

// Layouts
import MainLayout from '@/components/Layout/MainLayout.vue';
import BlankLayout from '@/components/Layout/BlankLayout.vue';

// Pages
import Home from '@/views/Home.vue';
import Restoration from '@/views/Restoration.vue';
import Collection from '@/views/Collection.vue';
import Library from '@/views/Library.vue';
import Login from '@/views/Login.vue';
import Callback from '@/views/Callback.vue';

const routes = [
  // Все страницы с шапкой / сайдбаром / футером
  {
    path: '/',
    component: MainLayout,
    beforeEnter: (to, from, next) => {
      const authStore = useAuthStore();
      // Если это Home ('/'), пропускаем без проверки токена
      if (to.path === '/') {
        next();
      }
      // Для остальных маршрутов проверяем токен
      else if (!authStore.token) {
        next('/login');
      } else {
        next();
      }
    },
    children: [
      { path: '', name: 'Главная', component: Home, meta: { hideMusic: true } },
      { path: 'restoration', name: 'Реставрация', component: Restoration },
      { path: 'collection', name: 'Коллекция', component: Collection, meta: {keepAlive: true}},
      { path: 'library', name: 'Library', component: Library, meta: {keepAlive: true} },
    ],
  },

  // Страницы без лейаута
  {
    path: '/login',
    component: BlankLayout,
    beforeEnter: (to, from, next) => {
      const authStore = useAuthStore();
      if (authStore.token) return next('/');
      next();
    },
    children: [
      { path: '', name: 'Login', component: Login },
    ],
  },
  {
    path: '/callback',
    component: BlankLayout,
    children: [
      { path: '', name: 'Callback', component: Callback },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
