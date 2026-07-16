import { useState } from "react";
import { Moon, Sparkles } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

// A single round button that swaps its icon the moment you tap it — not a
// track-and-thumb on/off switch. A quick scale+rotate pop gives tap
// feedback, but the theme itself flips instantly on click.
const ThemeToggle = () => {
  const { isGlass, toggleTheme } = useTheme();
  const [popped, setPopped] = useState(false);

  const handleClick = () => {
    toggleTheme();
    setPopped(true);
    setTimeout(() => setPopped(false), 220);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={isGlass ? "Switch to dark theme" : "Switch to glass theme"}
      title={isGlass ? "Switch to dark theme" : "Switch to glass theme"}
      className="glass-card fixed top-4 right-4 z-50 w-10 h-10 flex items-center justify-center transition-transform duration-200"
      style={{
        borderRadius: "9999px",
        transform: popped ? "scale(0.82) rotate(25deg)" : "scale(1) rotate(0deg)",
      }}
    >
      {isGlass ? (
        <Sparkles size={17} style={{ color: "var(--accent)" }} />
      ) : (
        <Moon size={17} style={{ color: "var(--accent)" }} />
      )}
    </button>
  );
};

export default ThemeToggle;
