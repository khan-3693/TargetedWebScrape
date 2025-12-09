import { useEffect, useState } from 'react';
import { ScrapeForm } from './components/ScrapeForm';
import { ScrapeList } from './components/ScrapeList';
import { ScrapeDetails } from './components/ScrapeDetails';
import { AuthModal } from './components/AuthModal';
import { UserProfile } from './components/UserProfile';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { supabase } from './lib/supabase';
import { Scrape } from './types/scrape';
import { RefreshCw, LogIn } from 'lucide-react';
import { createConfetti } from './utils/confetti';

function AppContent() {
  const { user, loading: authLoading } = useAuth();
  const [scrapes, setScrapes] = useState<Scrape[]>([]);
  const [selectedScrape, setSelectedScrape] = useState<Scrape | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const fetchScrapes = async () => {
    if (!user) {
      setScrapes([]);
      return;
    }

    setIsRefreshing(true);
    const { data, error } = await supabase
      .from('scrapes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (!error && data) {
      const prevCompleted = scrapes.filter(s => s.status === 'completed').length;
      const newCompleted = data.filter(s => s.status === 'completed').length;

      if (newCompleted > prevCompleted) {
        createConfetti();
      }

      setScrapes(data);
    }
    setIsRefreshing(false);
  };

  useEffect(() => {
    if (user) {
      fetchScrapes();

      const subscription = supabase
        .channel('scrapes_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'scrapes',
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            fetchScrapes();
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl mb-4 shadow-lg animate-pulse">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex justify-between items-start mb-12">
          <div className="text-center flex-1">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl mb-4 shadow-xl">
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-3">
              AI Research & Analysis Platform
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover historical origins and future trends with AI-powered insights
            </p>
          </div>

          <div className="ml-4">
            {user ? (
              <UserProfile />
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-cyan-700 transition-all"
              >
                <LogIn className="w-5 h-5" />
                Sign In
              </button>
            )}
          </div>
        </div>

        {!user ? (
          <div className="bg-white rounded-2xl shadow-xl border-2 border-blue-100 p-12 text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full mb-6">
              <LogIn className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Sign in to Get Started
            </h2>
            <p className="text-gray-600 mb-8">
              Create an account or sign in to save your research, access your analysis history, and unlock all features.
            </p>
            <button
              onClick={() => setShowAuthModal(true)}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-cyan-700 transition-all"
            >
              Sign In Now
            </button>
          </div>
        ) : (
          <>
            <div className="grid lg:grid-cols-2 gap-8 mb-8">
              <div>
                <ScrapeForm onScrapeComplete={fetchScrapes} userId={user.id} />
              </div>

              <div className="bg-white rounded-xl shadow-lg border-2 border-blue-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Quick Stats</h2>
                    <p className="text-sm text-gray-500 mt-1">Overview of your research activity</p>
                  </div>
                  <button
                    onClick={fetchScrapes}
                    disabled={isRefreshing}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-5 h-5 text-gray-600 ${isRefreshing ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-5 border-2 border-blue-200 shadow-sm">
                    <div className="text-4xl font-bold text-blue-600 mb-1">
                      {scrapes.length}
                    </div>
                    <div className="text-sm font-medium text-gray-600">Total Analyses</div>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border-2 border-green-200 shadow-sm">
                    <div className="text-4xl font-bold text-green-600 mb-1">
                      {scrapes.filter(s => s.status === 'completed').length}
                    </div>
                    <div className="text-sm font-medium text-gray-600">Completed</div>
                  </div>

                  <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-5 border-2 border-orange-200 shadow-sm">
                    <div className="text-4xl font-bold text-orange-600 mb-1">
                      {scrapes.filter(s => s.status === 'failed').length}
                    </div>
                    <div className="text-sm font-medium text-gray-600">Failed</div>
                  </div>
                </div>
              </div>
            </div>

            <ScrapeList
              scrapes={scrapes}
              onSelectScrape={setSelectedScrape}
              selectedScrapeId={selectedScrape?.id || null}
            />
          </>
        )}
      </div>

      {selectedScrape && (
        <ScrapeDetails
          scrape={selectedScrape}
          onClose={() => setSelectedScrape(null)}
        />
      )}

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
