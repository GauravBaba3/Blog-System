import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyBlogs, deleteBlog } from '../api/blogApi';
import Loader from '../components/Loader';
import ImageLightbox from '../components/ImageLightbox';

function MyBlogs() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    getMyBlogs()
      .then(({ data }) => setBlogs(data.results || data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (slug) => {
    if (!window.confirm('Delete this blog permanently?')) return;
    await deleteBlog(slug);
    setBlogs((prev) => prev.filter((b) => b.slug !== slug));
  };

  if (loading) return <Loader />;

  return (
    <div className="container page">
      <header className="page-header">
        <h1>My Blogs</h1>
        {/* <p className="subtitle">GET /api/blogs/my/ — your posts only (JWT required)</p> */}
        <Link
          to="/blogs/new"
          className="btn btn-primary"
          style={{ marginTop: "25px" }}
        >
          Write New Blog
        </Link>
      </header>

      {blogs.length === 0 ? (
        <p className="empty-state">You have not written any blogs yet.</p>
      ) : (
        <ul className="my-blogs-list">
          {blogs.map((blog) => (
            <li key={blog.id} className="my-blog-item">
              <div
                style={{
                  width: "400px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                <img
                  src={blog.featured_image}
                  alt=""
                  height="150px"
                  width="auto"
                  className="clickable-img"
                  onClick={() => setLightbox(blog.featured_image)}
                />
              </div>
              <div>
                <div>
                  <Link to={`/blogs/${blog.slug}`}>
                    <strong>{blog.title}</strong>
                  </Link>
                  <p>{blog.excerpt || blog.content?.slice(0, 100)}</p>
                  <small>
                    {new Date(blog.created_at).toLocaleDateString()}
                  </small>
                </div>
                <div className="my-blog-actions">
                  <Link
                    to={`/blogs/${blog.slug}/edit`}
                    className="btn btn-secondary btn-sm"
                  >
                    Edit
                  </Link>

                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(blog.slug)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      {lightbox && <ImageLightbox src={lightbox} alt="" onClose={() => setLightbox(null)} />}
    </div>
  );
}

export default MyBlogs;
