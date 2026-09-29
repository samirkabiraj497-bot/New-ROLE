import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';

const Home = () => {
  const [query, setQuery] = useState('');
  const [budget, setBudget] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}&budget=${encodeURIComponent(budget)}`);
    }
  };

  return (
    <div className="max-w-3xl mx-auto text-center mt-16 space-y-8">
      <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
        Find the best product for your budget
      </h1>
      <p className="text-xl text-gray-600">
        Compare prices, quality, and real reviews across multiple platforms.
      </p>

      <form onSubmit={handleSearch} className="bg-white p-6 rounded-2xl shadow-xl space-y-6 text-left border border-gray-100">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">What are you looking for?</label>
          <div className="relative">
            <Search className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="e.g. Samsung Galaxy phone..." 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-lg"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">Your maximum budget (optional)</label>
          <div className="relative">
            <span className="absolute left-4 top-3.5 text-gray-500 font-medium w-5 h-5">₹</span>
            <input 
              type="number" 
              placeholder="50000" 
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-lg"
            />
          </div>
        </div>

        <button 
          type="submit" 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-colors text-lg shadow-md shadow-blue-200"
        >
          Compare Products
        </button>
      </form>

      <div className="pt-8 text-left max-w-2xl mx-auto">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 text-center">Popular searches</h3>
        <div className="flex flex-wrap justify-center gap-3">
          {['📱 Smartphones', '💻 Laptops', '🎧 Headphones', '⌚ Smart Watches', '👟 Shoes', '🏠 Home Appliances'].map((tag) => (
            <button 
              key={tag}
              onClick={() => {
                setQuery(tag.split(' ')[1]); 
              }}
              className="px-4 py-2 bg-white border border-gray-200 rounded-full hover:border-blue-500 hover:text-blue-600 transition-colors text-sm font-medium text-gray-600 shadow-sm"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
