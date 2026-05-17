import React, { forwardRef, useEffect, useCallback } from "react";
import { motion, useAnimate } from "motion/react";

// 🌟 1. GEMINI AUTO-ANIMATED ICON 🌟
export const BrandGeminiIcon = forwardRef(
  ({ size = 24, color = "currentColor", className = "" }, ref) => {
    const [scope, animate] = useAnimate();

    const startAnimation = useCallback(() => {
      animate(
        scope.current,
        { 
          scale: [1, 0.85, 1.05, 1], 
          rotate: [0, 90, -90, 0] 
        },
        {
          duration: 3,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
        }
      );
    }, [animate, scope]);

    useEffect(() => {
      startAnimation();
    }, [startAnimation]);

    return (
      <motion.svg
        ref={scope}
        fill={color}
        viewBox="0 0 24 24"
        height={size}
        width={size}
        xmlns="http://www.w3.org/2000/svg"
        className={`gemini-icon ${className}`}
        style={{
          flex: "none",
          lineHeight: 1,
          transformOrigin: "center",
        }}
      >
        <motion.path
          d="M20.616 10.835a14.147 14.147 0 01-4.45-3.001 14.111 14.111 0 01-3.678-6.452.503.503 0 00-.975 0 14.134 14.134 0 01-3.679 6.452 14.155 14.155 0 01-4.45 3.001c-.65.28-1.318.505-2.002.678a.502.502 0 000 .975c.684.172 1.35.397 2.002.677a14.147 14.147 0 014.45 3.001 14.112 14.112 0 013.679 6.453.502.502 0 00.975 0c.172-.685.397-1.351.677-2.003a14.145 14.145 0 013.001-4.45 14.113 14.113 0 016.453-3.678.503.503 0 000-.975 13.245 13.245 0 01-2.003-.678z"
        />
      </motion.svg>
    );
  }
);
BrandGeminiIcon.displayName = "BrandGeminiIcon";

// ⚡ 2. CHATGPT (OPENAI) AUTO-ANIMATED ICON ⚡
export const BrandOpenaiIcon = forwardRef(
  ({ size = 24, color = "currentColor", strokeWidth = 2, className = "" }, ref) => {
    const [scope, animate] = useAnimate();

    const startAnimation = useCallback(() => {
      animate(
        ".internal",
        { pathLength: [0, 1, 0] }, // Draws and un-draws the paths
        {
          duration: 3,
          repeat: Infinity,
          repeatType: "loop",
          ease: "easeInOut",
          delay: (i) => i * 0.15,
        }
      );
    }, [animate]);

    useEffect(() => {
      startAnimation();
    }, [startAnimation]);

    return (
      <motion.svg
        ref={scope}
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`select-none ${className}`}
      >
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        {[
          "M11.217 19.384a3.501 3.501 0 0 0 6.783 -1.217v-5.167l-6 -3.35",
          "M5.214 15.014a3.501 3.501 0 0 0 4.446 5.266l4.34 -2.534v-6.946",
          "M6 7.63c-1.391 -.236 -2.787 .395 -3.534 1.689a3.474 3.474 0 0 0 1.271 4.745l4.263 2.514l6 -3.348",
          "M12.783 4.616a3.501 3.501 0 0 0 -6.783 1.217v5.067l6 3.45",
          "M18.786 8.986a3.501 3.501 0 0 0 -4.446 -5.266l-4.34 2.534v6.946",
          "M18 16.302c1.391 .236 2.787 -.395 3.534 -1.689a3.474 3.474 0 0 0 -1.271 -4.745l-4.308 -2.514l-5.955 3.42",
        ].map((d, i) => (
          <motion.path
            key={i}
            d={d}
            className="internal"
            initial={{ pathLength: 0, opacity: 1 }}
            custom={i} // Used for the delay stagger
          />
        ))}
      </motion.svg>
    );
  }
);
BrandOpenaiIcon.displayName = "BrandOpenaiIcon";

// 🚨 3. BRAIN CIRCUIT ICON (default export for compatibility) 🚨
export const BrainCircuitIcon = forwardRef(
  ({ size = 24, color = "currentColor", strokeWidth = 2, className = "" }, ref) => {
    const [scope, animate] = useAnimate();

    const startAnimation = useCallback(() => {
      animate(".brain-outline", { opacity: [1, 0.6, 1] }, { duration: 2.5, repeat: Infinity, ease: "easeInOut" });
      animate(".circuit-line", { pathLength: [0, 1, 0] }, { duration: 2.5, repeat: Infinity, repeatType: "loop", ease: "easeInOut" });

      const terminals = [".terminal-1", ".terminal-2", ".terminal-3", ".terminal-4"];
      terminals.forEach((selector, index) => {
        animate(selector, { scale: [1, 1.4, 1], opacity: [0.3, 1, 0.3] }, { duration: 1.5, delay: index * 0.2, repeat: Infinity, ease: "easeInOut" });
      });
    }, [animate]);

    useEffect(() => {
      startAnimation();
    }, [startAnimation]);

    return (
      <div className={`relative flex items-center justify-center ${className}`}>
        <motion.svg ref={scope} xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <motion.path className="brain-outline" d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
          <motion.path className="circuit-line" d="M9 13a4.5 4.5 0 0 0 3-4" />
          <motion.path className="brain-outline" d="M6.003 5.125A3 3 0 0 0 6.401 6.5" />
          <motion.path className="brain-outline" d="M3.477 10.896a4 4 0 0 1 .585-.396" />
          <motion.path className="brain-outline" d="M6 18a4 4 0 0 1-1.967-.516" />
          <motion.path className="circuit-line" d="M12 13h4" />
          <motion.path className="circuit-line" d="M12 18h6a2 2 0 0 1 2 2v1" />
          <motion.path className="circuit-line" d="M12 8h8" />
          <motion.path className="circuit-line" d="M16 8V5a2 2 0 0 1 2-2" />
          <motion.circle className="terminal terminal-1" cx="16" cy="13" r=".5" />
          <motion.circle className="terminal terminal-2" cx="18" cy="3" r=".5" />
          <motion.circle className="terminal terminal-3" cx="20" cy="21" r=".5" />
          <motion.circle className="terminal terminal-4" cx="20" cy="8" r=".5" />
        </motion.svg>
      </div>
    );
  }
);
BrainCircuitIcon.displayName = "BrainCircuitIcon";

// Default export kept for compatibility with existing imports
export default BrainCircuitIcon;

