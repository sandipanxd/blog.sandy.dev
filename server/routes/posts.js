import { Router } from "express";
import Post from "../models/Post.js";
import requireAuth from "../middleware/requireAuth.js";
import requireAuthor from "../middleware/requireAuthor.js";
import optionalAuth from "../middleware/optionalAuth.js";

const router = Router();

function slugify(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function postView(post, userId) {
  return {
    id: post._id,
    title: post.title,
    slug: post.slug,
    content: post.content,
    excerpt: post.excerpt,
    published: post.published,
    author: post.author?.name,
    likeCount: post.likes.length,
    likedByMe: userId ? post.likes.some((id) => id.toString() === userId) : false,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
  };
}

router.get("/", optionalAuth, async (req, res, next) => {
  try {
    const posts = await Post.find({ published: true })
      .sort({ createdAt: -1 })
      .populate("author", "name");
    res.json(posts.map((post) => postView(post, req.userId)));
  } catch (err) {
    next(err);
  }
});

router.get("/admin", requireAuth, requireAuthor, async (req, res, next) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 }).populate("author", "name");
    res.json(posts.map((post) => postView(post, req.userId)));
  } catch (err) {
    next(err);
  }
});

router.get("/:slug", optionalAuth, async (req, res, next) => {
  try {
    const post = await Post.findOne({ slug: req.params.slug }).populate("author", "name");

    if (!post || !post.published) {
      return next({ status: 404, message: "Post not found" });
    }

    res.json(postView(post, req.userId));
  } catch (err) {
    next(err);
  }
});

router.post("/", requireAuth, requireAuthor, async (req, res, next) => {
  try {
    const { title, content, excerpt, published } = req.body;

    if (!title || !content) {
      return next({ status: 400, message: "title and content are required" });
    }

    const post = await Post.create({
      title,
      slug: `${slugify(title)}-${Date.now().toString(36)}`,
      content,
      excerpt: excerpt || "",
      published: Boolean(published),
      author: req.userId,
    });
    await post.populate("author", "name");

    res.status(201).json(postView(post, req.userId));
  } catch (err) {
    next(err);
  }
});

router.put("/:id", requireAuth, requireAuthor, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return next({ status: 404, message: "Post not found" });
    }

    const { title, content, excerpt, published } = req.body;
    if (title !== undefined) post.title = title;
    if (content !== undefined) post.content = content;
    if (excerpt !== undefined) post.excerpt = excerpt;
    if (published !== undefined) post.published = Boolean(published);

    await post.save();
    await post.populate("author", "name");

    res.json(postView(post, req.userId));
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", requireAuth, requireAuthor, async (req, res, next) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);

    if (!post) {
      return next({ status: 404, message: "Post not found" });
    }

    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

router.post("/:id/like", requireAuth, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return next({ status: 404, message: "Post not found" });
    }

    const index = post.likes.findIndex((id) => id.toString() === req.userId);

    if (index === -1) {
      post.likes.push(req.userId);
    } else {
      post.likes.splice(index, 1);
    }

    await post.save();
    res.json({ likeCount: post.likes.length, likedByMe: index === -1 });
  } catch (err) {
    next(err);
  }
});

export default router;
