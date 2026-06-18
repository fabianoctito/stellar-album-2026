import { useEffect, useId, useRef, type ReactNode, type RefObject } from "react";
import { motion } from "framer-motion";
import { buttonClass } from "./ui";

const FOCUSABLE = 'a[href],button:not([disabled]),textarea,input,select,[tabindex]:not([tabindex="-1"])';

/** Trap keyboard focus within `ref` while mounted: focus the first control,
 *  cycle Tab inside, call onEscape on Escape, and restore focus to whatever was
 *  focused before (the trigger) on unmount. The effect runs once per mount —
 *  `onEscape` is read through a ref so an inline arrow from the caller doesn't
 *  re-run the trap (which would steal focus on every host re-render). */
export function useFocusTrap(ref: RefObject<HTMLElement | null>, onEscape?: () => void) {
  const onEscapeRef = useRef(onEscape);
  onEscapeRef.current = onEscape;

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const prev = document.activeElement as HTMLElement | null;
    const list = () => Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE));
    (list()[0] ?? node).focus({ preventScroll: true });

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onEscapeRef.current?.();
        return;
      }
      if (e.key !== "Tab") return;
      const items = list();
      if (!items.length) {
        e.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || !node.contains(active))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("keydown", onKey, true);
      prev?.focus?.({ preventScroll: true });
    };
  }, [ref]);
}

/** A ✕ close affordance for dialogs. */
export function CloseButton({ onClick, className = "" }: { onClick: () => void; className?: string }) {
  return (
    <button
      onClick={onClick}
      aria-label="Close"
      className={`grid h-9 w-9 place-items-center rounded-full text-lg leading-none transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-leaf ${className}`}
    >
      ✕
    </button>
  );
}

/** Accessible paneled modal: dimmed backdrop + a centered card with dialog
 *  semantics, a focus trap, Escape-to-close, and backdrop-click-to-close. */
export function Dialog({
  onClose,
  labelledBy,
  children,
  panelClassName = "",
}: {
  onClose: () => void;
  labelledBy?: string;
  children: ReactNode;
  panelClassName?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, onClose);
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
    >
      <div ref={ref} role="dialog" aria-modal="true" aria-labelledby={labelledBy} tabIndex={-1} onClick={(e) => e.stopPropagation()} className={panelClassName}>
        {children}
      </div>
    </motion.div>
  );
}

/** A focused confirm step for irreversible actions. `tone="danger"` flags a
 *  destructive/permanent action (e.g. burning a sticker). */
export function ConfirmDialog({
  title,
  body,
  confirmLabel,
  cancelLabel = "Cancel",
  tone = "default",
  busy = false,
  onConfirm,
  onClose,
}: {
  title: string;
  body: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  tone?: "default" | "danger";
  busy?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const titleId = useId();
  return (
    <Dialog onClose={onClose} labelledBy={titleId} panelClassName="w-full max-w-sm rounded-2xl bg-paper p-6 shadow-xl ring-1 ring-edge">
      <h3 id={titleId} className="font-display text-lg font-bold text-ink">
        {title}
      </h3>
      <div className="mt-2 text-sm text-ink-soft">{body}</div>
      <div className="mt-5 flex justify-end gap-2">
        <button onClick={onClose} disabled={busy} className={buttonClass("ghost", "sm")}>
          {cancelLabel}
        </button>
        <button onClick={onConfirm} disabled={busy} className={buttonClass(tone === "danger" ? "danger" : "primary", "sm")}>
          {confirmLabel}
        </button>
      </div>
    </Dialog>
  );
}
