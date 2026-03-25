const fs = require('fs');

const css = `
/* Skeleton Loading */
.skeleton-container {
  display: flex;
  height: 100vh;
  background: var(--bg);
}
.skeleton-sidebar {
  width: 260px;
  background: var(--bg2);
  border-right: 1px solid var(--border);
  animation: pulse 1.5s infinite ease-in-out;
}
.skeleton-main {
  flex: 1;
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.skeleton-header {
  height: 60px;
  background: var(--bg2);
  border-radius: 8px;
  animation: pulse 1.5s infinite ease-in-out;
}
.skeleton-content {
  display: flex;
  gap: 16px;
}
.skeleton-card {
  flex: 1;
  height: 120px;
  background: var(--bg2);
  border-radius: 12px;
  animation: pulse 1.5s infinite ease-in-out;
}
@keyframes pulse {
  0% { opacity: 0.6; }
  50% { opacity: 0.3; }
  100% { opacity: 0.6; }
}

/* XAI Tooltip */
.xai-tooltip {
  position: relative;
  cursor: help;
}
.xai-tooltip .xai-popover {
  visibility: hidden;
  opacity: 0;
  position: absolute;
  bottom: 120%;
  left: 50%;
  transform: translateX(-50%) translateY(10px);
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid var(--border);
  color: #F8FAFC;
  font-size: 0.75rem;
  font-weight: 400;
  width: 220px;
  z-index: 100;
  box-shadow: var(--shadow-glow);
  transition: all 0.2s ease;
  pointer-events: none;
  text-align: left;
  line-height: 1.4;
}
.xai-tooltip:hover .xai-popover {
  visibility: visible;
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}
`;

fs.appendFileSync('src/App.css', css);
console.log('CSS appended successfully');
