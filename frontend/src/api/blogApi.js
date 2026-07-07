import api from './axios';

/** GET /api/blogs/ — supports ?search=, ?category=, ?page= */
export const getBlogs = (params = {}) => api.get('/blogs/', { params });

/** GET /api/blogs/latest/ */
export const getLatestBlogs = () => api.get('/blogs/latest/');

/** GET /api/blogs/my/ */
export const getMyBlogs = () => api.get('/blogs/my/');

/** GET /api/blogs/{slug}/ */
export const getBlog = (slug) => api.get(`/blogs/${slug}/`);

/** POST /api/blogs/ */
export const createBlog = (data) => {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      formData.append(key, value);
    }
  });
  return api.post('/blogs/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

/** PATCH /api/blogs/{slug}/ */
export const updateBlog = (slug, data) => {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      formData.append(key, value);
    }
  });
  return api.patch(`/blogs/${slug}/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

/** DELETE /api/blogs/{slug}/ */
export const deleteBlog = (slug) => api.delete(`/blogs/${slug}/`);

/** POST /api/blogs/{slug}/like/ */
export const likeBlog = (slug) => api.post(`/blogs/${slug}/like/`);

/** DELETE /api/blogs/{slug}/like/ */
export const unlikeBlog = (slug) => api.delete(`/blogs/${slug}/like/`);

/** GET /api/blogs/{slug}/comments/ */
export const getComments = (slug) => api.get(`/blogs/${slug}/comments/`);

/** POST /api/blogs/{slug}/comments/ */
export const addComment = (slug, content) =>
  api.post(`/blogs/${slug}/comments/`, { content });

/** DELETE /api/comments/{id}/ */
export const deleteComment = (id) => api.delete(`/comments/${id}/`);

/** GET /api/categories/ */
export const getCategories = () => api.get('/categories/');

/** POST /api/categories/ */
export const createCategory = (name) => api.post('/categories/', { name });

/** GET /api/blogs/?author=username&page= */
export const getAuthorBlogs = (username, page = 1) =>
  api.get('/blogs/', { params: { author: username, page } });
