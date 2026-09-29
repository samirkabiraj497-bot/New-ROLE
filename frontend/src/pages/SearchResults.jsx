import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { searchProducts } from '../services/api';

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
        setResults(res.data.data);
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
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 border-b pb-4">
        Search results for "{query}"
        {budget && <span className="text-gray-500 text-lg ml-2">(Budget: ₹{budget})</span>}
      </h1>

      {results.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-12 text-center">
          <p className="text-xl text-gray-600 mb-4">No products found.</p>
          <p className="text-sm text-gray-500 mb-2">Try:</p>
          <ul className="text-sm text-gray-500 list-disc list-inside inline-block text-left">
            <li>A different product name</li>
            <li>A broader search (e.g. "Smartphone")</li>
          </ul>
        </div>
      ) : (
        <div className="grid gap-4">
          {results.map((product) => (
            <Link 
              key={product.id} 
              to={`/product/${product.id}/compare${budget ? `?budget=${budget}` : ''}`}
              className="block bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">{product.brand}</p>
                  <h2 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{product.name}</h2>
                  <p className="text-sm text-gray-500 mt-2">{product.category}</p>
                </div>
                <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-full font-medium text-sm border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  View Comparison →
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
