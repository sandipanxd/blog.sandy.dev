import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../api";

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function Comments({ postId }) {
  const { user, isAuthor } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [replyDrafts, setReplyDrafts] = useState({});
  const [openReplyFor, setOpenReplyFor] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get(`/posts/${postId}/comments`).then(setComments);
  }, [postId]);

  const topLevel = comments.filter((c) => !c.parentComment);
  const repliesByParent = comments.reduce((acc, c) => {
    if (c.parentComment) {
      acc[c.parentComment] = acc[c.parentComment] || [];
      acc[c.parentComment].push(c);
    }
    return acc;
  }, {});

  async function submitComment(event) {
    event.preventDefault();
    setError("");

    try {
      const comment = await api.post(`/posts/${postId}/comments`, { content: newComment });
      setComments((current) => [...current, comment]);
      setNewComment("");
    } catch (err) {
      setError(err.message);
    }
  }

  async function submitReply(event, commentId) {
    event.preventDefault();
    setError("");

    try {
      const reply = await api.post(`/comments/${commentId}/reply`, {
        content: replyDrafts[commentId] || "",
      });
      setComments((current) => [...current, reply]);
      setReplyDrafts((current) => ({ ...current, [commentId]: "" }));
      setOpenReplyFor(null);
    } catch (err) {
      setError(err.message);
    }
  }

  async function deleteComment(commentId) {
    try {
      await api.del(`/comments/${commentId}`);
      setComments((current) =>
        current.filter((c) => c.id !== commentId && c.parentComment !== commentId)
      );
    } catch (err) {
      setError(err.message);
    }
  }

  function canDelete(comment) {
    return isAuthor || (user && comment.authorId === user.id);
  }

  return (
    <section className="comments">
      <h2>Comments</h2>

      {error && <p className="form-error">{error}</p>}

      <div className="comment-list">
        {topLevel.length === 0 && <p className="empty-state">No comments yet.</p>}

        {topLevel.map((comment) => (
          <div className="comment" key={comment.id}>
            <p className="meta">
              {comment.author} · {formatDate(comment.createdAt)}
              {canDelete(comment) && (
                <>
                  {" "}
                  ·{" "}
                  <button
                    type="button"
                    className="comment-delete"
                    onClick={() => deleteComment(comment.id)}
                  >
                    delete
                  </button>
                </>
              )}
            </p>
            <p>{comment.content}</p>

            {(repliesByParent[comment.id] || []).map((reply) => (
              <div className="reply" key={reply.id}>
                <p className="meta">
                  <span className="author-tag">{reply.author}</span> · {formatDate(reply.createdAt)}
                </p>
                <p>{reply.content}</p>
              </div>
            ))}

            {isAuthor && !repliesByParent[comment.id] && (
              <div className="reply-form">
                {openReplyFor === comment.id ? (
                  <form onSubmit={(e) => submitReply(e, comment.id)}>
                    <textarea
                      value={replyDrafts[comment.id] || ""}
                      onChange={(e) =>
                        setReplyDrafts((current) => ({ ...current, [comment.id]: e.target.value }))
                      }
                      placeholder="Write a reply"
                      required
                    />
                    <div className="reply-form-actions">
                      <button type="submit" className="btn btn-primary">
                        reply
                      </button>
                    </div>
                  </form>
                ) : (
                  <button type="button" className="btn" onClick={() => setOpenReplyFor(comment.id)}>
                    reply
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {user ? (
        <form onSubmit={submitComment}>
          <div className="field">
            <label htmlFor="comment">Add a comment</label>
            <textarea
              id="comment"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary">
            post comment
          </button>
        </form>
      ) : (
        <p className="signin-prompt">
          <Link to="/login">Log in</Link> to leave a comment.
        </p>
      )}
    </section>
  );
}
