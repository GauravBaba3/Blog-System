import api from './axios';

/** POST /api/auth/register/ */
export const registerUser = (userData) => api.post('/auth/register/', userData);

/** POST /api/auth/login/ — returns access, refresh, user */
export const loginUser = (credentials) => api.post('/auth/login/', credentials);

/** POST /api/auth/logout/ */
export const logoutUser = () => api.post('/auth/logout/');

/** GET /api/auth/profile/ */
export const getProfile = () => api.get('/auth/profile/');

/** PATCH /api/auth/profile/ */
export const updateProfile = (data) => {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      formData.append(key, value);
    }
  });
  return api.patch('/auth/profile/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

/** POST /api/auth/change-password/ */
export const changePassword = (data) => api.post('/auth/change-password/', data);

/** GET /api/auth/profile/<username>/ */
export const getPublicProfile = (username) => api.get(`/auth/profile/${username}/`);
