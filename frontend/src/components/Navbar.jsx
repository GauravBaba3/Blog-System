import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/authSlice";
import { isAuthenticated } from "../utils/tokenStorage";
import { CiMenuFries } from "react-icons/ci";
import { useEffect, useRef, useState } from "react";

function Navbar() {
  const [menu, setMenu] = useState(false);
  const menuRef = useRef(null);
  const urlLocation = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated: authState } = useSelector(
    (state) => state.auth,
  );
  const loggedIn = authState || isAuthenticated();

  const HandleMenuBtn = () => setMenu((p) => !p);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="logo">
          BlogSystem
        </Link>
        <div className="nav-links">
          <button className="navbar-menu-btn" onClick={HandleMenuBtn}>
            <CiMenuFries size={18} />
            <span>{loggedIn ? user?.username : 'Menu'}</span>
          </button>

          <div ref={menuRef} className={`nav-dropdown ${menu ? 'open' : ''}`}>
            {loggedIn ? (
              <>
                <Link to="/" className={urlLocation.pathname === '/' ? 'active' : ''} onClick={() => setMenu(false)}>Home</Link>
                <Link to="/my-blogs" className={urlLocation.pathname === '/my-blogs' ? 'active' : ''} onClick={() => setMenu(false)}>My Blogs</Link>
                <Link to="/blogs/new" className={urlLocation.pathname === '/blogs/new' ? 'active' : ''} onClick={() => setMenu(false)}>Create Blog</Link>
                <Link to="/profile" className={urlLocation.pathname === '/profile' ? 'active' : ''} onClick={() => setMenu(false)}>Profile</Link>
                <hr className="nav-divider" />
                <button type="button" className="nav-logout-btn" onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMenu(false)}>Login</Link>
                <Link to="/register" onClick={() => setMenu(false)}>Register</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
