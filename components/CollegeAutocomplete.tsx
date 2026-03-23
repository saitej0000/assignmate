import React, { useState, useEffect, useRef, ReactNode } from 'react';
import { collegeService, College } from '../services/collegeService';
import { Search, MapPin, X, AlertCircle, Loader2 } from 'lucide-react';

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  icon?: ReactNode;
}

export const CollegeAutocomplete: React.FC<Props> = ({ value, onChange, placeholder = "Search Colleges...", className, inputClassName, icon }) => {
  const [query, setQuery] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<College[]>([]);
  const [allColleges, setAllColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    const loadColleges = async () => {
      setLoading(true);
      const data = await collegeService.getAll();
      setAllColleges(data);
      setLoading(false);
    };
    loadColleges();
  }, []);

  useEffect(() => {
    if (query.trim() === '') {
      setResults([]);
      return;
    }
    const filtered = allColleges.filter(c =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      (c.university && c.university.toLowerCase().includes(query.toLowerCase())) ||
      (c.district && c.district.toLowerCase().includes(query.toLowerCase())) ||
      c.state.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 50);

    if (filtered.length === 0 && query.length >= 3) {
      // Use isolated fallback logic if enabled on server
      // We debounce this slightly by relying on the user stopping typing or just fire it
      // For safety/performance, we only trigger if no local results
      collegeService.searchFallback(query).then(fallbackResults => {
        // If we still have the same query (or still no local results), show these
        // We need to be careful about race conditions, but for a fallback this is acceptable
        if (fallbackResults.length > 0) {
          setResults(fallbackResults);
        } else {
          setResults([]);
        }
      }).catch(() => setResults([]));
    } else {
      setResults(filtered);
    }
  }, [query, allColleges]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  const handleSelect = (name: string) => {
    onChange(name);
    setQuery(name);
    setIsOpen(false);
  };

  const defaultInputClass = "w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 pl-9 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 text-slate-800 transition-all placeholder-slate-400 text-sm font-medium";

  return (
    <div ref={wrapperRef} className={`relative group ${className}`}>
      <div className="relative">
        {icon ? icon : (
          <Search className={`absolute left-3 top-3 ${inputClassName ? 'text-slate-400 group-focus-within:text-orange-500' : 'text-slate-400'} pointer-events-none transition-colors`} size={16} />
        )}

        <input
          type="text"
          className={inputClassName || defaultInputClass}
          placeholder={placeholder}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setIsOpen(true); onChange(e.target.value); }}
          onFocus={() => setIsOpen(true)}
        />

        {loading && (
          <div className="absolute right-10 top-3.5">
            <Loader2 size={14} className="animate-spin text-slate-400" />
          </div>
        )}

        {query && (
          <button onClick={() => { onChange(''); setQuery(''); }} className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600">
            <X size={14} />
          </button>
        )}
      </div>

      {isOpen && query.trim() !== '' && (
        <div className="absolute z-[100] w-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-2xl shadow-orange-100 max-h-60 overflow-y-auto no-scrollbar">
          {results.length > 0 ? (
            results.map((college, i) => (
              <button
                key={i}
                onClick={() => handleSelect(college.name)}
                className="w-full text-left px-4 py-3 hover:bg-orange-50 transition-colors border-b border-slate-100 last:border-0 group flex items-start gap-2"
              >
                <div className="mt-0.5 min-w-[14px]"><MapPin size={14} className="text-slate-300 group-hover:text-orange-500 transition-colors" /></div>
                <div>
                  <p className="text-sm font-bold text-slate-700 group-hover:text-orange-800 line-clamp-1">{college.name}</p>
                  <p className="text-[10px] text-slate-400 font-medium">
                    {[college.university, college.district, college.state]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                </div>
              </button>
            ))
          ) : (
            <div className="p-4 text-center text-slate-500">
              <AlertCircle size={20} className="mx-auto mb-2 text-slate-300" />
              <p className="text-xs font-medium">No colleges found.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};