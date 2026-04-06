interface SwordsIconProps {
  className?: string;
}

export function SwordsIcon({ className = 'w-5 h-5' }: SwordsIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Left sword: blade from top-left to center */}
      <line x1="4" y1="3" x2="13" y2="12" strokeWidth="2" />
      {/* Left sword: crossguard */}
      <line x1="9" y1="12.5" x2="13.5" y2="8" strokeWidth="1.8" />
      {/* Left sword: grip to pommel */}
      <line x1="13" y1="12" x2="16.5" y2="15.5" strokeWidth="2.5" />

      {/* Right sword: blade from top-right to center */}
      <line x1="20" y1="3" x2="11" y2="12" strokeWidth="2" />
      {/* Right sword: crossguard */}
      <line x1="10.5" y1="8" x2="15" y2="12.5" strokeWidth="1.8" />
      {/* Right sword: grip to pommel */}
      <line x1="11" y1="12" x2="7.5" y2="15.5" strokeWidth="2.5" />

      {/* Pommels */}
      <circle cx="17.5" cy="16.5" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="6.5" cy="16.5" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}
