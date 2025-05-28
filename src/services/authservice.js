import { useAuthStore } from '@/store/auth';
import api from '@/services/api';


export const startLogin = (provider) => {
  const baseURL = api.defaults.baseURL || 'http://localhost:5000';
  const authUrl = `${baseURL}auth/${provider}`; // Формируем URL для провайдера
  window.location.href = authUrl;
};

export const getUser = async () => {
  const authStore = useAuthStore();
  await authStore.fetchUser();
  return authStore.user;
};

export const logout = () => {
  const authStore = useAuthStore();
  authStore.logout();
};
