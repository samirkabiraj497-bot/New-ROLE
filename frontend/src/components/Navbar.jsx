import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag } from 'lucide-react';

const Navbar = () => {
  const [navQuery, setNavQuery] = useState('');
  const navigate = useNavigate();

  const handleNavSearch = (e) => {
    e.preventDefault();
    if (navQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(navQuery.trim())}`);
      setNavQuery('');
    }
  };

  return (
    <nav className="bg-white shadow-xs border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="text-xl font-black text-blue-600 flex items-center gap-2 flex-shrink-0">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-lg shadow-sm">
            C
          </div>
          <span className="tracking-tight text-gray-900">Compare<span className="text-blue-600">It</span></span>
        </Link>
        
        {/* Working Search in Navbar */}
        <form onSubmit={handleNavSearch} className="flex-1 max-w-xl mx-2 md:mx-6">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-2.5 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search products, brands, or categories (e.g. iPhone, Laptop, Shoes)..." 
              value={navQuery}
              onChange={(e) => setNavQuery(e.target.value)}
              className="w-full pl-10 pr-20 py-2 text-sm bg-gray-50 border border-gray-200 rounded-full focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
            {navQuery.trim() && (
              <button 
                type="submit" 
                className="absolute right-1.5 top-1.5 px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full hover:bg-blue-700 transition"
              >
                Search
              </button>
            )}
          </div>
        </form>

        <div className="flex items-center gap-3 flex-shrink-0">
          <Link to="/login" className="text-sm text-gray-600 hover:text-blue-600 font-semibold px-2 py-1">
            Log in
          </Link>
          <Link to="/register" className="bg-blue-600 text-white text-sm px-4 py-2 rounded-full font-semibold hover:bg-blue-700 transition shadow-xs">
            Sign up
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
