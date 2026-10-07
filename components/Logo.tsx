// Brand logo: mark + wordmark. Used in navbar/header; same mark as app/icon.svg.
export function Logo({ size = 28, showText = true }: { size?: number; showText?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2" aria-label="InvoiceMint">
      <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
        <rect width="64" height="64" rx="16" fill="var(--accent, #a16207)" />
        <path d="M20 14h24v36l-6-4-6 4-6-4-6 4zM27 26h10M27 34h7" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </svg>
      {showText && (
        <span style={{ fontWeight: 800, letterSpacing: "-0.02em" }}>
          Invoice<span style={{ color: "var(--accent, #a16207)" }}>Mint</span>
        </span>
      )}
    </span>
  );
}
export default Logo;
