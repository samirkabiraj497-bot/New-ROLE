import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { searchProducts } from '../services/api';
import { ArrowRight, Tag, Search, Filter } from 'lucide-react';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  const budget = searchParams.get('budget');

  const [searchInput, setSearchInput] = useState(query);
  const [budgetInput, setBudgetInput] = useState(budget || '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSearchInput(query);
    setBudgetInput(budget || '');
    const fetchResults = async () => {
      setLoading(true);
      try {
        const res = await searchProducts(query, budget);
        setResults(res.data?.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (query) fetchResults();
  }, [query, budget]);

  const handleRefineSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchInput.trim())}${budgetInput ? `&budget=${encodeURIComponent(budgetInput)}` : ''}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-fade-in">
      {/* On-Page Search & Filter Bar */}
      <form onSubmit={handleRefineSearch} className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 text-gray-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search products (e.g. iPhone, Watch, Shoes)..." 
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
        <div className="relative w-full md:w-44">
          <span className="absolute left-3.5 top-2.5 text-gray-400 text-sm font-bold">₹</span>
          <input 
            type="number" 
            placeholder="Budget limit" 
            value={budgetInput}
            onChange={(e) => setBudgetInput(e.target.value)}
            className="w-full pl-8 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
        <button 
          type="submit" 
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl transition text-sm flex items-center justify-center gap-1.5 flex-shrink-0"
        >
          <Search className="w-4 h-4" />
          <span>Update</span>
        </button>
      </form>

      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-200 pb-4 gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Results for <span className="text-blue-600">"{query}"</span>
          </h1>
          {budget && (
            <p className="text-gray-500 text-sm mt-0.5">
              Filtered within budget of <span className="font-bold text-gray-800">₹{Number(budget).toLocaleString()}</span>
            </p>
          )}
        </div>
        <span className="text-xs font-semibold px-3 py-1 bg-gray-100 text-gray-600 rounded-full w-fit">
          {results.length} {results.length === 1 ? 'Product found' : 'Products found'}
        </span>
      </div>

      {loading ? (
        <div className="flex flex-col justify-center items-center h-64 space-y-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-500 font-medium">Scanning multi-store databases...</p>
        </div>
      ) : results.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-12 text-center">
          <p className="text-xl font-bold text-gray-700 mb-2">No matching products found</p>
          <p className="text-sm text-gray-500 mb-6">Try searching for keywords like "iPhone", "Samsung", "Headphones", "Watch", or "Shoes"</p>
          <Link 
            to="/" 
            className="inline-block bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition"
          >
            Back to Home
          </Link>
        </div>
      ) : (
        <div className="grid gap-3.5">
          {results.map((product) => (
            <Link 
              key={product.id} 
              to={`/product/${product.id}/compare${budget ? `?budget=${budget}` : ''}`}
              className="block bg-white border border-gray-200 rounded-2xl p-4 md:p-5 hover:shadow-md hover:border-blue-300 transition-all group"
            >
              <div className="flex items-center gap-4 md:gap-5">
                {product.image ? (
                  <div className="w-18 h-18 md:w-20 md:h-20 flex-shrink-0 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 flex items-center justify-center p-2">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform" 
                    />
                  </div>
                ) : (
                  <div className="w-18 h-18 md:w-20 md:h-20 flex-shrink-0 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                    <Tag className="w-7 h-7" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{product.brand}</span>
                    <span className="text-[11px] font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">
                      {product.category}
                    </span>
                  </div>
                  <h2 className="text-base md:text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                    {product.name}
                  </h2>
                  <p className="text-xs md:text-sm text-gray-500 mt-1 line-clamp-1">
                    {product.description}
                  </p>
                </div>

                <div className="flex-shrink-0 flex items-center gap-1.5 bg-blue-50 text-blue-700 font-semibold px-3.5 py-2 rounded-xl text-xs md:text-sm border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <span>Compare</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchResults;
