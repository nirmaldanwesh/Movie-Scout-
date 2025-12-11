import React from 'react';
import { Movie } from '../types';
import { Star, Tv, Plus, Check, CheckCircle, Trash2 } from 'lucide-react';

interface MovieCardProps {
  movie: Movie;
  isInWatchlist: boolean;
  onToggleWatchlist: (movie: Movie) => void;
  isWatchlistView?: boolean;
}

export const MovieCard: React.FC<MovieCardProps> = ({ movie, isInWatchlist, onToggleWatchlist, isWatchlistView }) => {
  const isAvailableOnOTT = movie.availability.toLowerCase() !== 'theaters' && !movie.availability.toLowerCase().includes('not available');

  return (
    <div className="bg-slate-800 rounded-xl overflow-hidden shadow-lg border border-slate-700 flex flex-col p-4 space-y-3">
      {/* Header Section: Title, Language, Action Button */}
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-lg font-bold text-white leading-tight">{movie.title}</h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-700 text-slate-300 whitespace-nowrap">
              {movie.language}
            </span>
          </div>
          
          {(movie.director || (movie.cast && movie.cast.length > 0)) && (
            <p className="text-xs text-slate-400">
              {movie.director && <span className="mr-2"><span className="text-slate-500">Dir:</span> {movie.director}</span>}
              {movie.cast && <span className="block sm:inline sm:ml-2 truncate max-w-[250px]"><span className="text-slate-500">Cast:</span> {movie.cast.join(', ')}</span>}
            </p>
          )}
        </div>
        
        {/* Toggle Button (Hidden in Watchlist view to avoid redundancy with the big button below, or kept for consistency) */}
        {!isWatchlistView && (
            <button
            onClick={() => onToggleWatchlist(movie)}
            className={`p-2 rounded-full transition-colors flex-shrink-0 ${
                isInWatchlist 
                ? 'bg-blue-600 text-white' 
                : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
            }`}
            >
            {isInWatchlist ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            </button>
        )}
      </div>

      {/* Ratings Row */}
      <div className="flex items-center space-x-3 text-sm">
        {movie.rottenTomatoes && movie.rottenTomatoes !== 'N/A' && (
          <span className="flex items-center text-red-400 font-medium">
            🍅 {movie.rottenTomatoes}
          </span>
        )}
        {movie.imdb && movie.imdb !== 'N/A' && (
          <span className="flex items-center text-yellow-400 font-medium">
            <Star className="w-3 h-3 mr-1 fill-current" /> {movie.imdb}
          </span>
        )}
      </div>

      {/* Summary */}
      <p className="text-sm text-slate-400 line-clamp-2">{movie.summary}</p>

      {/* Reddit Vibe */}
      <div className="bg-slate-900/50 rounded-lg p-2.5 text-xs text-slate-400 italic border border-slate-800">
        <span className="not-italic font-semibold text-orange-500 mr-1">Reddit:</span>
        "{movie.redditVibe}"
      </div>

      {/* Availability Status */}
      <div className={`flex items-center space-x-2 text-sm font-medium ${isAvailableOnOTT ? 'text-green-400' : 'text-blue-400'}`}>
        <Tv className="w-4 h-4" />
        <span>{movie.availability}</span>
      </div>

      {/* Mark as Watched / Remove Button (Only for Watchlist View) */}
      {isWatchlistView && (
        <button 
            onClick={() => onToggleWatchlist(movie)}
            className="mt-2 w-full flex items-center justify-center space-x-2 bg-slate-700 hover:bg-green-600 text-slate-200 hover:text-white py-2.5 rounded-lg transition-all text-sm font-medium group active:scale-95"
        >
            <CheckCircle className="w-4 h-4 text-slate-400 group-hover:text-white" />
            <span>Mark as Watched</span>
        </button>
      )}
    </div>
  );
};