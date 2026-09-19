import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { marked } from "marked";
import { api } from "../../api";

const TOOLBAR = [
  { label: "B", title: "Bold", action: (t) => wrapSelection(t, "**", "**") },
  { label: "I", title: "Italic", action: (t) => wrapSelection(t, "*", "*") },
  { label: "H", title: "Heading", action: (t) => linePrefix(t, "## ") },
  { label: "“”", title: "Blockquote", action: (t) => linePrefix(t, "> ") },
  { label: "•", title: "List item", action: (t) => linePrefix(t, "- ") },
  { label: "</>", title: "Code", action: (t) => wrapSelection(t, "`", "`") },
  { label: "Link", title: "Link", action: (t) => wrapSelection(t, "[", "](https://)") },
  { label: "Img", title: "Image", action: (t) => wrapSelection(t, "![alt](", ")") },
];

function wrapSelection(textarea, before, after) {
  const { selectionStart: start, selectionEnd: end, value } = textarea;
  const selected = value.slice(start, end);
  return {
    value: value.slice(0, start) + before + selected + after + value.slice(end),
    selectionStart: start + before.length,
    selectionEnd: start + before.length + selected.length,
  };
}

function linePrefix(textarea, prefix) {
  const { selectionStart: start, value } = textarea;
  const lineStart = value.lastIndexOf("\n", start - 1) + 1;
  return {
    value: value.slice(0, lineStart) + prefix + value.slice(lineStart),
    selectionStart: start + prefix.length,
    selectionEnd: start + prefix.length,
  };
}

export default function PostEditor() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const textareaRef = useRef(null);

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [published, setPublished] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(isEditing);

  useEffect(() => {
    if (!isEditing) return;

    api.get(`/posts/admin/${id}`).then((post) => {
      setTitle(post.title);
      setExcerpt(post.excerpt);
      setContent(post.content);
      setPublished(post.published);
      setLoading(false);
    });
  }, [id, isEditing]);

  function applyToolbar(action) {
    const textarea = textareaRef.current;
    const result = action(textarea);
    setContent(result.value);
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.selectionStart = result.selectionStart;
      textarea.selectionEnd = result.selectionEnd;
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const payload = { title, excerpt, content, published };

    try {
      if (isEditing) {
        await api.put(`/posts/${id}`, payload);
      } else {
        await api.post("/posts", payload);
      }
      navigate("/admin");
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return null;

  return (
    <div>
      <h1 className="page-title">{isEditing ? "Edit post" : "New post"}</h1>

      {error && <p className="form-error">{error}</p>}

      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="title">Title</label>
          <input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>

        <div className="field">
          <label htmlFor="excerpt">Excerpt</label>
          <input id="excerpt" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} />
        </div>

        <div className="toolbar">
          {TOOLBAR.map((item) => (
            <button
              key={item.title}
              type="button"
              title={item.title}
              onClick={() => applyToolbar(item.action)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="editor-grid">
          <textarea
            ref={textareaRef}
            className="editor-textarea"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
          <div className="post-content editor-preview" dangerouslySetInnerHTML={{ __html: marked.parse(content) }} />
        </div>

        <div className="field-inline">
          <input
            id="published"
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
          />
          <label htmlFor="published">Published</label>
        </div>

        <button type="submit" className="btn btn-primary">
          {isEditing ? "save changes" : "create post"}
        </button>
      </form>
    </div>
  );
}
