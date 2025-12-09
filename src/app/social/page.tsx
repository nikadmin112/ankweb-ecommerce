import Link from 'next/link';
import { Users, ArrowLeft } from 'lucide-react';

export default function SocialPage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-black">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 text-blue-600 dark:text-lilac hover:text-blue-700 dark:hover:text-lilac/80 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Shop
        </Link>
        
        <div className="text-center py-20">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-pink-100 dark:bg-pink-900/30 mb-6">
            <Users className="h-10 w-10 text-pink-600 dark:text-pink-400" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Social</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            This section is under construction. Connect with the community and access 
            exclusive social features soon.
          </p>
        </div>
      </div>
    </main>
  );
}
