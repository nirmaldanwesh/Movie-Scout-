import React from 'react';
import { Movie } from '../types';
import { Star, Tv, Plus, Check, CheckCircle } from 'lucide-react';

interface MovieCardProps {
  movie: Movie;
  isInWatchlist: boolean;
  onToggleWatchlist: (movie: Movie) => void;
  isWatchlistView?: boolean;
}

export const MovieCard: React.FC<MovieCardProps> = ({ movie, isInWatchlist, onToggleWatchlist, isWatchlistView }) => {
  const isAvailableOnOTT = movie.availability.toLowerCase() !== 'theaters' && !movie.availability.toLowerCase().includes('not available');

  const formattedOTTDate = React.useMemo(() => {
    if (!movie.ottReleaseDate) return null;
    const date = new Date(movie.ottReleaseDate);
    if (isNaN(date.getTime())) return null;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }, [movie.ottReleaseDate]);

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-lg flex flex-col p-3.5 gap-2.5 hover:border-slate-600 transition-colors">
        {/* Header Section: Title, Meta, Action Button */}
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1 min-w-0 space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-white leading-tight">{movie.title}</h3>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-700 text-slate-300 border border-slate-600 tracking-wide uppercase">
                {movie.language}
              </span>
            </div>
            
            {(movie.director || (movie.cast && movie.cast.length > 0)) && (
              <p className="text-[11px] text-slate-400 truncate">
                {movie.director && <span className="mr-1.5"><span className="text-slate-500">Dir:</span> {movie.director}</span>}
                {movie.cast && <span className="truncate"><span className="text-slate-500">Cast:</span> {movie.cast.slice(0, 3).join(', ')}</span>}
              </p>
            )}
          </div>
          
          {!isWatchlistView && (
              <button
              onClick={() => onToggleWatchlist(movie)}
              className={`p-1.5 rounded-full transition-colors flex-shrink-0 border border-transparent ${
                  isInWatchlist 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-white hover:border-slate-500'
              }`}
              >
              {isInWatchlist ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              </button>
          )}
        </div>

        {/* Combined Meta Row: Ratings & Availability */}
        <div className="flex items-center justify-between text-xs border-t border-white/5 pt-2 mt-0.5">
            <div className="flex items-center gap-3">
                {movie.rottenTomatoes && movie.rottenTomatoes !== 'N/A' && (
                    <span className="flex items-center text-red-400 font-medium bg-red-400/10 px-1.5 py-0.5 rounded">
                    🍅 {movie.rottenTomatoes}
                    </span>
                )}
                {movie.imdb && movie.imdb !== 'N/A' && (
                    <span className="flex items-center text-yellow-400 font-medium bg-yellow-400/10 px-1.5 py-0.5 rounded">
                    <Star className="w-3 h-3 mr-1 fill-current" /> {movie.imdb}
                    </span>
                )}
            </div>

            <div className="flex flex-col items-end justify-center">
                <div className={`flex items-center gap-1.5 font-medium ${isAvailableOnOTT ? 'text-green-400' : 'text-blue-400'}`}>
                    <Tv className="w-3.5 h-3.5" />
                    <span className="truncate max-w-[120px] text-right">{movie.availability}</span>
                </div>
                {formattedOTTDate && (
                    <span className="text-[10px] text-slate-500 pr-0.5">
                        {formattedOTTDate}
                    </span>
                )}
            </div>
        </div>

        {/* Summary */}
        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{movie.summary}</p>

        {/* Reddit Vibe */}
        <div className="bg-slate-900/50 rounded p-2 text-[11px] text-slate-400 italic border border-slate-700/50 flex items-start gap-1.5">
          <span className="not-italic font-bold text-orange-500 text-[10px] uppercase tracking-wider mt-[1px]">Reddit</span>
          <span className="leading-tight">"{movie.redditVibe}"</span>
        </div>

        {/* Mark as Watched / Remove Button (Only for Watchlist View) */}
        {isWatchlistView && (
          <button 
              onClick={() => onToggleWatchlist(movie)}
              className="mt-1 w-full flex items-center justify-center gap-2 bg-slate-700 hover:bg-green-600 text-slate-200 hover:text-white py-2 rounded-lg transition-all text-xs font-medium group active:scale-95 border border-slate-600 hover:border-green-500"
          >
              <CheckCircle className="w-3.5 h-3.5 text-slate-400 group-hover:text-white" />
              <span>Mark as Watched</span>
          </button>
        )}
    </div>
  );
};