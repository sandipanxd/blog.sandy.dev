import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Layout() {
  const { user, isAuthor, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <div className="page-shell">
      <nav className="site-nav">
        <Link to="/" className="brand">
          sandipan biswas
        </Link>
        <div className="links">
          {user ? (
            <>
              {isAuthor && <Link to="/admin">write</Link>}
              <span>{user.name}</span>
              <button type="button" onClick={handleLogout}>
                log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login">log in</Link>
              <Link to="/signup">sign up</Link>
            </>
          )}
        </div>
      </nav>
      <Outlet />
    </div>
  );
}
