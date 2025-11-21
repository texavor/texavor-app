import React from "react";
import { History, ArrowUpRight } from "lucide-react";

interface RecentSearchesProps {
  searches: { id: string; keywords: string[]; created_at: string }[];
  onSelect: (topic: string) => void;
}

export const RecentSearches: React.FC<RecentSearchesProps> = ({
  searches,
  onSelect,
}) => {
  const hasSearches = searches && searches.length > 0;

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 h-full flex flex-col">
      <h3 className="font-poppins text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4 shrink-0">
        <History size={20} className="text-green-700" />
        <span className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
          Recent Searches
        </span>
      </h3>

      <div className="space-y-1 overflow-y-auto max-h-[120px] pr-2 custom-scrollbar flex-1">
        {!hasSearches ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4 text-gray-400">
            <History size={24} className="mb-2 opacity-20" />
            <p className="text-xs font-medium">No recent searches</p>
          </div>
        ) : (
          searches.map((search) => (
            <button
              key={search.id}
              onClick={() => onSelect(search.keywords[0])}
              className="w-full text-left group p-2.5 rounded-lg hover:bg-green-50/50 transition-all duration-200 border border-transparent hover:border-green-100 flex items-center justify-between"
            >
              <span className="text-sm font-medium text-gray-600 group-hover:text-green-800 truncate transition-colors">
                {search.keywords[0]}
              </span>
              <ArrowUpRight
                size={14}
                className="text-green-400 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200"
              />
            </button>
          ))
        )}
      </div>
    </div>
  );
};
