import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function Home() {
  const [posts, setPosts] = useState(null);

  useEffect(() => {
    api.get("/posts").then(setPosts);
  }, []);

  if (!posts) return null;

  return (
    <div>
      <h1 className="page-title">Posts</h1>

      {posts.length === 0 && <p className="empty-state">Nothing published yet.</p>}

      <div className="post-list">
        {posts.map((post) => (
          <article className="post-entry" key={post.id}>
            <h2>
              <Link to={`/posts/${post.slug}`}>{post.title}</Link>
            </h2>
            <p className="meta">
              {formatDate(post.createdAt)} · {post.likeCount} {post.likeCount === 1 ? "like" : "likes"}
            </p>
            {post.excerpt && <p>{post.excerpt}</p>}
          </article>
        ))}
      </div>
    </div>
  );
}
