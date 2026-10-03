import { Search } from 'lucide-react';

export default function SearchBar({ value, onChange, placeholder = 'Search employees by name, ID, email...' }) {
  return (
    <div className="search-box">
      <Search size={17} />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label="Search employees"
      />
    </div>
  );
}
