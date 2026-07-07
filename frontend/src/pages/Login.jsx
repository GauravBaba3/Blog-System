import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearError } from '../store/authSlice';
import { getApiErrorMessage } from '../utils/getApiErrorMessage';

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);
  const [form, setForm] = useState({ username: '', password: '' });

  const handleChange = (e) => {
    dispatch(clearError());
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(login(form));
    if (login.fulfilled.match(result)) {
      navigate('/');
    }
  };

  const errorMessage = getApiErrorMessage(error);

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Login</h1>
        {/* <p className="subtitle">
          POST /api/auth/login/ — sends credentials, receives JWT tokens
        </p> */}

        {errorMessage && <div className="alert alert-error">{errorMessage}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              name="username"
              value={form.username}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="auth-footer">
          No account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
