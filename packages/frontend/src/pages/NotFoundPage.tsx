import { BackLink } from '../components/ui/BackLink';

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center">
      <p className="text-4xl mb-4">🗡️</p>
      <h1 className="text-2xl font-bold text-white mb-2">Page Not Found</h1>
      <p className="text-gray-400 mb-6">The page you're looking for doesn't exist.</p>
      <BackLink to="/">Back to home</BackLink>
    </div>
  );
}
