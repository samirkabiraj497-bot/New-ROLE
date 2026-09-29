import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Sparkles, TrendingUp } from 'lucide-react';

const Home = () => {
  const [query, setQuery] = useState('');
  const [budget, setBudget] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}${budget ? `&budget=${encodeURIComponent(budget)}` : ''}`);
    }
  };

  const handleTagClick = (searchTerm) => {
    navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
  };

  const popularCategories = [
    { label: '📱 Smartphones', query: 'Smartphones' },
    { label: '💻 Laptops', query: 'Laptops' },
    { label: '🎧 Headphones', query: 'Headphones' },
    { label: '⌚ Smart Watches', query: 'Smart Watches' },
    { label: '👟 Shoes', query: 'Shoes' },
    { label: '🏠 Home Appliances', query: 'Home Appliances' }
  ];

  const trendingItems = [
    'Apple iPhone 15',
    'Sony PS5 Slim',
    'AirPods Pro 2',
    'Galaxy Watch 6',
    'MacBook Air M3',
    'Nike Air Max'
  ];

  return (
    <div className="max-w-3xl mx-auto text-center mt-12 space-y-8">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" /> Smart Multi-Platform Price Intelligence
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-tight">
          Find the best price across Amazon, Flipkart & Reliance
        </h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
          Compare prices, verified ratings, sentiment pros & cons, and get AI recommendations for your budget.
        </p>
      </div>

      <form onSubmit={handleSearch} className="bg-white p-6 md:p-8 rounded-3xl shadow-xl shadow-gray-100 border border-gray-200/80 space-y-5 text-left">
        <div className="space-y-2">
          <label className="block text-sm font-bold text-gray-700">What are you looking for?</label>
          <div className="relative">
            <Search className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="e.g. iPhone 15, Sony headphones, Laptop, Shoes..." 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-base md:text-lg"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-bold text-gray-700">Your maximum budget (optional)</label>
          <div className="relative">
            <span className="absolute left-4 top-3.5 text-gray-500 font-bold text-lg">₹</span>
            <input 
              type="number" 
              placeholder="e.g. 50000" 
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-base md:text-lg"
            />
          </div>
        </div>

        <button 
          type="submit" 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition shadow-lg shadow-blue-500/20 text-lg flex items-center justify-center gap-2"
        >
          <Search className="w-5 h-5" />
          <span>Compare Prices & Offers</span>
        </button>
      </form>

      {/* Popular Categories */}
      <div className="pt-4 text-center max-w-2xl mx-auto space-y-3">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
          Browse by category
        </h3>
        <div className="flex flex-wrap justify-center gap-2">
          {popularCategories.map((cat) => (
            <button 
              key={cat.query}
              type="button"
              onClick={() => handleTagClick(cat.query)}
              className="px-3.5 py-2 bg-white border border-gray-200 hover:border-blue-500 hover:bg-blue-50/50 hover:text-blue-700 rounded-full transition text-sm font-medium text-gray-700 shadow-2xs"
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Trending Items */}
      <div className="text-center max-w-2xl mx-auto space-y-2 pt-2">
        <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
          <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
          <span>Trending searches</span>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {trendingItems.map((item) => (
            <button 
              key={item}
              type="button"
              onClick={() => handleTagClick(item)}
              className="text-xs font-semibold px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition"
            >
              {item}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
