import React from 'react';
import { SearchResult } from '../types';
import { ExternalLink } from 'lucide-react';

interface ResultsViewProps {
  data: SearchResult;
}

export const ResultsView: React.FC<ResultsViewProps> = ({ data }) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {data.groundingChunks.length > 0 && (
        <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Sources & References
          </h3>
          <div className="flex flex-wrap gap-2">
            {data.groundingChunks.map((chunk, idx) => {
              if (!chunk.web?.uri) return null;
              return (
                <a
                  key={idx}
                  href={chunk.web.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 text-blue-400 text-xs px-3 py-1.5 rounded-full transition-colors border border-slate-700"
                >
                  <span className="truncate max-w-[150px]">{chunk.web.title || 'Source'}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};