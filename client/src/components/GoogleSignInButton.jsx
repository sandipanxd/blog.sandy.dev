import { useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";

export default function GoogleSignInButton({ onError }) {
  const { loginWithGoogle } = useAuth();
  const buttonRef = useRef(null);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId) return;

    let cancelled = false;

    function render() {
      if (cancelled || !window.google || !buttonRef.current) return;

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response) => {
          try {
            await loginWithGoogle(response.credential);
          } catch (err) {
            onError?.(err.message);
          }
        },
      });

      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: "outline",
        size: "large",
        shape: "rectangular",
        width: 320,
      });
    }

    if (window.google) {
      render();
    } else {
      const interval = setInterval(() => {
        if (window.google) {
          clearInterval(interval);
          render();
        }
      }, 100);
      return () => {
        cancelled = true;
        clearInterval(interval);
      };
    }

    return () => {
      cancelled = true;
    };
  }, [clientId, loginWithGoogle, onError]);

  if (!clientId) return null;

  return <div ref={buttonRef} />;
}
