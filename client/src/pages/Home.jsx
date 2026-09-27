import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../api";

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get("q") || "";
  const [input, setInput] = useState(q);
  const [posts, setPosts] = useState(null);

  useEffect(() => {
    const path = q ? `/posts?q=${encodeURIComponent(q)}` : "/posts";
    setPosts(null);
    api.get(path).then(setPosts);
  }, [q]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (input) {
        setSearchParams({ q: input });
      } else {
        setSearchParams({});
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [input]);

  return (
    <div>
      <h1 className="page-title">Posts</h1>

      <input
        type="search"
        className="search-input"
        placeholder="Search posts"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      {posts === null ? null : posts.length === 0 ? (
        <p className="empty-state">{q ? `No posts match "${q}".` : "Nothing published yet."}</p>
      ) : (
        <div className="post-list">
          {posts.map((post) => (
            <article className="post-entry" key={post.id}>
              <h2>
                <Link to={`/posts/${post.slug}`}>{post.title}</Link>
              </h2>
              <p className="meta">
                {formatDate(post.createdAt)} · {post.likeCount}{" "}
                {post.likeCount === 1 ? "like" : "likes"}
              </p>
              {post.excerpt && <p>{post.excerpt}</p>}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
