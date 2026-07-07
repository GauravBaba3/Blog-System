import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPublicProfile } from '../api/authApi';
import { getAuthorBlogs } from '../api/blogApi';
import ImageLightbox from '../components/ImageLightbox';
import Loader from '../components/Loader';

function PublicProfile() {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingBlogs, setLoadingBlogs] = useState(true);
  const [lightbox, setLightbox] = useState(false);
  const [bioExpanded, setBioExpanded] = useState(false);

  useEffect(() => {
    getPublicProfile(username)
      .then(({ data }) => setProfile(data))
      .catch(() => setProfile(null))
      .finally(() => setLoadingProfile(false));
  }, [username]);

  useEffect(() => {
    setLoadingBlogs(true);
    getAuthorBlogs(username, page)
      .then(({ data }) => {
        setBlogs(data.results || data);
        if (data.count) setTotalPages(Math.ceil(data.count / 10));
      })
      .catch(() => setBlogs([]))
      .finally(() => setLoadingBlogs(false));
  }, [username, page]);

  if (loadingProfile) return <Loader />;
  if (!profile) return <div className="container page"><p>User not found.</p></div>;

  const avatarUrl = profile.profile_image || null;
  const fullName = [profile.first_name, profile.last_name].filter(Boolean).join(' ') || profile.username;
  const initials = fullName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  const bio = profile.bio || '';
  const bioTruncated = bio.length > 120;

  return (
    <div className="container page">

      {/* Profile card */}
      <div className="profile-card">
        <div className="profile-card-avatar">
          {avatarUrl
            ? <img src={avatarUrl} alt="avatar" className="profile-avatar clickable-img" onClick={() => setLightbox(true)} />
            : <div className="profile-avatar-placeholder">{initials}</div>
          }
        </div>
        <div className="profile-card-info">
          <h2 className="profile-name">{fullName}</h2>
          <p className="profile-username">@{profile.username}</p>
          {bio && (
            <div className="profile-bio-wrap">
              <p className="profile-bio">
                {bioExpanded || !bioTruncated ? bio : bio.slice(0, 120) + '…'}
              </p>
              {bioTruncated && (
                <button className="bio-toggle" onClick={() => setBioExpanded((p) => !p)}>
                  {bioExpanded ? 'See less' : 'See more'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Author posts */}
      <h3 style={{ margin: '2rem 0 1rem' }}>Posts by {profile.username}</h3>

      {loadingBlogs ? <Loader /> : blogs.length === 0 ? (
        <p className="empty-state">No published posts yet.</p>
      ) : (
        <>
          <div className="blog-grid">
            {blogs.map((blog) => (
              <article key={blog.id} className="blog-card">
                {blog.featured_image && (
                  <img src={blog.featured_image} alt={blog.title} className="blog-card-image" />
                )}
                <div className="blog-card-body">
                  {blog.category && <span className="category-badge">{blog.category.name}</span>}
                  <h2><Link to={`/blogs/${blog.slug}`}>{blog.title}</Link></h2>
                  <p className="blog-excerpt">{blog.excerpt || blog.content?.slice(0, 150)}</p>
                  <div className="blog-meta">
                    <span>{new Date(blog.created_at).toLocaleDateString()}</span>
                    <span>{blog.likes_count} likes</span>
                    <span>{blog.comments_count} comments</span>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button className="btn btn-secondary" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
              <span>Page {page} of {totalPages}</span>
              <button className="btn btn-secondary" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</button>
            </div>
          )}
        </>
      )}

      {lightbox && <ImageLightbox src={avatarUrl} alt={fullName} onClose={() => setLightbox(false)} />}
    </div>
  );
}

export default PublicProfile;
