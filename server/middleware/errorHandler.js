export default function errorHandler(err, req, res, next) {
  // Intentional application errors always carry a status — pass their message through.
  if (err.status) {
    return res.status(err.status).json({ error: err.message });
  }

  // Mongoose throws these on bad input (e.g. a malformed ObjectId in a route param,
  // or a document that fails schema validation) — treat as client error, not a 500.
  if (err.name === "CastError" || err.name === "ValidationError") {
    return res.status(400).json({ error: "Invalid request" });
  }

  // Anything else is unexpected — log the real error server-side, but never leak
  // internals (stack traces, schema/field names, DB error text) to the client.
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
}
