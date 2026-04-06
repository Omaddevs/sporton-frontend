const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://sporton-api.onrender.com';

/** Birinchi rasm URL (nisbiy yo‘llar uchun API bazasi qo‘shiladi). */
export function getGymImageUrl(gym) {
  const images = Array.isArray(gym?.images) ? gym.images.filter(Boolean) : [];
  if (images.length === 0) return null;
  const url = images[0];
  return url.startsWith('/') && !url.startsWith('http') ? `${API_BASE_URL}${url}` : url;
}
