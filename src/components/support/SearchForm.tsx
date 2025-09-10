import React from 'react';
import { Search } from 'lucide-react';
import { colors } from '../../styles/colors';

type SearchFormProps = {
  search: string;
  searching: boolean;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
};

const SearchForm: React.FC<SearchFormProps> = ({
  search,
  searching,
  onSearchChange,
  onSubmit,
}) => {
  return (
    <div className="w-full max-w-md px-2 mb-4">
      <form
        className="relative flex items-center"
        onSubmit={onSubmit}
      >
        <div className="relative flex-1">
          <Search 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
            size={16}
          />
          <input
            type="text"
            value={search}
            onChange={onSearchChange}
            placeholder="지원금정보를 검색해보세요"
            className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-white text-sm outline-none shadow-sm border border-gray-100 focus:ring-2 focus:ring-blue-200 transition-all"
          />
        </div>
        <button
          type="submit"
          className="ml-2 px-4 py-2.5 rounded-lg text-white text-xs font-medium shadow-sm transition-all hover:shadow-md disabled:opacity-50"
          style={{ backgroundColor: colors.navy }}
          disabled={searching}
        >
          검색
        </button>
      </form>
    </div>
  );
};

export default SearchForm;