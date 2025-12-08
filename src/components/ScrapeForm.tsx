import { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';

interface ScrapeFormProps {
  onScrapeComplete: () => void;
}

export function ScrapeForm({ onScrapeComplete }: ScrapeFormProps) {
  const [url, setUrl] = useState('');
  const [keyword, setKeyword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/scrape`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, keyword }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(`Research complete: ${data.title}`);
        setUrl('');
        setKeyword('');
        onScrapeComplete();
      } else {
        setError(data.error || 'Failed to complete research');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/50 p-6 hover:shadow-2xl transition-all duration-300">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600 rounded-xl shadow-lg transform hover:rotate-12 transition-transform duration-300">
          <Search className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">AI Research Tool</h2>
          <p className="text-sm text-gray-600 font-medium">Generate historical origins and future trends analysis</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="transform hover:scale-[1.02] transition-transform duration-200">
          <label htmlFor="url" className="block text-sm font-bold text-gray-800 mb-2">
            Website URL
          </label>
          <input
            type="url"
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            required
            disabled={isLoading}
            className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all disabled:bg-gray-100 disabled:text-gray-500 font-medium shadow-sm hover:shadow-md"
          />
        </div>

        <div className="transform hover:scale-[1.02] transition-transform duration-200">
          <label htmlFor="keyword" className="block text-sm font-bold text-gray-800 mb-2">
            Keyword or Phrase
          </label>
          <input
            type="text"
            id="keyword"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="e.g., artificial intelligence, blockchain, etc."
            required
            disabled={isLoading}
            className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all disabled:bg-gray-100 disabled:text-gray-500 font-medium shadow-sm hover:shadow-md"
          />
        </div>

        {error && (
          <div className="p-4 bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-300 rounded-xl animate-shake shadow-lg">
            <p className="text-sm font-semibold text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl animate-bounce-in shadow-lg">
            <p className="text-sm font-semibold text-green-800">{success}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !url || !keyword}
          className="w-full bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700 text-white font-bold py-4 px-6 rounded-xl hover:from-blue-700 hover:via-cyan-700 hover:to-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-2xl transform hover:scale-105 active:scale-95"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="text-lg">Analyzing...</span>
            </>
          ) : (
            <>
              <Search className="w-6 h-6" />
              <span className="text-lg">Generate Analysis</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
