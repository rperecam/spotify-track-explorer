const API_URL = import.meta.env.VITE_API_URL;

export const api = {
async getGenreStats() {
    const res = await fetch(`${API_URL}/dashboard/genre-stats`);
    if (!res.ok) throw new Error('Error al obtener estadísticas de género');
    return res.json();
  },

  async getAllTracks() {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/tracks`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    if (!res.ok) throw new Error('Error al obtener pistas');
    const data = await res.json();
    return data.tracks || data;
  },

  async getTopTracks(limit: number = 10) {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/tracks?sort=popularity&limit=${limit}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    if (!res.ok) throw new Error('Error al obtener top pistas');
    const data = await res.json();
    return data.tracks || data;
  },

  async getArtistStats() {
    const res = await fetch(`${API_URL}/dashboard/artist-stats`);
    if (!res.ok) throw new Error('Error al obtener estadísticas de artistas');
    return res.json();
  },

  async getExplicitByGenre() {
    const res = await fetch(`${API_URL}/dashboard/explicit-by-genre`);
    if (!res.ok) throw new Error('Error al obtener canciones explícitas');
    return res.json();
  },
};
