export default function Privacy() {
  return (
    <div>
      <h1 className="page-title">Privacy</h1>
      <div className="post-content">
        <p>
          This is a small personal blog, not a company, so here is a plain account of what
          happens with your data when you use it.
        </p>

        <p>
          <strong>If you sign up with email and password:</strong> I store your name, email
          address, and a bcrypt hash of your password. The plain password itself is never
          stored anywhere.
        </p>

        <p>
          <strong>If you sign in with Google:</strong> Google sends me your name, email
          address, and a Google account identifier, which I use to create or match your
          account here. I don't see or store your Google password. Google's own privacy
          policy covers what they do on their end.
        </p>

        <p>
          <strong>Comments and likes:</strong> anything you comment is stored with your
          account and shown publicly under the post. Likes are stored per account so the
          count and your own "liked" state are accurate, they aren't shared beyond that.
        </p>

        <p>
          <strong>Sessions:</strong> after logging in, a token is kept in your browser's
          local storage to keep you signed in. There are no tracking cookies and no
          analytics scripts on this site.
        </p>

        <p>
          <strong>Who else sees this:</strong> nobody. I don't sell, share, or hand off your
          data to advertisers or third parties beyond the Google Sign-In flow described
          above, which you initiate yourself.
        </p>

        <p>
          <strong>Deleting your data:</strong> email me at{" "}
          <a href="mailto:sandipanbiswas053@gmail.com">sandipanbiswas053@gmail.com</a> and
          I'll remove your account, comments, and likes.
        </p>

        <p>
          If anything material about this changes, I'll update this page and note the date
          below.
        </p>

        <p className="meta">Last updated: September 2026.</p>
      </div>
    </div>
  );
}
