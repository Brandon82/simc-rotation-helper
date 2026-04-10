import { Link } from 'react-router-dom';

interface BackLinkProps {
  to: string;
  children: React.ReactNode;
  className?: string;
}

export function BackLink({ to, children, className = '' }: BackLinkProps) {
  return (
    <Link
      to={to}
      className={`inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors group ${className}`}
    >
      <svg
        className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="19" y1="12" x2="5" y2="12" />
        <polyline points="12 19 5 12 12 5" />
      </svg>
      <span className="border-b border-transparent group-hover:border-gray-400 dark:group-hover:border-gray-500 transition-colors">
        {children}
      </span>
    </Link>
  );
}
