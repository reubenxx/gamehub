import { useEffect, useState } from "react";

export default function useSoundReady() {
  const [isSoundReady, setSoundReady] = useState(false);

  useEffect(() => {
    const placeholderTimeout = window.setTimeout(() => {
      setSoundReady(true);
    }, 600);

    return () => window.clearTimeout(placeholderTimeout);
  }, []);

  return { isSoundReady };
}
