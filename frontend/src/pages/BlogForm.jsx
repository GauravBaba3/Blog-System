import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createBlog, updateBlog, getBlog, getCategories } from '../api/blogApi';
import Loader from '../components/Loader';
import NewCategoryModal from '../components/NewCategoryModal';

function BlogForm() {
  const { slug } = useParams();
  const isEdit = Boolean(slug);
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [form, setForm] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: '',
    featured_image: null,
    is_published: true,
  });
  const [error, setError] = useState('');

  useEffect(() => {
    getCategories().then(({ data }) => setCategories(data.results || data)).catch(console.error);

    if (isEdit) {
      getBlog(slug)
        .then(({ data }) => {
          setForm({
            title: data.title,
            content: data.content,
            excerpt: data.excerpt || '',
            category: data.category?.id || '',
            featured_image: null,
            is_published: data.is_published,
          });
        })
        .catch(() => setError('Could not load blog.'))
        .finally(() => setLoading(false));
    }
  }, [slug, isEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setForm({
      ...form,
      [name]: type === 'checkbox' ? checked : type === 'file' ? files[0] : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = { ...form };
      if (!payload.category) delete payload.category;

      if (isEdit) {
        await updateBlog(slug, payload);
        navigate(`/my-blogs`);
      } else {
        const { data } = await createBlog(payload);
        navigate(data.slug ? `/my-blogs` : "/my-blogs");
      }
    } catch (err) {
      setError('Failed to save blog. Please check your input.');
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="container page">
      <h1>{isEdit ? 'Edit Blog' : 'Create Blog'}</h1>
      {/* <p className="subtitle">
        {isEdit ? 'PATCH' : 'POST'} /api/blogs/ — sends blog data to Django
      </p> */}

      {error && <div className="alert alert-error">{error}</div>}

      <form className="card blog-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Title</label>
          <input name="title" value={form.title} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Excerpt (short summary)</label>
          <textarea
            name="excerpt"
            value={form.excerpt}
            onChange={handleChange}
            rows={2}
          />
        </div>
        <div className="form-group">
          <label>Content</label>
          <textarea
            name="content"
            value={form.content}
            onChange={handleChange}
            rows={12}
            required
          />
        </div>
        <div className="form-group">
          <label>Category</label>
          <select name="category" value={form.category} onChange={handleChange}>
            <option value="">No category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <button
            type="button"
            className="bio-toggle"
            style={{ marginTop: '0.4rem' }}
            onClick={() => setShowCategoryModal(true)}
          >
            + Create new category
          </button>
        </div>
        <div className="form-group">
          <label>Featured Image</label>
          <input
            name="featured_image"
            type="file"
            accept="image/*"
            onChange={handleChange}
          />
        </div>
        <div className="form-group checkbox-group">
          <label>
            <input
              name="is_published"
              type="checkbox"
              checked={form.is_published}
              onChange={handleChange}
            />
            Publish immediately
          </label>
        </div>
        <button type="submit" className="btn btn-primary">
          {isEdit ? 'Update Blog' : 'Create Blog'}
        </button>
      </form>

      {showCategoryModal && (
        <NewCategoryModal
          onClose={() => setShowCategoryModal(false)}
          onCreated={(newCat) => {
            setCategories((prev) => [...prev, newCat]);
            setForm((prev) => ({ ...prev, category: newCat.id }));
          }}
        />
      )}
    </div>
  );
}

export default BlogForm;
