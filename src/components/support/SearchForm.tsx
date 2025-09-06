import React from 'react';

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
    <form
      className="flex items-center gap-2 mb-4 w-full max-w-md px-2"
      onSubmit={onSubmit}
    >
      <i className="fas fa-search text-gray-400"></i>
      <input
        type="text"
        value={search}
        onChange={onSearchChange}
        placeholder="지원금정보를 검색해보세요"
        className="flex-1 px-3 py-2 rounded bg-gray-100 text-sm outline-none"
      />
      <button
        type="submit"
        className="px-2 py-2 rounded bg-navy text-white text-xs font-semibold"
        disabled={searching}
      >
        검색
      </button>
    </form>
  );
};

export default SearchForm;