import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { searchProducts } from '../services/api';
import { ArrowRight, Tag } from 'lucide-react';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const budget = searchParams.get('budget');

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const res = await searchProducts(query);
        setResults(res.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (query) fetchResults();
  }, [query]);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 space-y-3">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="text-gray-500 font-medium">Searching products...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">
          Search results for <span className="text-blue-600">"{query}"</span>
        </h1>
        {budget && (
          <p className="text-gray-500 text-sm mt-1">
            Filtered with max budget: <span className="font-semibold text-gray-800">₹{Number(budget).toLocaleString()}</span>
          </p>
        )}
      </div>

      {results.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-12 text-center">
          <p className="text-xl font-bold text-gray-700 mb-2">No products found matching "{query}"</p>
          <p className="text-sm text-gray-500 mb-6">Try searching for keywords like "iPhone", "Samsung", "Headphones", or "Laptop"</p>
          <Link 
            to="/" 
            className="inline-block bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition"
          >
            Back to Search
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {results.map((product) => (
            <Link 
              key={product.id} 
              to={`/product/${product.id}/compare${budget ? `?budget=${budget}` : ''}`}
              className="block bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md hover:border-blue-300 transition-all group"
            >
              <div className="flex items-center gap-5">
                {product.image ? (
                  <div className="w-20 h-20 flex-shrink-0 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 flex items-center justify-center p-1.5">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform" 
                    />
                  </div>
                ) : (
                  <div className="w-20 h-20 flex-shrink-0 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                    <Tag className="w-8 h-8" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{product.brand}</p>
                  <h2 className="text-lg md:text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                    {product.name}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                    {product.description || product.category}
                  </p>
                </div>

                <div className="flex-shrink-0 flex items-center gap-2 bg-blue-50 text-blue-700 font-semibold px-4 py-2 rounded-xl text-sm border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <span>Compare</span>
                  <ArrowRight className="w-4 h-4" />
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
