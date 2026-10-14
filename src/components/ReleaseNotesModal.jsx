import { useEffect, useRef, useState } from "react";
import {
  CURRENT_RELEASE,
  currentReleaseCopy,
  markCurrentReleaseSeen,
  shouldAnnounceCurrentRelease,
} from "../lib/releases.js";

const FOCUSABLE = 'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export default function ReleaseNotesModal({ lang = "pt" }) {
  const [open, setOpen] = useState(shouldAnnounceCurrentRelease);
  const dialogRef = useRef(null);
  const previousFocusRef = useRef(null);
  const copy = currentReleaseCopy(lang);

  useEffect(() => {
    if (!open) return undefined;
    previousFocusRef.current = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.querySelector(FOCUSABLE)?.focus();

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        markCurrentReleaseSeen();
        setOpen(false);
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = [...(dialogRef.current?.querySelectorAll(FOCUSABLE) || [])];
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocusRef.current?.focus?.({ preventScroll: true });
    };
  }, [open]);

  if (!open) return null;

  function close() {
    markCurrentReleaseSeen();
    setOpen(false);
  }

  return (
    <div className="release-notes-overlay">
      <section
        className="release-notes-modal"
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="release-notes-title"
        aria-describedby="release-notes-intro"
      >
        <button
          className="release-notes-close"
          type="button"
          onClick={close}
          aria-label={copy.close}
        >
          ×
        </button>
        <span className="release-notes-eyebrow">
          {copy.eyebrow} v{CURRENT_RELEASE.version}
        </span>
        <h2 id="release-notes-title">{copy.title}</h2>
        <p id="release-notes-intro" className="release-notes-intro">
          {copy.intro}
        </p>
        <ul className="release-notes-list">
          {copy.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <button className="btn primary release-notes-cta" type="button" onClick={close}>
          {copy.cta}
        </button>
      </section>
    </div>
  );
}
