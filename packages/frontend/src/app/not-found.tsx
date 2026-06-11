import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-primary-500 mb-4">404</h1>
        <p className="text-gray-400 text-lg mb-8">Page not found</p>
        <Link
          href="/"
          className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition duration-200 inline-block"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
