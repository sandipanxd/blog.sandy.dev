export default function requireAuthor(req, res, next) {
  if (req.userRole !== "author") {
    return next({ status: 403, message: "Author access required" });
  }

  next();
}
