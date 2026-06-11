'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-white mb-4">MAGS AI Studio</h1>
          <p className="text-gray-400 text-lg">
            AI SaaS platform like Cursor / Claude / OpenAI assistant
          </p>
        </div>

        <div className="mt-12 space-y-4">
          <Link
            href="/auth/login"
            className="w-full px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition duration-200 flex items-center justify-center"
          >
            Login
          </Link>
          <Link
            href="/auth/register"
            className="w-full px-6 py-3 border border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white font-semibold rounded-lg transition duration-200 flex items-center justify-center"
          >
            Register
          </Link>
        </div>

        <div className="pt-12 border-t border-gray-700">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-gray-400 text-sm">Built with</p>
              <p className="text-white font-semibold">Next.js & NestJS</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Powered by</p>
              <p className="text-white font-semibold">AI & Cloud</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
