// src/services/trackService.js
import api from '@/services/api';

function normalize(raw) {
  return {
    trackId: raw.trackid,
    title: raw.title,
    author: raw.author,
    album: raw.album,
    year: raw.year,
    country: raw.country,
    coverUrl: raw.coverurl,
    likes: raw.likes != null ? String(raw.likes) : '',
    playCount: raw.playcount != null ? String(raw.playcount) : '',
    streamUrl: raw.streamUrl,
  };
}

export const trackService = {


  timeToSeconds(time) {
    const [minutes, seconds] = time.split(':').slice(1).map(Number);
    return minutes * 60 + seconds;
  },



  // Получение топовых треков по прослушиваниям
  async getTopPlays(limit = 10) {
    const { data } = await api.get('/public-library/top-plays', { params: { limit } });
    return data.tracks.map(track => normalize({
      ...track,
      streamUrl: this.getStreamUrl(track.trackid),
    }));
  },

  // Получение топовых треков по лайкам
  async getTopLikes(limit = 10) {
    const { data } = await api.get('/public-library/top-likes', { params: { limit } });
    return data.tracks.map(track => normalize({
      ...track,
      streamUrl: this.getStreamUrl(track.trackid),
    }));
  },

  // Получение новых треков
  async getNewTracks(limit = 10) {
    const { data } = await api.get('/public-library', { params: { limit } });
    return data.tracks.map(track => normalize({
      ...track,
      streamUrl: this.getStreamUrl(track.trackid),
    }));
  },

  // Получение новых треков по тегам
  async getNewTracksByTags(tags, limit = 10) {
    const { data } = await api.post('/public-library/tags', { tags, limit });
    return data.tracks.map(track => normalize({
      ...track,
      streamUrl: this.getStreamUrl(track.trackid),
    }));
  },

  // Поиск треков
  async searchTracks(query, userId, from = 0, size = 10, sort = '') {
    if (!query.trim()) return { tracks: [], total: 0, from: 0, size };
    const params = {
      q: query,
      size,
    };
    const { data } = await api.get('/search', { params });
    return {
      tracks: data.tracks.map(track => normalize({
        trackid: track.id,
        title: track.title,
        author: track.author,
        album: track.album,
        year: track.year,
        country: track.country,
        coverurl: track.cover_url,
        likes: track.likes || '',
        playcount: track.playCount || '',
        streamUrl: this.getStreamUrl(track.id),
      })),
      total: data.total,
      from: data.from,
      size: data.size,
    };
  },

  // Получение коллекции пользователя
  async getUserLibrary(userId) {
    const { data } = await api.post('/users/library/list', { userId });
    return data.tracks.map(track => normalize({
      ...track,
      streamUrl: this.getStreamUrl(track.trackid),
    }));
  },

  // Получение коллекции пользователя по тегам
  async getUserLibraryByTags(userId, tags) {
    const { data } = await api.post('/users/tags', { userId, tags });

    return data.tracks.map(track => normalize({
      ...track,
      streamUrl: this.getStreamUrl(track.trackid),
    }));
  },

  async getTrackLyrics(trackId) {
    try {
      const { data } = await api.post('/restoration/lyrics', { trackId });
      const lyrics = JSON.parse(data.lyrics);
      return lyrics.map((line) => ({
        text: line.text,
        start: this.timeToSeconds(line.start),
        end: this.timeToSeconds(line.end),
      }));
    } catch (error) {
      console.error('Ошибка при получении текста песни:', error);
      return [];
    }
  },

  // Добавление трека в коллекцию
  async addToLibrary(userId, trackId) {
    const { data } = await api.post('/users/library', { userId, trackId });
    return data;
  },

  // Удаление трека из коллекции
  async removeFromLibrary(userId, trackId) {
    const { data } = await api.delete('/users/library', {
      data: { userId, trackId },
    });
    return data;
  },

  // Жалоба на трек
  async reportTrack(userId, trackId) {
    try {
      const response = await api.post('/public-library/complaints', {
        userId: String(userId),
        trackId,
      });
      console.log('Report track success:', response.data);
      return response.data;
    } catch (error) {
      console.error('Report track error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Получение метаданных трека
  async getTrackMetadata(trackId) {
    const { data } = await api.get(`/public-library/${trackId}`);
    console.log(data);
    return data;
  },

  // Получение URL для стриминга трека
  getStreamUrl(trackId, version = 'processed') {
    const baseURL = api.defaults.baseURL || 'http://localhost:5000';
    return `${baseURL}/restoration/stream/${trackId}?version=${version}`;
  },


  // Получение URL для скачивания трека
  async getDownloadUrl(trackId, version = 'processed') {
    const { data } = await api.get(`/restoration/download/${trackId}`, { params: { version } });
    return data.url;
  },

  // Загрузка трека
  async uploadTrack(userId, file) {
    const formData = new FormData();
    formData.append('userId', userId);
    formData.append('file', file);
    const { data } = await api.post('/restoration/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.id;
  },

  // Сохранение метаданных трека
  async saveMetadata(trackId, metadata) {
    const { data } = await api.post('/restoration/metadata', { trackId, ...metadata });
    return data.metadataId;
  },
};
