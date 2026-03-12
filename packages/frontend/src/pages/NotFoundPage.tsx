import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center">
      <p className="text-4xl mb-4">🗡️</p>
      <h1 className="text-2xl font-bold text-white mb-2">Page Not Found</h1>
      <p className="text-gray-400 mb-6">The page you're looking for doesn't exist.</p>
      <Link to="/" className="text-blue-400 hover:underline">← Back to home</Link>
    </div>
  );
}
