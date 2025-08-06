import { FcSearch } from "react-icons/fc";
import { BiSearch } from "react-icons/bi";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useMemo, useEffect } from "react";
import { useDebounce } from "../../hooks/useDebounce";

export default function GlobalSearch() {
  const navigate = useNavigate();
  const { search: urlSearch } = useLocation();
  const initial = useMemo(() => new URLSearchParams(urlSearch).get("q") || "", [urlSearch]);
  const [query, setQuery] = useState(initial);
  const debounced = useDebounce(query, 300);

  useEffect(() => {
    if (debounced.trim()) {
      navigate(`/search?q=${encodeURIComponent(debounced)}`);
    }
  }, [debounced, navigate]);

  return (
    <>
      {/* Desktop */}
      <div className="hidden md:flex items-center bg-black border border-gray-700 rounded-md px-4 py-2 w-72">
        <FcSearch className="text-white h-5 w-5 mr-2" />
        <input
          type="text"
          placeholder="Search deals, offers..."
          className="bg-transparent text-white text-sm outline-none w-full placeholder-gray-500"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      {/* Mobile */}
      <div className="md:hidden flex items-center w-full px-4">
        <div className="flex items-center bg-black border border-gray-700 rounded-md px-2 py-2 w-full">
          <BiSearch className="text-yellow-700 h-5 w-5 mr-2" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent text-white text-sm outline-none w-full placeholder-gray-500"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>
    </>
  );
}