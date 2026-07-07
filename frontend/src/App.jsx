import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { fetchProfile } from './store/authSlice';
import { isAuthenticated } from './utils/tokenStorage';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import BlogDetail from './pages/BlogDetail';
import BlogForm from './pages/BlogForm';
import MyBlogs from './pages/MyBlogs';
import PublicProfile from './pages/PublicProfile';

function AppRoutes() {
  const dispatch = useDispatch();

  // Restore session on page refresh if JWT exists in localStorage
  useEffect(() => {
    if (isAuthenticated()) {
      dispatch(fetchProfile());
    }
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/blogs/:slug" element={<BlogDetail />} />
          <Route path="/user/:username" element={<PublicProfile />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<Profile />} />
            <Route path="/my-blogs" element={<MyBlogs />} />
            <Route path="/blogs/new" element={<BlogForm />} />
            <Route path="/blogs/:slug/edit" element={<BlogForm />} />
          </Route>
        </Routes>
      </main>
      <footer className="footer">
        <div className="container">
          <p>Full Stack Blog System — Made With Love ❤️ By Gaurav Kumar</p>
        </div>
      </footer>
    </BrowserRouter>
  );
}

export default AppRoutes;
