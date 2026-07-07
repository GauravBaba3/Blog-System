import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  getBlog,
  getComments,
  addComment,
  deleteComment,
  likeBlog,
  unlikeBlog,
  deleteBlog,
} from '../api/blogApi';
import Loader from '../components/Loader';
import ImageLightbox from '../components/ImageLightbox';

function BlogDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [blog, setBlog] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lightbox, setLightbox] = useState(false);

  

  const loadBlog = async () => {
    setLoading(true);
    try {
      const [blogRes, commentsRes] = await Promise.all([
        getBlog(slug),
        getComments(slug),
      ]);
      setBlog(blogRes.data);
      setComments(commentsRes.data.results);
      // console.log(commentsRes.data.results);
    } catch (err) {
      setError('Blog not found.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBlog();
  }, [slug]);

  const handleLike = async () => {
    try {
      if (blog.is_liked) {
        await unlikeBlog(slug);
        setBlog((prev) => ({ ...prev, is_liked: false, likes_count: prev.likes_count - 1 }));
      } else {
        await likeBlog(slug);
        setBlog((prev) => ({ ...prev, is_liked: true, likes_count: prev.likes_count + 1 }));
      }
    } catch (err) {
      alert('Please login to like posts.');
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      const { data } = await addComment(slug, commentText);
      setComments((prev) => [...prev, data]);
      setBlog((prev) => ({ ...prev, comments_count: prev.comments_count + 1 }));
      setCommentText('');
    } catch (err) {
      alert('Please login to comment.');
    }
  };

  const handleDeleteComment = async (id) => {
    await deleteComment(id);
    setComments((prev) => prev.filter((c) => c.id !== id));
    setBlog((prev) => ({ ...prev, comments_count: prev.comments_count - 1 }));
  };

  const handleDeleteBlog = async () => {
    if (!window.confirm('Delete this blog permanently?')) return;
    await deleteBlog(slug);
    navigate('/my-blogs');
  };

  if (loading) return <Loader />;
  if (error || !blog) return <div className="container page"><p>{error}</p></div>;

  const imageUrl = blog.featured_image
    ? `${blog.featured_image}`
    : null;
  const isAuthor = user?.id === blog.author?.id;
  const authorLink = isAuthor ? '/profile' : `/user/${blog.author?.username}`;

  return (
    <div className="container page">
      <article className="blog-detail">
        {blog.category && (
          <Link to={`/?category=${blog.category.slug}`} className="category-badge">
            {blog.category.name}
          </Link>
        )}
        <h1>{blog.title}</h1>
        <div className="blog-meta">
          <Link to={authorLink} className="author-link">
            By {blog.author?.username}
          </Link>
          <span>{new Date(blog.created_at).toLocaleDateString()}</span>
        </div>

        {imageUrl && (
          <img
            src={imageUrl}
            alt={blog.title}
            className="blog-detail-image clickable-img"
            onClick={() => setLightbox(true)}
          />
        )}

        <div className="blog-content">{blog.content}</div>

        <div className="blog-actions">
          <button type="button" className="btn btn-secondary" onClick={handleLike}>
            {blog.is_liked ? 'Unlike' : 'Like'} ({blog.likes_count})
          </button>
          {isAuthor && (
            <>
              <Link to={`/blogs/${slug}/edit`} className="btn btn-primary">
                Edit
              </Link>
              <button type="button" className="btn btn-danger" onClick={handleDeleteBlog}>
                Delete
              </button>
            </>
          )}
        </div>
      </article>

      {lightbox && <ImageLightbox src={imageUrl} alt={blog.title} onClose={() => setLightbox(false)} />}

      <section className="comments-section card">
        <h2>Comments ({blog.comments_count})</h2>
        {/* <p className="subtitle">GET/POST /api/blogs/{slug}/comments/</p> */}

        <form onSubmit={handleComment} className="comment-form">
          <textarea
            placeholder="Write a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            rows={3}
          />
          <button type="submit" className="btn btn-primary">
            Post Comment
          </button>
        </form>

        <ul className="comment-list">
          {comments.map((comment) => (
            <li key={comment.id} className="comment-item">
              <strong>{comment.author?.username}</strong>
              <span>{new Date(comment.created_at).toLocaleDateString()}</span>
              <p>{comment.content}</p>
              {user?.id === comment.author?.id && (
                <button
                  type="button"
                  className="btn-link danger"
                  onClick={() => handleDeleteComment(comment.id)}
                >
                  Delete
                </button>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default BlogDetail;
