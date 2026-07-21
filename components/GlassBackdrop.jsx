// Purely decorative. Always mounted (so it can fade in/out smoothly instead
// of popping), visibility is controlled entirely by CSS via
// [data-theme="glass"] .glass-backdrop { opacity: var(--orb-opacity) }
// (see index.css). This keeps App.jsx from needing any theme branching.
const GlassBackdrop = () => (
  <div className="glass-backdrop" aria-hidden="true">
    <div
      className="glass-orb"
      style={{
        width: 380, height: 380, top: "-80px", left: "-100px",
        background: "radial-gradient(circle, #ffb3ec 0%, #d9a5ff 60%, transparent 75%)",
      }}
    />
    <div
      className="glass-orb"
      style={{
        width: 320, height: 320, top: "15%", right: "-110px",
        background: "radial-gradient(circle, #a6d8ff 0%, #8ea3ff 60%, transparent 75%)",
      }}
    />
    <div
      className="glass-orb"
      style={{
        width: 300, height: 300, bottom: "8%", left: "-80px",
        background: "radial-gradient(circle, #ffe08a 0%, #ffb26b 55%, transparent 75%)",
      }}
    />
    <div
      className="glass-orb"
      style={{
        width: 280, height: 280, bottom: "-100px", right: "-70px",
        background: "radial-gradient(circle, #c9b6ff 0%, #9b7bff 60%, transparent 75%)",
      }}
    />
  </div>
);

export default GlassBackdrop;
