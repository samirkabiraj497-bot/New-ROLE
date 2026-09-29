import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { searchProducts } from '../services/api';
import { ArrowRight, Tag, Search, ExternalLink, CheckCircle2, AlertCircle, ShoppingCart } from 'lucide-react';

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
    <div className="max-w-5xl mx-auto space-y-6 pb-12 animate-fade-in">
      {/* On-Page Search & Budget Filter Bar */}
      <form onSubmit={handleRefineSearch} className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-3">
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
        <div className="relative w-full md:w-52">
          <span className="absolute left-3.5 top-2.5 text-gray-500 text-sm font-bold">₹</span>
          <input 
            type="number" 
            placeholder="Max budget (e.g. 20000)" 
            value={budgetInput}
            onChange={(e) => setBudgetInput(e.target.value)}
            className="w-full pl-8 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
          />
        </div>
        <button 
          type="submit" 
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-xl transition text-sm flex items-center justify-center gap-2 flex-shrink-0 shadow-xs"
        >
          <Search className="w-4 h-4" />
          <span>Apply Filter</span>
        </button>
      </form>

      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-200 pb-4 gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Results for <span className="text-blue-600">"{query}"</span>
          </h1>
          {budget && (
            <div className="flex items-center gap-2 mt-1">
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-200">
                Budget limit: ₹{Number(budget).toLocaleString()}
              </span>
              <button 
                onClick={() => {
                  setBudgetInput('');
                  navigate(`/search?q=${encodeURIComponent(query)}`);
                }}
                className="text-xs text-gray-500 hover:text-red-500 underline"
              >
                Clear budget
              </button>
            </div>
          )}
        </div>
        <span className="text-xs font-bold px-3 py-1 bg-gray-100 text-gray-700 rounded-full w-fit">
          {results.length} {results.length === 1 ? 'Product' : 'Products'} found
        </span>
      </div>

      {loading ? (
        <div className="flex flex-col justify-center items-center h-64 space-y-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-500 font-medium">Scanning prices across Amazon, Flipkart, Croma, Reliance & Tata CLiQ...</p>
        </div>
      ) : results.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-12 text-center">
          <p className="text-xl font-bold text-gray-700 mb-2">No matching products found within your search</p>
          <p className="text-sm text-gray-500 mb-6">Try raising your budget limit or search for keywords like "phone", "laptop", "watch", or "shoes"</p>
          <Link 
            to="/" 
            className="inline-block bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition"
          >
            Back to Home
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {results.map((product) => {
            const isUnderBudget = product.in_budget !== false;
            return (
              <div 
                key={product.id} 
                className="bg-white border border-gray-200 rounded-2xl p-5 md:p-6 shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-5"
              >
                {/* Product Thumbnail & Details */}
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  {product.image ? (
                    <div className="w-20 h-20 md:w-24 md:h-24 flex-shrink-0 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 flex items-center justify-center p-2">
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="max-h-full max-w-full object-contain" 
                      />
                    </div>
                  ) : (
                    <div className="w-20 h-20 md:w-24 md:h-24 flex-shrink-0 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                      <Tag className="w-8 h-8" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{product.brand}</span>
                      <span className="text-[11px] font-semibold bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md">
                        {product.category}
                      </span>
                      {budget && (
                        isUnderBudget ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-md">
                            <CheckCircle2 className="w-3 h-3 text-green-600" /> Fits Budget
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                            <AlertCircle className="w-3 h-3 text-amber-600" /> ₹{product.budget_diff?.toLocaleString()} above budget
                          </span>
                        )
                      )}
                    </div>

                    <h2 className="text-lg md:text-xl font-extrabold text-gray-900 truncate">
                      {product.name}
                    </h2>
                    <p className="text-xs md:text-sm text-gray-500 mt-1 line-clamp-2">
                      {product.description}
                    </p>

                    {/* Stores compared badges */}
                    <div className="mt-3 flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mr-1">
                        Compared on {product.stores_count || 5} apps:
                      </span>
                      {(product.stores || ['Amazon', 'Flipkart', 'Croma', 'Reliance Digital', 'Tata CLiQ']).map((st) => (
                        <span key={st} className="text-[11px] font-semibold bg-blue-50/70 text-blue-800 border border-blue-100 px-2 py-0.5 rounded-md">
                          {st}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Price Tag & Direct Buy / Compare CTAs */}
                <div className="flex md:flex-col items-center md:items-end justify-between border-t md:border-t-0 pt-4 md:pt-0 gap-3 flex-shrink-0">
                  <div className="text-left md:text-right">
                    <span className="text-xs text-gray-500 block font-medium">Best Deal starting at</span>
                    <span className="text-2xl md:text-3xl font-black text-gray-900 block">
                      ₹{(product.lowest_price || 24999).toLocaleString()}
                    </span>
                    {product.max_savings > 0 && (
                      <span className="text-[11px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-md border border-green-200">
                        Save ₹{product.max_savings.toLocaleString()} vs other stores
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Direct Buy Link */}
                    {product.buy_url && (
                      <a 
                        href={product.buy_url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold px-4 py-2 rounded-xl text-xs md:text-sm shadow-xs transition"
                        title={`Buy lowest price on ${product.best_store || 'Amazon'}`}
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>Buy on {product.best_store || 'Amazon'}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}

                    {/* View Multi-Store Comparison */}
                    <Link 
                      to={`/product/${product.id}/compare${budget ? `?budget=${budget}` : ''}`}
                      className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-xs md:text-sm shadow-xs transition"
                    >
                      <span>Compare All</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SearchResults;
