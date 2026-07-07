import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getBlogs, getLatestBlogs, getCategories } from '../api/blogApi';
import BlogCard from '../components/BlogCard';
import Loader from '../components/Loader';

function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [blogs, setBlogs] = useState([]);
  const [latest, setLatest] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [loading, setLoading] = useState(true);

  const category = searchParams.get('category') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const totalPages = parseInt(searchParams.get('total') || '1', 10);

  const setParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    next.delete('page');
    setSearchParams(next);
  };

  const setPage = (p) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', p);
    setSearchParams(next);
  };

  useEffect(() => {
    getLatestBlogs().then(({ data }) => setLatest(data)).catch(console.error);
    getCategories().then(({ data }) => setCategories(data.results || data)).catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = { page, page_size: 10 };
    if (search) params.search = search;
    if (category) params.category = category;
    getBlogs(params)
      .then(({ data }) => {
        setBlogs(data.results || data);
        if (data.count) {
          const tp = Math.ceil(data.count / 10);
          const next = new URLSearchParams(searchParams);
          next.set('total', tp);
          setSearchParams(next, { replace: true });
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, category, searchParams.get('search')]);

  const handleSearch = (e) => {
    e.preventDefault();
    const next = new URLSearchParams(searchParams);
    if (search) next.set('search', search); else next.delete('search');
    next.delete('page');
    setSearchParams(next);
  };

  return (
    <div className="container page">
      <header className="page-header">
        <h1>All Blogs</h1>
        {/* <p className="subtitle">GET /api/blogs/ — search, filter, paginate</p> */}
      </header>

      <div className="home-layout">
        <main>
          <form className="search-bar" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search blogs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              value={category}
              onChange={(e) => setParam('category', e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.slug}>{cat.name}</option>
              ))}
            </select>
            <button type="submit" className="btn btn-primary">Search</button>
          </form>

          {category && (
            <div style={{ marginBottom: '1rem' }}>
              Filtering by: <strong>{categories.find(c => c.slug === category)?.name}</strong>
              <button className="bio-toggle" style={{ marginLeft: '0.5rem' }} onClick={() => setParam('category', '')}>✕ Clear</button>
            </div>
          )}

          {loading ? (
            <Loader />
          ) : blogs.length === 0 ? (
            <p className="empty-state">No blogs found. Be the first to write one!</p>
          ) : (
            <div className="blog-grid">
              {blogs.map((blog) => (
                <BlogCard key={blog.id} blog={blog} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="pagination">
              <button type="button" className="btn btn-secondary" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
              <span>Page {page} of {totalPages}</span>
              <button type="button" className="btn btn-secondary" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</button>
            </div>
          )}
        </main>

        <aside className="sidebar">
          <h3>Latest Posts</h3>
          <ul className="latest-list">
            {latest.map((blog) => (
              <li key={blog.id}>
                <Link to={`/blogs/${blog.slug}`}>{blog.title}</Link>
                <small>{new Date(blog.created_at).toLocaleDateString()}</small>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}

export default Home;
