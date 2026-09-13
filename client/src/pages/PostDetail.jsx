import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { marked } from "marked";
import { api } from "../api";
import LikeButton from "../components/LikeButton";
import Comments from "../components/Comments";

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function PostDetail() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setPost(null);
    setNotFound(false);
    api
      .get(`/posts/${slug}`)
      .then(setPost)
      .catch(() => setNotFound(true));
  }, [slug]);

  if (notFound) {
    return (
      <div>
        <p>There's no post at this address.</p>
        <Link to="/">Back to posts</Link>
      </div>
    );
  }

  if (!post) return null;

  return (
    <article>
      <header className="post-header">
        <h1>{post.title}</h1>
        <p className="meta">
          {post.author} · {formatDate(post.createdAt)}
        </p>
      </header>

      <div className="post-content" dangerouslySetInnerHTML={{ __html: marked.parse(post.content) }} />

      <LikeButton postId={post.id} initialLiked={post.likedByMe} initialCount={post.likeCount} />

      <div className="post-comments-section">
        <Comments postId={post.id} />
      </div>
    </article>
  );
}
