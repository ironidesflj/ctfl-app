export default function BrandMark({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <g stroke="#fff" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9,36 18,17 29,26 39,11" />
      </g>
      <circle cx="9" cy="36" r="3.4" fill="var(--cert-accent)" stroke="#fff" strokeWidth="2.2" />
      <circle cx="18" cy="17" r="3.4" fill="var(--cert-accent)" stroke="#fff" strokeWidth="2.2" />
      <circle cx="29" cy="26" r="3.4" fill="var(--cert-accent)" stroke="#fff" strokeWidth="2.2" />
      <circle cx="39" cy="11" r="4.6" fill="#fff" />
    </svg>
  );
}

export function BrandMarkOutline({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <g stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9,36 18,17 29,26 39,11" />
      </g>
      <circle cx="9" cy="36" r="3.4" fill="var(--surface-2)" stroke="currentColor" strokeWidth="2.2" />
      <circle cx="18" cy="17" r="3.4" fill="var(--surface-2)" stroke="currentColor" strokeWidth="2.2" />
      <circle cx="29" cy="26" r="3.4" fill="var(--surface-2)" stroke="currentColor" strokeWidth="2.2" />
      <circle cx="39" cy="11" r="4.6" fill="currentColor" />
    </svg>
  );
}
