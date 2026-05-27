import { useEffect, useState } from "react";

const STORAGE_KEY = "geogames_terms_accepted";

export default function useTermsAcceptance() {
  const [accepted, setAccepted] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return localStorage.getItem(STORAGE_KEY) === "true";
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const savedValue = localStorage.getItem(STORAGE_KEY) === "true";
    if (savedValue !== accepted) {
      setAccepted(savedValue);
    }
  }, [accepted]);

  const rememberAcceptance = () => {
    if (typeof window === "undefined") {
      return;
    }

    localStorage.setItem(STORAGE_KEY, "true");
    setAccepted(true);
  };

  return { accepted, rememberAcceptance };
}
