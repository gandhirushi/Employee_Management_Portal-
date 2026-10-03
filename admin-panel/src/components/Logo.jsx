export default function Logo({ size = 34 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" style={{ flexShrink: 0 }}>
      <rect width="64" height="64" rx="16" fill="#7696e0" />
      <path
        d="M16 14 L32 32 M48 14 L32 32 L32 50"
        stroke="#c10000"
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="32" cy="50" r="3.5" fill="#12B8A6" />
    </svg>
  );
}