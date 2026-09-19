import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RequireAuthor() {
  const { user, isAuthor } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (!isAuthor) return <Navigate to="/" replace />;

  return <Outlet />;
}
