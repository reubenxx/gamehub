import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import HomePage from "./pages/HomePage";
import GamePage from "./pages/GamePage";
import TermsOverlay from "./components/TermsOverlay";
import DeclineScreen from "./components/DeclineScreen";
import useTermsAcceptance from "./hooks/useTermsAcceptance";
import useSoundReady from "./hooks/useSoundReady";

export default function App() {
  const { accepted, rememberAcceptance } = useTermsAcceptance();
  const { isSoundReady } = useSoundReady();
  const [flowState, setFlowState] = useState(() => (accepted ? "complete" : "pending"));
  const [isTransitioning, setTransitioning] = useState(false);

  useEffect(() => {
    if (accepted) {
      setFlowState("complete");
    }
  }, [accepted]);

  const handleAccept = () => {
    rememberAcceptance();
    setTransitioning(true);

    window.setTimeout(() => {
      setFlowState("complete");
      setTransitioning(false);
    }, 2400);
  };

  const handleDecline = () => {
    setFlowState("declined");
  };

  return (
    <>
      {flowState !== "complete" ? (
        flowState === "declined" ? (
          <DeclineScreen />
        ) : (
          <TermsOverlay
            onAccept={handleAccept}
            onDecline={handleDecline}
            isTransitioning={isTransitioning}
            isSoundReady={isSoundReady}
          />
        )
      ) : (
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/game/:id" element={<GamePage />} />
          </Routes>
        </BrowserRouter>
      )}
    </>
  );
}