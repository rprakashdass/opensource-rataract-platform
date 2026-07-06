"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useState, useEffect } from "react";
import { Search } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce"; // Do they have this? Let's check or I'll implement a simple one.

// Using a standard debounce function since we aren't sure if the hook exists
function useLocalDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

interface FilterBarProps {
  placeholder?: string;
  showMonthFilter?: boolean;
  showYearFilter?: boolean;
  showStatusFilter?: boolean;
  statusOptions?: { label: string; value: string }[];
}

export default function FilterBar({
  placeholder = "Search...",
  showMonthFilter = false,
  showYearFilter = false,
  showStatusFilter = false,
  statusOptions = []
}: FilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const debouncedSearch = useLocalDebounce(search, 300);

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      return params.toString();
    },
    [searchParams]
  );

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (debouncedSearch) {
      params.set("search", debouncedSearch);
    } else {
      params.delete("search");
    }
    
    // Only push if changed to avoid loop
    if (params.get("search") !== searchParams.get("search")) {
       router.push(`${pathname}?${params.toString()}`);
    }
  }, [debouncedSearch, pathname, router, searchParams]);

  const handleSelectChange = (key: string, value: string) => {
    router.push(`${pathname}?${createQueryString(key, value)}`);
  };

  const months = [
    { value: "1", label: "January" }, { value: "2", label: "February" },
    { value: "3", label: "March" }, { value: "4", label: "April" },
    { value: "5", label: "May" }, { value: "6", label: "June" },
    { value: "7", label: "July" }, { value: "8", label: "August" },
    { value: "9", label: "September" }, { value: "10", label: "October" },
    { value: "11", label: "November" }, { value: "12", label: "December" },
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => (currentYear - 2 + i).toString());

  return (
    <div className="bg-white/60 backdrop-blur-md p-4 rounded-2xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col sm:flex-row gap-4 items-center transition-all hover:bg-white/80">
      <div className="relative flex-1 w-full group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-11 pr-4 py-2.5 bg-white/50 border border-gray-200/50 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-300 transition-all placeholder:text-gray-400 text-gray-700 font-medium"
        />
      </div>

      <div className="flex gap-3 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
        {showMonthFilter && (
          <select
            value={searchParams.get("month") || ""}
            onChange={(e) => handleSelectChange("month", e.target.value)}
            className="px-4 py-2.5 bg-white/50 border border-gray-200/50 rounded-xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-300 text-gray-700 min-w-[120px] transition-all cursor-pointer hover:bg-white/80"
          >
            <option value="">All Months</option>
            {months.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        )}

        {showYearFilter && (
          <select
            value={searchParams.get("year") || ""}
            onChange={(e) => handleSelectChange("year", e.target.value)}
            className="px-4 py-2.5 bg-white/50 border border-gray-200/50 rounded-xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-300 text-gray-700 min-w-[100px] transition-all cursor-pointer hover:bg-white/80"
          >
            <option value="">All Years</option>
            {years.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        )}

        {showStatusFilter && (
          <select
            value={searchParams.get("status") || ""}
            onChange={(e) => handleSelectChange("status", e.target.value)}
            className="px-4 py-2.5 bg-white/50 border border-gray-200/50 rounded-xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-300 text-gray-700 min-w-[120px] transition-all cursor-pointer hover:bg-white/80"
          >
            <option value="">All Statuses</option>
            {statusOptions.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}
