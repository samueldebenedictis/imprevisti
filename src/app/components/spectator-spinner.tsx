export default function SpectatorSpinner() {
  return (
    <svg
      className="h-14 w-14 animate-[spin_2.5s_linear_infinite] text-gray-800"
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="4"
        y="4"
        width="32"
        height="32"
        rx="6"
        stroke="currentColor"
        strokeWidth="4"
      />
      <circle cx="14" cy="14" r="2.5" fill="currentColor" />
      <circle cx="26" cy="14" r="2.5" fill="currentColor" />
      <circle cx="20" cy="20" r="2.5" fill="currentColor" />
      <circle cx="14" cy="26" r="2.5" fill="currentColor" />
      <circle cx="26" cy="26" r="2.5" fill="currentColor" />
    </svg>
  );
}
