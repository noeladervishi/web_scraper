export default function LoadingSpinner({ size = "sm" }: { size?: "sm" | "md" | "lg" }) {
  const dims = size === "sm" ? 16 : size === "lg" ? 32 : 24;
  const sizeClass = size === "sm" ? "h-4 w-4" : size === "lg" ? "h-8 w-8" : "h-6 w-6";
  return (
    <svg
      className={`animate-spin ${sizeClass} text-muted`}
      width={dims}
      height={dims}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      focusable="false"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
    </svg>
  );
}
