import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ImageLightbox from './ImageLightbox';

function BlogCard({ blog }) {
  const [lightbox, setLightbox] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const imageUrl = blog.featured_image ? `${blog.featured_image}` : null;
  const isCurrentUser = user?.username === blog.author?.username;
  const authorLink = isCurrentUser ? '/profile' : `/user/${blog.author?.username}`;

  return (
    <article className="blog-card">
      {imageUrl && (
        <img
          src={imageUrl}
          alt={blog.title}
          className="blog-card-image clickable-img"
          onClick={() => setLightbox(true)}
        />
      )}
      <div className="blog-card-body">
        {blog.category && (
          <Link to={`/?category=${blog.category.slug}`} className="category-badge">
            {blog.category.name}
          </Link>
        )}
        <h2>
          <Link to={`/blogs/${blog.slug}`}>{blog.title}</Link>
        </h2>
        <p className="blog-excerpt">{blog.excerpt || blog.content?.slice(0, 150)}</p>
        <div className="blog-meta">
          <span>By <Link to={authorLink} className="author-link">{blog.author?.username}</Link></span>
          <span>{new Date(blog.created_at).toLocaleDateString()}</span>
          <span>{blog.likes_count} likes</span>
          <span>{blog.comments_count} comments</span>
        </div>
      </div>
      {lightbox && <ImageLightbox src={imageUrl} alt={blog.title} onClose={() => setLightbox(false)} />}
    </article>
  );
}

export default BlogCard;
