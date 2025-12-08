import { CheckCircle2, XCircle, Clock, ExternalLink } from 'lucide-react';
import { Scrape } from '../types/scrape';

interface ScrapeListProps {
  scrapes: Scrape[];
  onSelectScrape: (scrape: Scrape) => void;
  selectedScrapeId: string | null;
}

export function ScrapeList({ scrapes, onSelectScrape, selectedScrapeId }: ScrapeListProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-6 h-6 text-green-500" />;
      case 'failed':
        return <XCircle className="w-6 h-6 text-red-500" />;
      case 'pending':
        return <Clock className="w-6 h-6 text-yellow-500 animate-pulse" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      completed: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg',
      failed: 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg',
      pending: 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg animate-pulse',
    };

    return (
      <span className={`px-3 py-1 text-xs font-bold rounded-full ${styles[status as keyof typeof styles]}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  if (scrapes.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/50 p-16 text-center">
        <div className="relative inline-block mb-6">
          <Globe className="w-20 h-20 text-gray-300 mx-auto" />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-xl"></div>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">No research yet</h3>
        <p className="text-gray-600 font-medium">Start by entering a URL and keyword above to generate your first analysis</p>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/50 overflow-hidden hover:shadow-2xl transition-all duration-300">
      <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-blue-50 via-cyan-50 to-blue-50">
        <h3 className="text-xl font-bold text-gray-900">Research History</h3>
        <p className="text-sm text-gray-600 mt-1 font-medium">{scrapes.length} total analyses</p>
      </div>

      <div className="divide-y divide-gray-200">
        {scrapes.map((scrape) => (
          <button
            key={scrape.id}
            onClick={() => onSelectScrape(scrape)}
            className={`w-full px-6 py-5 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 transition-all duration-300 text-left transform hover:scale-[1.01] ${
              selectedScrapeId === scrape.id ? 'bg-gradient-to-r from-blue-100 to-cyan-100 shadow-inner' : ''
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="mt-1">{getStatusIcon(scrape.status)}</div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="font-bold text-gray-900 truncate text-lg">
                    {scrape.title || 'Untitled'}
                  </h4>
                  {getStatusBadge(scrape.status)}
                </div>

                {scrape.keyword && (
                  <div className="flex items-center gap-2 text-sm font-bold mb-2">
                    <span className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-3 py-1 rounded-full shadow-md">
                      {scrape.keyword}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                  <ExternalLink className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate font-medium">{scrape.url}</span>
                </div>

                <div className="flex items-center gap-4 mt-2 text-xs text-gray-600 font-medium">
                  <span>{formatDate(scrape.created_at)}</span>
                  {scrape.error && (
                    <span className="text-red-600 font-bold truncate">Error: {scrape.error}</span>
                  )}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function Globe({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
      />
    </svg>
  );
}
