import { useEffect, useRef, useState } from 'react';
import { createCategory } from '../api/blogApi';

function NewCategoryModal({ onCreated, onClose }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError('');
    try {
      const { data } = await createCategory(name.trim());
      onCreated(data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.name?.[0] || 'Failed to create category.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lightbox-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h3>New Category</h3>
        {error && <p className="modal-error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Category Name</label>
            <input
              ref={inputRef}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Technology"
              required
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating…' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NewCategoryModal;
