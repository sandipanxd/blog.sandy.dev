import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api";

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function Dashboard() {
  const [posts, setPosts] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/posts/admin").then(setPosts);
  }, []);

  async function handleDelete(id) {
    setError("");
    try {
      await api.del(`/posts/${id}`);
      setPosts((current) => current.filter((post) => post.id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  if (!posts) return null;

  return (
    <div>
      <div className="dashboard-header">
        <h1 className="page-title">Your posts</h1>
        <Link to="/admin/new" className="btn btn-primary">
          new post
        </Link>
      </div>

      {error && <p className="form-error">{error}</p>}

      {posts.length === 0 && <p className="empty-state">Nothing written yet.</p>}

      <div className="post-list">
        {posts.map((post) => (
          <article className="post-entry" key={post.id}>
            <h2>
              <Link to={`/admin/${post.id}/edit`}>{post.title}</Link>
            </h2>
            <p className="meta">
              {post.published ? "published" : "draft"} · {formatDate(post.createdAt)} ·{" "}
              {post.likeCount} {post.likeCount === 1 ? "like" : "likes"}
              {" · "}
              <button type="button" className="comment-delete" onClick={() => handleDelete(post.id)}>
                delete
              </button>
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
