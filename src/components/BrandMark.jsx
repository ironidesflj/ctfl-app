export default function BrandMark({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <g
        stroke="currentColor"
        strokeWidth="2.2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M9 36C12 30.5 14.6 21.4 18 17c3.4-4.4 7.8 5.2 11 9 3.2 3.8 6.8-7.4 10-15" />
      </g>
      <circle
        cx="9"
        cy="36"
        r="2.6"
        fill="var(--syn-field, var(--accent))"
        stroke="currentColor"
        strokeWidth="2.2"
      />
      <circle
        cx="18"
        cy="17"
        r="2.9"
        fill="var(--syn-field, var(--accent))"
        stroke="currentColor"
        strokeWidth="2.2"
      />
      <circle
        cx="29"
        cy="26"
        r="3.2"
        fill="var(--syn-field, var(--accent))"
        stroke="currentColor"
        strokeWidth="2.2"
      />
      <circle cx="39" cy="11" r="6.2" fill="var(--syn-field, var(--accent))" />
      <circle cx="39" cy="11" r="4.6" fill="currentColor" />
    </svg>
  );
}

export function BrandMarkOutline({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <g
        stroke="currentColor"
        strokeWidth="2.2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M9 36C12 30.5 14.6 21.4 18 17c3.4-4.4 7.8 5.2 11 9 3.2 3.8 6.8-7.4 10-15" />
      </g>
      <circle
        cx="9"
        cy="36"
        r="3.4"
        fill="var(--surface-2)"
        stroke="currentColor"
        strokeWidth="2.2"
      />
      <circle
        cx="18"
        cy="17"
        r="3.4"
        fill="var(--surface-2)"
        stroke="currentColor"
        strokeWidth="2.2"
      />
      <circle
        cx="29"
        cy="26"
        r="3.4"
        fill="var(--surface-2)"
        stroke="currentColor"
        strokeWidth="2.2"
      />
      <circle cx="39" cy="11" r="4.6" fill="currentColor" />
    </svg>
  );
}
