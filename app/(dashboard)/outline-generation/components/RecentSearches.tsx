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
    <div className="bg-white rounded-xl p-4 space-y-2">
      <h3 className="font-poppins text-black font-medium flex items-center gap-2">
        <History size={18} />
        Recent Searches
      </h3>

      {hasSearches ? (
        <ul className="space-y-1 pt-1 overflow-y-auto max-h-[110px] no-scrollbar">
          {searches.map((search) => (
            <li key={search.id}>
              <button
                onClick={() => onSelect(search.keywords[0])}
                className="text-sm font-inter text-gray-600 hover:text-black text-left w-full cursor-pointer truncate max-w-fit"
              >
                {search.keywords[0]}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-400 pt-2">No recent searches.</p>
      )}
    </div>
  );
};
