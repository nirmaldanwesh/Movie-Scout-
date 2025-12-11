import React from 'react';
import { Film, Mail } from 'lucide-react';

interface HeaderProps {
  onShareClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onShareClick }) => {
  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-slate-900/80 border-b border-slate-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-lg">
            <Film className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            MovieScout
          </h1>
        </div>
        <button 
          onClick={onShareClick}
          className="flex items-center space-x-2 text-sm text-slate-400 hover:text-white transition-colors bg-slate-800/50 hover:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700/50 hover:border-slate-600"
        >
          <Mail className="w-4 h-4" />
          <span className="hidden sm:inline">Review & Share</span>
        </button>
      </div>
    </header>
  );
};