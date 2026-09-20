import { Route, Routes } from "react-router-dom";
import Layout from "./layouts/Layout";
import Home from "./pages/Home";
import PostDetail from "./pages/PostDetail";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Dashboard from "./pages/admin/Dashboard";
import PostEditor from "./pages/admin/PostEditor";
import RequireAuthor from "./components/RequireAuthor";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="posts/:slug" element={<PostDetail />} />
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<Signup />} />
        <Route path="privacy" element={<Privacy />} />
        <Route path="terms" element={<Terms />} />

        <Route element={<RequireAuthor />}>
          <Route path="admin" element={<Dashboard />} />
          <Route path="admin/new" element={<PostEditor />} />
          <Route path="admin/:id/edit" element={<PostEditor />} />
        </Route>
      </Route>
    </Routes>
  );
}
