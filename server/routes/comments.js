import { Router } from "express";
import Comment from "../models/Comment.js";
import Post from "../models/Post.js";
import requireAuth from "../middleware/requireAuth.js";
import requireAuthor from "../middleware/requireAuthor.js";

const router = Router();

function commentView(comment) {
  return {
    id: comment._id,
    content: comment.content,
    author: comment.author?.name,
    authorRole: comment.author?.role,
    parentComment: comment.parentComment,
    createdAt: comment.createdAt,
  };
}

router.get("/posts/:postId/comments", async (req, res, next) => {
  try {
    const comments = await Comment.find({ post: req.params.postId })
      .sort({ createdAt: 1 })
      .populate("author", "name role");
    res.json(comments.map(commentView));
  } catch (err) {
    next(err);
  }
});

router.post("/posts/:postId/comments", requireAuth, async (req, res, next) => {
  try {
    const { content } = req.body;

    if (!content) {
      return next({ status: 400, message: "content is required" });
    }

    const post = await Post.findById(req.params.postId);
    if (!post) {
      return next({ status: 404, message: "Post not found" });
    }

    const comment = await Comment.create({
      post: post._id,
      author: req.userId,
      content,
    });
    await comment.populate("author", "name role");

    res.status(201).json(commentView(comment));
  } catch (err) {
    next(err);
  }
});

router.post("/comments/:id/reply", requireAuth, requireAuthor, async (req, res, next) => {
  try {
    const { content } = req.body;

    if (!content) {
      return next({ status: 400, message: "content is required" });
    }

    const parent = await Comment.findById(req.params.id);
    if (!parent) {
      return next({ status: 404, message: "Comment not found" });
    }

    const reply = await Comment.create({
      post: parent.post,
      author: req.userId,
      content,
      parentComment: parent._id,
    });
    await reply.populate("author", "name role");

    res.status(201).json(commentView(reply));
  } catch (err) {
    next(err);
  }
});

router.delete("/comments/:id", requireAuth, async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return next({ status: 404, message: "Comment not found" });
    }

    const isOwnComment = comment.author.toString() === req.userId;
    const isBlogAuthor = req.userRole === "author";

    if (!isOwnComment && !isBlogAuthor) {
      return next({ status: 403, message: "You can only delete your own comments" });
    }

    await comment.deleteOne();
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
