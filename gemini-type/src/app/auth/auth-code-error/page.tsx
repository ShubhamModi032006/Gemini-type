import Link from 'next/link'

export default function AuthCodeErrorPage() {
  return (
    <div className="bg-gray-900 text-white min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full p-8 bg-gray-800 rounded-lg shadow-lg text-center">
        <h1 className="text-3xl font-bold mb-4 text-red-400">Authentication Error</h1>
        <p className="text-gray-300 mb-6">
          There was an error processing your authentication request. This could happen if:
        </p>
        <ul className="text-left text-gray-400 mb-6 space-y-2">
          <li>• The verification link has expired</li>
          <li>• The verification link has already been used</li>
          <li>• The verification code is invalid</li>
        </ul>
        <div className="flex flex-col gap-3">
          <Link
            href="/login"
            className="px-4 py-2 bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </Link>
          <Link
            href="/"
            className="px-4 py-2 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors"
          >
            Go to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
