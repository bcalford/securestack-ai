export default function ProductLogo() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M12 2.5 4 5.75V11c0 5.25 3.4 9.6 8 10.5 4.6-.9 8-5.25 8-10.5V5.75L12 2.5Z"
          fill="url(#securestack-logo-gradient)"
          stroke="var(--color-accent)"
          strokeWidth="1.1"
        />
        <path d="m8.6 12.1 2.4 2.4 4.4-4.9" stroke="var(--color-accent-contrast)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <defs>
          <linearGradient id="securestack-logo-gradient" x1="4" y1="2.5" x2="20" y2="21.5" gradientUnits="userSpaceOnUse">
            <stop stopColor="var(--color-accent)" />
            <stop offset="1" stopColor="var(--color-secondary)" />
          </linearGradient>
        </defs>
      </svg>
    </span>
  );
}
