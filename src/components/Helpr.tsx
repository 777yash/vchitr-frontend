import React, { useEffect, useRef, useState } from 'react';
import { MessageCircleIcon, XIcon, SendIcon } from './Icons';
import './Helpr.css';

const PLACEHOLDER_MESSAGES = [
  { from: 'bot',  text: "Hi! I'm Helpr. How can I assist you today?" },
  { from: 'user', text: 'How do I add a new chapter?' },
  { from: 'bot',  text: 'Click any subject from Learning mode, then select a chapter from the sidebar.' },
];

const WINDOW_W = 320;
const WINDOW_H = 420;
const BTN_SIZE = 52;
const MARGIN = 20;

function dims(isOpen: boolean) {
  return { w: isOpen ? WINDOW_W : BTN_SIZE, h: isOpen ? WINDOW_H : BTN_SIZE };
}

function clampPos(p: { x: number; y: number }, isOpen: boolean) {
  const { w, h } = dims(isOpen);
  return {
    x: Math.max(0, Math.min(p.x, window.innerWidth - w)),
    y: Math.max(0, Math.min(p.y, window.innerHeight - h)),
  };
}

function snapToNearestEdge(p: { x: number; y: number }, isOpen: boolean) {
  const { w, h } = dims(isOpen);
  const cx = p.x + w / 2;
  const cy = p.y + h / 2;

  const dLeft   = cx;
  const dRight  = window.innerWidth  - cx;
  const dTop    = cy;
  const dBottom = window.innerHeight - cy;
  const min = Math.min(dLeft, dRight, dTop, dBottom);

  if (min === dLeft)   return clampPos({ x: MARGIN, y: p.y }, isOpen);
  if (min === dRight)  return clampPos({ x: window.innerWidth  - w - MARGIN, y: p.y }, isOpen);
  if (min === dTop)    return clampPos({ x: p.x, y: MARGIN }, isOpen);
  /* dBottom */        return clampPos({ x: p.x, y: window.innerHeight - h - MARGIN }, isOpen);
}

function getInitialPos(isOpen: boolean) {
  const { w, h } = dims(isOpen);
  return { x: window.innerWidth - w - MARGIN, y: window.innerHeight - h - MARGIN };
}

const Helpr: React.FC = () => {
  const [open, setOpen]   = useState(false);
  const [pos,  setPos]    = useState<{ x: number; y: number } | null>(null);
  const [snapping, setSnapping] = useState(false);

  const isDragging = useRef(false);
  const didDrag    = useRef(false);
  const startPtr   = useRef({ x: 0, y: 0 });
  const startPos   = useRef({ x: 0, y: 0 });

  const getPos = () => clampPos(pos ?? getInitialPos(open), open);

  useEffect(() => {
    const onResize = () => setPos((p) => p ? clampPos(p, open) : null);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [open]);

  const onPointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    didDrag.current    = false;
    startPtr.current   = { x: e.clientX, y: e.clientY };
    startPos.current   = getPos();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    e.preventDefault();
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - startPtr.current.x;
    const dy = e.clientY - startPtr.current.y;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) didDrag.current = true;
    setSnapping(false);
    setPos(clampPos({ x: startPos.current.x + dx, y: startPos.current.y + dy }, open));
  };

  const onPointerUp = (e: React.PointerEvent) => {
    isDragging.current = false;
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    if (didDrag.current) {
      // Snap to nearest edge after drag release
      setSnapping(true);
      setPos(snapToNearestEdge(getPos(), open));
    }
  };

  const toggleOpen = () => {
    if (didDrag.current) return;
    const nextOpen = !open;
    const cur = getPos();
    let raw: { x: number; y: number };
    if (nextOpen) {
      // Expand: anchor window top-left near button, clamp into view
      raw = clampPos({ x: cur.x, y: cur.y - (WINDOW_H - BTN_SIZE) }, nextOpen);
    } else {
      // Collapse: snap button to nearest edge based on window center
      raw = snapToNearestEdge(cur, nextOpen);
    }
    setSnapping(true);
    setPos(raw);
    setOpen(nextOpen);
  };

  const currentPos = getPos();
  const transitionStyle = snapping && !isDragging.current
    ? 'left 0.28s cubic-bezier(0.16,1,0.3,1), top 0.28s cubic-bezier(0.16,1,0.3,1)'
    : 'none';

  if (!open) {
    return (
      <button
        className="helpr-trigger"
        style={{ left: currentPos.x, top: currentPos.y, transition: transitionStyle }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClick={toggleOpen}
        title="Open Helpr"
        aria-label="Open Helpr chat"
      >
        {MessageCircleIcon({ size: 22 })}
        <span className="helpr-trigger-label">Helpr</span>
      </button>
    );
  }

  return (
    <div
      className="helpr-window"
      style={{ left: currentPos.x, top: currentPos.y, width: WINDOW_W, height: WINDOW_H, transition: transitionStyle }}
    >
      <div
        className="helpr-header"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClick={toggleOpen}
      >
        <span className="helpr-header-icon">{MessageCircleIcon({ size: 16 })}</span>
        <span className="helpr-header-title">Helpr</span>
        <button
          className="helpr-close"
          onClick={(e) => { e.stopPropagation(); setOpen(false); }}
          aria-label="Close Helpr"
        >
          {XIcon({ size: 14 })}
        </button>
      </div>

      <div className="helpr-messages">
        {PLACEHOLDER_MESSAGES.map((msg, i) => (
          <div key={i} className={`helpr-msg helpr-msg--${msg.from}`}>
            <span className="helpr-bubble">{msg.text}</span>
          </div>
        ))}
      </div>

      <div className="helpr-input-row">
        <input className="helpr-input" type="text" placeholder="Ask something..." readOnly />
        <button className="helpr-send" aria-label="Send" disabled>
          {SendIcon({ size: 15 })}
        </button>
      </div>
    </div>
  );
};

export default Helpr;
