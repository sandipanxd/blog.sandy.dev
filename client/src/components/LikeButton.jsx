import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../api";

export default function LikeButton({ postId, initialLiked, initialCount }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [busy, setBusy] = useState(false);

  async function toggleLike() {
    if (!user) {
      navigate("/login");
      return;
    }

    setBusy(true);
    try {
      const result = await api.post(`/posts/${postId}/like`);
      setLiked(result.likedByMe);
      setCount(result.likeCount);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      className={`like-btn${liked ? " liked" : ""}`}
      onClick={toggleLike}
      disabled={busy}
    >
      <svg viewBox="0 0 24 24" strokeWidth="1.8">
        <path d="M12 20.5s-7-4.35-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 5.5c-2.5 4.65-9.5 9-9.5 9Z" />
      </svg>
      {count}
    </button>
  );
}
