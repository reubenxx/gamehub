import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createGeoDashersGame } from "./geodashers/engine";
import { geoDashersLevels } from "./geodashers/levels";
import "./GeoDashers.css";

const PROGRESS_KEY = "geodashers_progress";
const SETTINGS_KEY = "geodashers_settings";

const defaultSettings = {
  sound: true,
  fullscreen: false,
  gravity: 1,
};

const defaultProgress = {
  completed: [],
  unlocked: [0],
};

function loadFromStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    return fallback;
  }
}

export default function GeoDashers() {
  const [view, setView] = useState("home");
  const [selectedLevel, setSelectedLevel] = useState(0);
  const [progress, setProgress] = useState(defaultProgress);
  const [settings, setSettings] = useState(defaultSettings);
  const [gameState, setGameState] = useState("ready");
  const [statusText, setStatusText] = useState("Hold space or tap to rise.");
  const [gameKey, setGameKey] = useState(0);
  const [isFullscreen, setFullscreen] = useState(false);

  const canvasRef = useRef(null);
  const gameRef = useRef(null);
  const holdRef = useRef(false);

  const currentLevel = useMemo(() => geoDashersLevels[selectedLevel], [selectedLevel]);
  const completedCount = progress.completed.length;

  useEffect(() => {
    setProgress(loadFromStorage(PROGRESS_KEY, defaultProgress));
    setSettings(loadFromStorage(SETTINGS_KEY, defaultSettings));
  }, []);

  useEffect(() => {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  }, [progress]);

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    const updateFullscreen = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", updateFullscreen);
    return () => document.removeEventListener("fullscreenchange", updateFullscreen);
  }, []);

  useEffect(() => {
    if (view !== "playing") return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    gameRef.current?.destroy();
    const game = createGeoDashersGame(canvas, currentLevel, {
      gravity: settings.gravity,
      sound: settings.sound,
      onDeath: () => {
        setGameState("dead");
        setStatusText("Crash! Instant restart...");
      },
      onFinish: () => {
        setGameState("finished");
        setStatusText("Level complete!");
        setProgress((prev) => {
          const completed = prev.completed.includes(selectedLevel)
            ? prev.completed
            : [...prev.completed, selectedLevel].sort((a, b) => a - b);
          const unlocked = Array.from(
            new Set([
              ...prev.unlocked,
              Math.min(selectedLevel + 1, geoDashersLevels.length - 1),
            ])
          ).sort((a, b) => a - b);
          return { completed, unlocked };
        });
      },
      onStatus: ({ status }) => {
        if (status) setStatusText(status);
      },
    });
    gameRef.current = game;

    const handleKeyDown = (event) => {
      if (event.code === "Space" || event.code === "ArrowUp") {
        event.preventDefault();
        holdRef.current = true;
        gameRef.current?.setHold(true);
      }
    };
    const handleKeyUp = (event) => {
      if (event.code === "Space" || event.code === "ArrowUp") {
        event.preventDefault();
        holdRef.current = false;
        gameRef.current?.setHold(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      gameRef.current?.destroy();
      gameRef.current = null;
    };
  }, [view, selectedLevel, gameKey, settings.gravity, settings.sound, currentLevel]);

  const startLevel = (index) => {
    setSelectedLevel(index);
    setView("playing");
    setGameState("playing");
    setStatusText("Hold space or tap to rise.");
    setGameKey((value) => value + 1);
  };

  const handleLevelSelect = (index) => {
    if (!progress.unlocked.includes(index) && index !== 0) return;
    startLevel(index);
  };

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen?.();
    } else {
      await document.exitFullscreen?.();
    }
  };

  const handlePointerDown = () => {
    holdRef.current = true;
    gameRef.current?.setHold(true);
  };

  const handlePointerUp = () => {
    holdRef.current = false;
    gameRef.current?.setHold(false);
  };

  const resetProgress = () => {
    setProgress(defaultProgress);
    setView("home");
  };

  const startFromHome = () => {
    setView("select");
  };

  const levelUnlocked = (index) => progress.unlocked.includes(index) || index === 0;

  const levelPhase = (index) => {
    if (index <= 2) return "Beginner";
    if (index <= 7) return "Novice";
    if (index <= 13) return "Expert";
    return "Master";
  };

  return (
    <div className="geodashers-root">
      <div className="geodashers-header">
        <div className="logo-block">
          <span className="mini-tag">Geo Dashers</span>
          <h1>NEON FLIGHT PLATFORMER</h1>
        </div>
        <div className="control-row">
          <button className="nav-button" onClick={() => setView("home")}>Home</button>
          <button className="nav-button" onClick={() => setView("select")}>Levels</button>
          <button className="nav-button" onClick={() => setView("settings")}>Settings</button>
        </div>
      </div>

      <div className="geodashers-stage">
        <motion.div
          className="side-panel"
          initial={{ opacity: 0, x: -36 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          <div className="panel-group">
            <div className="panel-title">Progress</div>
            <div className="panel-card panel-stats">
              <div>
                <span className="panel-label">Completed</span>
                <strong>{completedCount}/20</strong>
              </div>
              <div>
                <span className="panel-label">Unlocked</span>
                <strong>{progress.unlocked.length}/20</strong>
              </div>
            </div>
          </div>

          {view === "home" && (
            <div className="panel-group">
              <div className="panel-title">Welcome Pilot</div>
              <div className="panel-card panel-home">
                <p>Geo Dashers is a polished neon rhythm platformer with smooth flight controls, instant death, and fast restart loops.</p>
                <div className="panel-actions">
                  <button className="primary-button" onClick={startFromHome}>Launch Levels</button>
                  <button className="secondary-button" onClick={() => setView("settings")}>Tweak Settings</button>
                </div>
              </div>
            </div>
          )}

          {view === "select" && (
            <div className="panel-group">
              <div className="panel-title">Level Select</div>
              <div className="levels-summary">
                <span>{levelPhase(selectedLevel)}</span>
                <span>{currentLevel.name}</span>
              </div>
              <div className="panel-actions">
                <button className="primary-button" onClick={() => startLevel(selectedLevel)}>Play Selected</button>
              </div>
            </div>
          )}

          {view === "settings" && (
            <div className="panel-group">
              <div className="panel-title">Settings</div>
              <div className="panel-card panel-settings">
                <label className="toggle-row">
                  <span>Sound Effects</span>
                  <input
                    type="checkbox"
                    checked={settings.sound}
                    onChange={(event) => setSettings((prev) => ({ ...prev, sound: event.target.checked }))}
                  />
                </label>
                <label className="toggle-row">
                  <span>Full Screen</span>
                  <button className="toggle-button" onClick={toggleFullscreen}>
                    {isFullscreen ? "Exit" : "Enter"}
                  </button>
                </label>
                <label className="slider-row">
                  <span>Gravity Strength</span>
                  <input
                    type="range"
                    min="0.7"
                    max="1.3"
                    step="0.05"
                    value={settings.gravity}
                    onChange={(event) => setSettings((prev) => ({ ...prev, gravity: Number(event.target.value) }))}
                  />
                  <span>{settings.gravity.toFixed(2)}x</span>
                </label>
                <button className="ghost-button" onClick={resetProgress}>Reset Progress</button>
              </div>
            </div>
          )}
        </motion.div>

        <div className="main-area">
          <div className="canvas-wallpaper" />
          <div
            className="canvas-frame"
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          >
            <canvas ref={canvasRef} className="game-canvas" />
            <div className="canvas-overlay">
              <div className="game-hud">
                <div>
                  <span className="hud-label">Level</span>
                  <strong>{currentLevel.name}</strong>
                </div>
                <div>
                  <span className="hud-label">Difficulty</span>
                  <strong>{currentLevel.difficulty}</strong>
                </div>
              </div>
              <div className="game-status">
                <span>{statusText}</span>
              </div>

              <AnimatePresence>
                {gameState === "finished" && view === "playing" && (
                  <motion.div
                    className="finish-screen"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div className="finish-panel">
                      <span className="finish-tag">LEVEL COMPLETE</span>
                      <h2>{currentLevel.name}</h2>
                      <p>Excellent! Keep your rhythm and move to the next stage.</p>
                      <div className="finish-actions">
                        <button className="primary-button" onClick={() => {
                          const next = Math.min(selectedLevel + 1, geoDashersLevels.length - 1);
                          setSelectedLevel(next);
                          setGameState("playing");
                          setStatusText("Hold space or tap to rise.");
                          setGameKey((value) => value + 1);
                        }}>
                          Next Level
                        </button>
                        <button className="secondary-button" onClick={() => {
                          setGameState("playing");
                          setStatusText("Restarting level...");
                          setGameKey((value) => value + 1);
                        }}>
                          Replay
                        </button>
                        <button className="ghost-button" onClick={() => setView("select")}>Back to Levels</button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {view === "select" && (
        <motion.div
          className="level-grid"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          {geoDashersLevels.map((level, index) => {
            const unlocked = levelUnlocked(index);
            const completed = progress.completed.includes(index);
            return (
              <button
                key={level.id}
                className={`level-card ${unlocked ? "unlocked" : "locked"} ${selectedLevel === index ? "active" : ""}`}
                onClick={() => handleLevelSelect(index)}
                disabled={!unlocked}
              >
                <div className="level-chip">{index + 1}</div>
                <div>
                  <h3>{level.name}</h3>
                  <p>{level.description}</p>
                </div>
                <div className="level-badge">
                  {completed ? "✓" : unlocked ? level.difficulty : "Locked"}
                </div>
              </button>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
