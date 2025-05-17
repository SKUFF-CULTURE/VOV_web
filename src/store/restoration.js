import { defineStore } from 'pinia';
import jsmediatags from 'jsmediatags';

export const useRestorationStore = defineStore('restoration', {
  state: () => ({
    currentStep: 1,
    file: null,
    trackId: null, // Храним только trackId
    title: '',
    author: '',
    year: '',
    album: '',
    country: '',
    coverUrl: null,
    restoredAudioUrl: '',
  }),
  actions: {
    setCurrentStep(step) {
      this.currentStep = step;
    },
    setFile(file) {
      this.file = file;
    },
    setTrackId(trackId) {
      this.trackId = trackId;
    },
    setTitle(title) {
      this.title = title;
    },
    setAuthor(author) {
      this.author = author;
    },
    setYear(year) {
      this.year = year;
    },
    setAlbum(album) {
      this.album = album;
    },
    setCountry(country) {
      this.country = country;
    },
    setCoverUrl(url) {
      this.coverUrl = url;
    },
    setRestoredAudioUrl(url) {
      this.restoredAudioUrl = url;
    },
    async parseAudioMetadata(file) {
      if (!file) return;
      try {
        const tags = await new Promise((resolve, reject) => {
          jsmediatags.read(file, {
            onSuccess: (tag) => resolve(tag.tags),
            onError: (error) => reject(error),
          });
        });
        this.setTitle(tags.title || '');
        this.setAuthor(tags.artist || '');
        this.setYear(tags.year || '');
        this.setAlbum(tags.album || '');
        if (tags.picture) {
          const base64String = btoa(
            String.fromCharCode(...new Uint8Array(tags.picture.data))
          );
          this.setCoverUrl(`data:${tags.picture.format};base64,${base64String}`);
        } else {
          this.setCoverUrl(null);
        }
      } catch (error) {
        console.error('Ошибка парсинга метаданных:', error);
        this.setTitle('');
        this.setAuthor('');
        this.setYear('');
        this.setAlbum('');
        this.setCoverUrl(null);
      }
    },
    reset() {
      this.currentStep = 1;
      this.file = null;
      this.trackId = null;
      this.title = '';
      this.author = '';
      this.year = '';
      this.album = '';
      this.country = '';
      this.coverUrl = null;
      this.restoredAudioUrl = '';
    },
  },
});
