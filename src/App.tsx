import { useEffect, useState } from 'react';
import { ScrapeForm } from './components/ScrapeForm';
import { ScrapeList } from './components/ScrapeList';
import { ScrapeDetails } from './components/ScrapeDetails';
import { supabase } from './lib/supabase';
import { Scrape } from './types/scrape';
import { RefreshCw, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

function App() {
  const [scrapes, setScrapes] = useState<Scrape[]>([]);
  const [selectedScrape, setSelectedScrape] = useState<Scrape | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchScrapes = async () => {
    setIsRefreshing(true);
    const { data, error } = await supabase
      .from('scrapes')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (!error && data) {
      const previousCompleted = scrapes.filter(s => s.status === 'completed').length;
      const newCompleted = data.filter(s => s.status === 'completed').length;

      if (newCompleted > previousCompleted) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#3b82f6', '#06b6d4', '#10b981', '#f59e0b']
        });
      }

      setScrapes(data);
    }
    setIsRefreshing(false);
  };

  useEffect(() => {
    fetchScrapes();

    const subscription = supabase
      .channel('scrapes_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'scrapes',
        },
        () => {
          fetchScrapes();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600 rounded-3xl mb-6 shadow-2xl transform hover:scale-110 transition-transform duration-300 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-3xl blur-xl opacity-50 animate-pulse"></div>
            <Sparkles className="w-10 h-10 text-white relative z-10" />
          </div>
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700 bg-clip-text text-transparent mb-4 animate-slide-down">
            AI Research & Analysis Platform
          </h1>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto font-medium animate-slide-up">
            Discover historical origins and future trends with AI-powered insights
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <div>
            <ScrapeForm onScrapeComplete={fetchScrapes} />
          </div>

          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/50 p-6 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Quick Stats</h2>
                <p className="text-sm text-gray-600 mt-1">Overview of your research activity</p>
              </div>
              <button
                onClick={fetchScrapes}
                disabled={isRefreshing}
                className="p-3 hover:bg-gradient-to-r hover:from-blue-500 hover:to-cyan-500 hover:text-white rounded-xl transition-all duration-300 disabled:opacity-50 transform hover:scale-110"
              >
                <RefreshCw className={`w-5 h-5 text-gray-600 hover:text-white ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="group bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl p-5 shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 cursor-pointer">
                <div className="text-4xl font-extrabold text-white mb-2 group-hover:scale-110 transition-transform">
                  {scrapes.length}
                </div>
                <div className="text-sm text-blue-50 font-medium">Total Analyses</div>
              </div>

              <div className="group bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl p-5 shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 cursor-pointer">
                <div className="text-4xl font-extrabold text-white mb-2 group-hover:scale-110 transition-transform">
                  {scrapes.filter(s => s.status === 'completed').length}
                </div>
                <div className="text-sm text-green-50 font-medium">Completed</div>
              </div>

              <div className="group bg-gradient-to-br from-orange-500 to-red-500 rounded-xl p-5 shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 cursor-pointer">
                <div className="text-4xl font-extrabold text-white mb-2 group-hover:scale-110 transition-transform">
                  {scrapes.filter(s => s.status === 'failed').length}
                </div>
                <div className="text-sm text-orange-50 font-medium">Failed</div>
              </div>
            </div>
          </div>
        </div>

        <ScrapeList
          scrapes={scrapes}
          onSelectScrape={setSelectedScrape}
          selectedScrapeId={selectedScrape?.id || null}
        />
      </div>

      {selectedScrape && (
        <ScrapeDetails
          scrape={selectedScrape}
          onClose={() => setSelectedScrape(null)}
        />
      )}
    </div>
  );
}

export default App;
