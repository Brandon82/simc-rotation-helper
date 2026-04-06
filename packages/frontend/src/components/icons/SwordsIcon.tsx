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
      strokeWidth="2"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Shield outline */}
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}
