import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { MovieCard } from './components/MovieCard';
import { EmailComposer } from './components/EmailComposer';
import { Button } from './components/Button';
import { searchTheatricalHits, searchNewOTTReleases, checkWatchlistUpdates } from './services/geminiService';
import { LoadingStatus, Movie, Tab, EmailDraft } from './types';
import { RefreshCw, Bell, Eraser } from 'lucide-react';

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<Tab>('hits');
  
  // Data State with Persistence
  const [hitsData, setHitsData] = useState<Movie[]>(() => {
    const saved = localStorage.getItem('hitsData');
    return saved ? JSON.parse(saved) : [];
  });
  const [hitsStatus, setHitsStatus] = useState<LoadingStatus>(LoadingStatus.IDLE);
  const [hitsTimestamp, setHitsTimestamp] = useState<number>(() => {
    return parseInt(localStorage.getItem('hitsTimestamp') || '0', 10);
  });

  const [ottData, setOttData] = useState<Movie[]>(() => {
    const saved = localStorage.getItem('ottData');
    return saved ? JSON.parse(saved) : [];
  });
  const [ottStatus, setOttStatus] = useState<LoadingStatus>(LoadingStatus.IDLE);
  const [ottTimestamp, setOttTimestamp] = useState<number>(() => {
    return parseInt(localStorage.getItem('ottTimestamp') || '0', 10);
  });

  // Watchlist State
  const [watchlist, setWatchlist] = useState<Movie[]>(() => {
    const saved = localStorage.getItem('watchlist');
    return saved ? JSON.parse(saved) : [];
  });
  const [watchlistStatus, setWatchlistStatus] = useState<LoadingStatus>(LoadingStatus.IDLE);
  const [lastWatchlistCheck, setLastWatchlistCheck] = useState<number>(() => {
    return parseInt(localStorage.getItem('lastWatchlistCheck') || '0', 10);
  });

  const [notification, setNotification] = useState<string | null>(null);

  // Email State
  const [showEmail, setShowEmail] = useState(false);
  const [emailDraft, setEmailDraft] = useState<EmailDraft>({ subject: '', body: '' });

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem('hitsData', JSON.stringify(hitsData));
    localStorage.setItem('hitsTimestamp', hitsTimestamp.toString());
  }, [hitsData, hitsTimestamp]);

  useEffect(() => {
    localStorage.setItem('ottData', JSON.stringify(ottData));
    localStorage.setItem('ottTimestamp', ottTimestamp.toString());
  }, [ottData, ottTimestamp]);

  useEffect(() => {
    localStorage.setItem('watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  useEffect(() => {
    localStorage.setItem('lastWatchlistCheck', lastWatchlistCheck.toString());
  }, [lastWatchlistCheck]);

  // Tab Switching & Auto-Fetch Logic
  useEffect(() => {
    const now = Date.now();

    if (currentTab === 'hits') {
      const isStale = now - hitsTimestamp > CACHE_DURATION;
      if ((hitsData.length === 0 || isStale) && hitsStatus === LoadingStatus.IDLE) {
        fetchHits();
      }
    } else if (currentTab === 'ott') {
      const isStale = now - ottTimestamp > CACHE_DURATION;
      if ((ottData.length === 0 || isStale) && ottStatus === LoadingStatus.IDLE) {
        fetchOTT();
      }
    } else if (currentTab === 'watchlist') {
      const shouldCheck = watchlist.length > 0 && (now - lastWatchlistCheck > CACHE_DURATION);
      if (shouldCheck && watchlistStatus !== LoadingStatus.LOADING) {
        checkForUpdates();
      }
    }
  }, [currentTab]);

  const fetchHits = async () => {
    setHitsStatus(LoadingStatus.LOADING);
    try {
      const date = new Date();
      date.setMonth(date.getMonth() - 1);
      const month = date.toLocaleString('default', { month: 'long' });
      const year = date.getFullYear();

      const result = await searchTheatricalHits(month, year);
      setHitsData(result.movies);
      setHitsTimestamp(Date.now());
      setHitsStatus(LoadingStatus.SUCCESS);
    } catch (error) {
      console.error(error);
      setHitsStatus(LoadingStatus.ERROR);
    }
  };

  const fetchOTT = async () => {
    setOttStatus(LoadingStatus.LOADING);
    try {
      const result = await searchNewOTTReleases();
      setOttData(result.movies);
      setOttTimestamp(Date.now());
      setOttStatus(LoadingStatus.SUCCESS);
    } catch (error) {
      console.error(error);
      setOttStatus(LoadingStatus.ERROR);
    }
  };

  const checkForUpdates = async () => {
    if (watchlist.length === 0) return;
    
    setWatchlistStatus(LoadingStatus.LOADING);
    try {
      const updatedList = await checkWatchlistUpdates(watchlist);
      setWatchlist(updatedList);
      setLastWatchlistCheck(Date.now());
      
      const justAvailable = updatedList.filter(m => 
        m.availability.toLowerCase() !== 'theaters' && 
        !m.availability.toLowerCase().includes('not available')
      );
      
      if (justAvailable.length > 0) {
        setNotification(`${justAvailable.length} movies in your watchlist are now streaming!`);
      }
      
      setWatchlistStatus(LoadingStatus.SUCCESS);
    } catch (error) {
      console.error(error);
      setWatchlistStatus(LoadingStatus.ERROR);
    }
  };

  const toggleWatchlist = (movie: Movie) => {
    setWatchlist(prev => {
      const exists = prev.find(m => m.title === movie.title);
      if (exists) {
        return prev.filter(m => m.title !== movie.title);
      } else {
        return [...prev, movie];
      }
    });
  };

  const clearCache = () => {
    localStorage.removeItem('hitsData');
    localStorage.removeItem('hitsTimestamp');
    localStorage.removeItem('ottData');
    localStorage.removeItem('ottTimestamp');
    setHitsData([]);
    setOttData([]);
    setHitsTimestamp(0);
    setOttTimestamp(0);
    window.location.reload();
  };

  // Helper to get current view data
  const getCurrentData = () => {
    switch (currentTab) {
      case 'hits': return { data: hitsData, status: hitsStatus, retry: fetchHits, timestamp: hitsTimestamp };
      case 'ott': return { data: ottData, status: ottStatus, retry: fetchOTT, timestamp: ottTimestamp };
      case 'watchlist': return { data: watchlist, status: watchlistStatus, retry: checkForUpdates, timestamp: lastWatchlistCheck };
    }
  };

  const { data, status, retry, timestamp } = getCurrentData();

  const handleShare = () => {
    if (data.length === 0) {
      setNotification("Nothing to share in this list yet.");
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    let listName = "";
    if (currentTab === 'hits') listName = "Latest Movie Hits";
    if (currentTab === 'ott') listName = "Fresh OTT Releases";
    if (currentTab === 'watchlist') listName = "My Movie Watchlist";

    let body = `Here is the ${listName} list generated by MovieScout:\n\n`;

    data.forEach((m, i) => {
      body += `${i + 1}. ${m.title} (${m.language})\n`;
      if (m.rottenTomatoes && m.rottenTomatoes !== 'N/A') body += `   🍅 RT: ${m.rottenTomatoes}\n`;
      if (m.imdb && m.imdb !== 'N/A') body += `   ⭐ IMDb: ${m.imdb}\n`;
      body += `   📺 Where: ${m.availability}\n`;
      body += `   📝 ${m.summary}\n\n`;
    });

    body += `\nShared via MovieScout`;

    setEmailDraft({
      subject: `MovieScout: ${listName}`,
      body: body
    });
    setShowEmail(true);
  };

  const renderContent = () => {
    const showSpinner = status === LoadingStatus.LOADING && data.length === 0;

    if (showSpinner) {
      return (
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="text-slate-400 text-sm">
            {currentTab === 'watchlist' ? 'Checking availability...' : 'Scouting movies...'}
          </p>
        </div>
      );
    }

    if (status === LoadingStatus.ERROR && data.length === 0) {
      return (
        <div className="text-center p-8 text-slate-400">
          <p>Failed to load movies.</p>
          <Button onClick={retry} className="mt-4">
            Retry
          </Button>
        </div>
      );
    }

    if (data.length === 0 && status !== LoadingStatus.LOADING) {
      return (
        <div className="text-center p-8 text-slate-500">
          {currentTab === 'watchlist' 
            ? "Your watchlist is empty." 
            : "No movies found."}
        </div>
      );
    }

    return (
      <div className="space-y-4 pb-24">
         {/* Timestamp Info */}
        <div className="flex justify-between items-center px-1">
             <span className="text-[10px] text-slate-500 uppercase tracking-wider">
               Updated: {timestamp ? new Date(timestamp).toLocaleDateString() + ' ' + new Date(timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Just now'}
             </span>
             {currentTab === 'watchlist' && (
                <button onClick={retry} className="text-blue-400 text-xs hover:text-blue-300 flex items-center gap-1">
                    <RefreshCw className="w-3 h-3" /> Check Now
                </button>
             )}
        </div>

        {data.map((movie, idx) => (
          <MovieCard 
            key={`${movie.title}-${idx}`} 
            movie={movie} 
            isInWatchlist={watchlist.some(m => m.title === movie.title)}
            onToggleWatchlist={toggleWatchlist}
            isWatchlistView={currentTab === 'watchlist'}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100">
      <Header onShareClick={handleShare} />
      
      {/* Notification Banner */}
      {notification && (
        <div className="bg-blue-600 px-4 py-3 flex justify-between items-center animate-in slide-in-from-top sticky top-16 z-40">
          <div className="flex items-center space-x-2 text-sm font-medium text-white">
            <Bell className="w-4 h-4" />
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-blue-200 hover:text-white">✕</button>
        </div>
      )}

      {/* Email Modal Overlay */}
      {showEmail && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <EmailComposer draft={emailDraft} onClose={() => setShowEmail(false)} />
        </div>
      )}

      <main className="max-w-md mx-auto px-4 pt-6">
        <div className="flex items-center justify-between mb-6">
             <h2 className="text-2xl font-bold">
                {currentTab === 'hits' && "Last Month's Hits"}
                {currentTab === 'ott' && "Fresh on Streaming"}
                {currentTab === 'watchlist' && "Your Watchlist"}
            </h2>
             {/* Refresh / Clear Cache Actions */}
             <div className="flex items-center space-x-2">
                 {(currentTab !== 'watchlist' && data.length > 0) && (
                     <button 
                        onClick={retry}
                        disabled={status === LoadingStatus.LOADING}
                        className="p-2 text-slate-500 hover:text-blue-400 disabled:opacity-50 transition-colors"
                        title="Force Refresh List"
                     >
                         <RefreshCw className={`w-4 h-4 ${status === LoadingStatus.LOADING ? 'animate-spin' : ''}`} />
                     </button>
                 )}
                  {/* Debug/Clean button to clear cache if things get stuck */}
                  <button 
                    onClick={clearCache}
                    className="p-2 text-slate-600 hover:text-red-400 transition-colors"
                    title="Clear All Data & Reset"
                  >
                      <Eraser className="w-4 h-4" />
                  </button>
             </div>
        </div>

        {renderContent()}
      </main>

      <BottomNav 
        currentTab={currentTab} 
        onTabChange={setCurrentTab} 
        watchlistCount={watchlist.length} 
      />
    </div>
  );
};

export default App;