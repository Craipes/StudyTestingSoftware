    import Link from 'next/link';

    export default function NotFound() {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
          <h2 className="text-2xl font-bold mb-2">Not Found 404</h2>
          <p className="mb-4">Could not find requested resource</p>
          <Link href="/dashboard" className="text-blue-500 hover:underline">На головну</Link>
        </div>
      );
    }