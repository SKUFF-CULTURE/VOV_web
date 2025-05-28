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
  async getTopPlays(limit = 10) {
    const { data } = await api.get('/public-library/top-plays', { params: { limit } });
    return data.tracks.map(track => normalize({
      ...track,
      streamUrl: this.getStreamUrl(track.trackid),
    }));
  },

  async getTopLikes(limit = 10) {
    const { data } = await api.get('/public-library/top-likes', { params: { limit } });
    return data.tracks.map(track => normalize({
      ...track,
      streamUrl: this.getStreamUrl(track.trackid),
    }));
  },

  async getNewTracks(limit = 10) {
    const { data } = await api.get('/public-library', { params: { limit } });
    return data.tracks.map(track => normalize({
      ...track,
      streamUrl: this.getStreamUrl(track.trackid),
    }));
  },

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

  async getUserLibrary(userId) {
    const { data } = await api.post('/users/library/list', { userId });
    return data.tracks.map(track => normalize({
      ...track,
      streamUrl: this.getStreamUrl(track.trackid),
    }));
  },

  async addToLibrary(userId, trackId) {
    const { data } = await api.post('/users/library', { userId, trackId });
    return data;
  },

  async removeFromLibrary(userId, trackId) {
    const { data } = await api.delete('/users/library', {
      data: { userId, trackId },
    });
    return data;
  },

  async reportTrack(userId, trackId) {
    try {
      const response = await api.post('/public-library/complaints', {
        userId: String(userId), // Преобразуем userId в строку
        trackId, // trackId уже строка (UUID)
      });
      console.log('Report track success:', response.data);
      return response.data;
    } catch (error) {
      console.error('Report track error:', error.response?.data || error.message);
      throw error;
    }
  },

  async getTrackMetadata(trackId) {
    const { data } = await api.get(`/public-library/${trackId}`);
    console.log(data);
    return data;
  },

  getStreamUrl(trackId, version = 'processed') {
    // Используем baseURL из api
    const baseURL = api.defaults.baseURL || 'http://localhost:5000'; // Фолбэк на случай, если baseURL не задан
    return `${baseURL}restoration/stream/${trackId}?version=${version}`;
  },

  async getDownloadUrl(trackId, version = 'processed') {
    const { data } = await api.get(`/restoration/download/${trackId}`, { params: { version } });
    return data.url;
  },

  async uploadTrack(userId, file) {
    const formData = new FormData();
    formData.append('userId', userId);
    formData.append('file', file);
    const { data } = await api.post('/restoration/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.id;
  },

  async saveMetadata(trackId, metadata) {
    const { data } = await api.post('/restoration/metadata', { trackId, ...metadata });
    return data.metadataId;
  },
};
