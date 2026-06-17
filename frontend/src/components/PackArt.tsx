// The sealed-pack visual, shared by the landing screen, the open-pack loading
// beat, and the face-down card backs so the brand reads consistently.
export function PackArt({ className = "", labelClass = "text-2xl" }: { className?: string; labelClass?: string }) {
  return (
    <div className={`grid place-items-center bg-leaf-deep legendary-foil ${className}`}>
      <span className={`font-display font-extrabold tracking-wide text-paper ${labelClass}`}>PACK</span>
    </div>
  );
}
