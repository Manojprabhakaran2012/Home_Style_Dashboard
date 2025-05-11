import { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { Product } from "@shared/schema";
import { Link } from "wouter";

export default function SearchBox() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const [, navigate] = useLocation();

  const handleSearch = async () => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const res = await apiRequest("GET", `/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data);
      setShowResults(true);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/products?search=${encodeURIComponent(query)}`);
      setShowResults(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        handleSearch();
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={searchRef}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Input
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Search for products..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.trim() && setShowResults(true)}
          />
          <Button
            type="submit"
            variant="ghost"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-neutral-700"
          >
            <Search className="h-5 w-5" />
          </Button>
        </div>
      </form>

      {showResults && results.length > 0 && (
        <Card className="absolute mt-1 w-full bg-white shadow-lg z-10 max-h-96 overflow-y-auto">
          <ul className="py-2">
            {results.map((product) => (
              <li key={product.id} className="hover:bg-gray-100">
                <Link
                  href={`/products/${product.id}`}
                  className="block px-4 py-2"
                  onClick={() => setShowResults(false)}
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-200 rounded mr-3 overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-gray-500">
                        ₹{product.price.toLocaleString("en-IN")}
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
