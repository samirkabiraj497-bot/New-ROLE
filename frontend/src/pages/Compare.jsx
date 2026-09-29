import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { getComparison, getQualityAnalysis, getRecommendations } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ExternalLink, ArrowLeft, ShieldCheck, ThumbsUp, AlertTriangle, ShoppingCart, CheckCircle2, Store } from 'lucide-react';

const Compare = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const budget = searchParams.get('budget');
  
  const [comparison, setComparison] = useState(null);
  const [quality, setQuality] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [compRes, qualRes, recRes] = await Promise.all([
          getComparison(id),
          getQualityAnalysis(id),
          getRecommendations({ product_id: id, budget: budget ? Number(budget) : undefined })
        ]);
        
        setComparison(compRes.data.data);
        setQuality(qualRes.data.data);
        setRecommendation(recRes.data.data);
      } catch (err) {
        setError('We couldn\'t retrieve the comparison right now. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, budget]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600 font-medium">Comparing prices across Amazon, Flipkart, Croma, Reliance Digital & Tata CLiQ...</p>
      </div>
    );
  }

  if (error || !comparison) {
    return (
      <div className="text-center py-20 text-red-500 bg-red-50 rounded-2xl max-w-2xl mx-auto border border-red-100 p-8">
        <h2 className="text-2xl font-bold mb-2">Comparison not available</h2>
        <p className="mb-6 text-gray-600">{error || 'Product not found.'}</p>
        <Link to="/" className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition">
          <ArrowLeft className="w-4 h-4" /> Back to Search
        </Link>
      </div>
    );
  }

  const chartData = comparison.listings.map(l => ({
    name: l.platform,
    price: l.final_price,
    fill: l.platform === recommendation?.recommended_listing?.platform ? '#2563eb' : '#94a3b8'
  }));

  const lowestPriceListing = comparison.listings && comparison.listings.length > 0 
    ? [...comparison.listings].sort((a, b) => a.final_price - b.final_price)[0]
    : null;

  const highestPriceListing = comparison.listings && comparison.listings.length > 0 
    ? [...comparison.listings].sort((a, b) => b.final_price - a.final_price)[0]
    : null;

  const maxSaving = (highestPriceListing && lowestPriceListing) 
    ? highestPriceListing.final_price - lowestPriceListing.final_price 
    : 0;

  // Platform specific button styling
  const getPlatformStyle = (name) => {
    const n = (name || '').toLowerCase();
    if (n.includes('amazon')) return 'bg-amber-500 hover:bg-amber-600 text-white';
    if (n.includes('flipkart')) return 'bg-blue-600 hover:bg-blue-700 text-white';
    if (n.includes('croma')) return 'bg-emerald-600 hover:bg-emerald-700 text-white';
    if (n.includes('reliance')) return 'bg-red-600 hover:bg-red-700 text-white';
    if (n.includes('tata')) return 'bg-purple-600 hover:bg-purple-700 text-white';
    return 'bg-gray-800 hover:bg-gray-900 text-white';
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16 animate-fade-in">
      <div className="flex items-center justify-between">
        <Link to={`/search?q=${encodeURIComponent(comparison.name.split(' ')[0] || '')}${budget ? `&budget=${budget}` : ''}`} className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-blue-600 transition">
          <ArrowLeft className="w-4 h-4" /> Back to Search Results
        </Link>
        <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          {comparison.listings.length} Apps Compared
        </span>
      </div>

      {/* Product Hero Header */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 shadow-xs">
        {comparison.image && (
          <div className="w-32 h-32 md:w-44 md:h-44 flex-shrink-0 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 flex items-center justify-center p-3">
            <img 
              src={comparison.image} 
              alt={comparison.name} 
              className="max-h-full max-w-full object-contain hover:scale-105 transition-transform" 
            />
          </div>
        )}
        <div className="flex-1 text-center md:text-left space-y-2.5">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            {comparison.brand && (
              <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-full uppercase tracking-wider">
                {comparison.brand}
              </span>
            )}
            {budget && (
              <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold rounded-full">
                Your Budget: ₹{Number(budget).toLocaleString()}
              </span>
            )}
            {maxSaving > 0 && (
              <span className="px-3 py-1 bg-green-50 text-green-700 border border-green-200 text-xs font-bold rounded-full">
                Save up to ₹{maxSaving.toLocaleString()}
              </span>
            )}
          </div>

          <h1 className="text-2xl md:text-4xl font-black text-gray-900 leading-tight">
            {comparison.name}
          </h1>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-1 text-xs text-gray-500">
            <span className="font-semibold text-gray-700">Compared across:</span>
            {comparison.listings.map(l => (
              <span key={l.platform} className="bg-gray-100 px-2 py-0.5 rounded font-medium text-gray-600">
                {l.platform}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* AI / Smart Recommendation Card */}
      {recommendation?.recommended_listing && (
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 border-2 border-blue-300 rounded-3xl p-6 md:p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-extrabold text-blue-950">Top Recommended Deal for You</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6 items-center">
            <div>
              <div className="flex items-baseline gap-3">
                <p className="text-3xl md:text-5xl font-black text-blue-700">
                  ₹{recommendation.recommended_listing.final_price.toLocaleString()}
                </p>
                <span className="text-sm font-bold px-3 py-1 bg-blue-600 text-white rounded-full">
                  on {recommendation.recommended_listing.platform}
                </span>
              </div>

              <div className="mt-4 space-y-2 text-sm text-gray-700 font-medium">
                <p className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span>{recommendation.explanation.budget_match}</span>
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span>{recommendation.explanation.rating_note}</span>
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span>{recommendation.explanation.review_note}</span>
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span>{recommendation.explanation.price_note}</span>
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-blue-200 shadow-xs space-y-4">
              <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Expert Buying Advice:
              </h3>
              <p className="text-sm text-amber-900 bg-amber-50 p-3 rounded-xl border border-amber-200">
                {recommendation.explanation.warning}
              </p>

              {/* Big Direct Buy Button */}
              {recommendation.recommended_listing.url && (
                <a 
                  href={recommendation.recommended_listing.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-extrabold py-3.5 px-6 rounded-xl transition text-base shadow-md shadow-amber-500/20"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>BUY NOW ON {recommendation.recommended_listing.platform.toUpperCase()}</span>
                  <ExternalLink className="w-4 h-4 ml-1" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Multi-App Price Comparison Table */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-gray-200 pb-3">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Store className="w-6 h-6 text-blue-600" />
            <span>Multi-App Store Comparison ({comparison.listings.length} Stores)</span>
          </h2>
          <span className="text-xs text-gray-500 font-medium hidden sm:inline">
            Direct store checkout links included
          </span>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 overflow-x-auto bg-white rounded-2xl border border-gray-200 shadow-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Store App</th>
                  <th className="py-3 px-4">Base Price</th>
                  <th className="py-3 px-4">Shipping</th>
                  <th className="py-3 px-4">Net Price</th>
                  <th className="py-3 px-4 text-center">Buy Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {comparison.listings.map((l, idx) => {
                  const isBest = l.platform === recommendation?.recommended_listing?.platform;
                  const diffFromBest = l.final_price - (lowestPriceListing ? lowestPriceListing.final_price : l.final_price);

                  return (
                    <tr key={idx} className={`hover:bg-gray-50/80 transition-colors ${isBest ? 'bg-blue-50/40' : ''}`}>
                      <td className="py-4 px-4 font-bold text-gray-900">
                        <div className="flex items-center gap-2">
                          <span>{l.platform}</span>
                          {isBest && (
                            <span className="text-[10px] font-black bg-green-100 text-green-800 border border-green-200 px-2 py-0.5 rounded-full">
                              LOWEST
                            </span>
                          )}
                        </div>
                        {diffFromBest > 0 && (
                          <span className="text-[11px] text-gray-400 font-normal block">
                            +₹{diffFromBest.toLocaleString()} vs lowest
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-gray-600 text-sm">₹{l.price.toLocaleString()}</td>
                      <td className="py-4 px-4 text-sm font-medium text-gray-600">
                        {l.shipping > 0 ? `₹${l.shipping}` : <span className="text-green-600 font-bold">Free</span>}
                      </td>
                      <td className="py-4 px-4 font-black text-gray-900 text-base">
                        ₹{l.final_price.toLocaleString()}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <a 
                          href={l.url || `https://www.google.com/search?q=${encodeURIComponent(comparison.name + ' ' + l.platform)}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className={`inline-flex items-center justify-center gap-1.5 font-bold text-xs px-4 py-2 rounded-xl transition shadow-2xs ${getPlatformStyle(l.platform)}`}
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span>Buy on {l.platform}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Price Graph */}
          <div className="h-72 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Price Visualizer</h3>
              <p className="text-xs text-gray-400">Comparing total net prices across all platforms</p>
            </div>
            <div className="flex-1 my-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={95} tick={{ fontSize: 11, fill: '#4b5563', fontWeight: 600 }} />
                  <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
                  <Bar dataKey="price" radius={[0, 6, 6, 0]} barSize={22}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="text-center pt-2 border-t border-gray-100 text-xs text-gray-500">
              Blue bar indicates recommended lowest offer
            </div>
          </div>
        </div>
      </section>

      {/* Quality and Reviews */}
      {quality && (
        <section className="space-y-4 pt-4">
          <h2 className="text-2xl font-bold border-b border-gray-200 pb-3 text-gray-900">
            Customer Sentiment & Quality Analysis
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-200 text-center shadow-xs flex flex-col justify-center">
              <p className="text-5xl font-black text-gray-900 mb-2">{quality.summary.average_rating}</p>
              <p className="text-amber-400 text-2xl mb-1">★★★★½</p>
              <p className="text-sm text-gray-500 font-medium">
                Verified across {quality.summary.total_reviews.toLocaleString()} real purchases
              </p>
            </div>
            
            <div className="bg-green-50/70 p-6 rounded-2xl border border-green-200 shadow-xs">
              <h3 className="font-bold text-green-900 mb-3 flex items-center gap-2 text-base">
                <ThumbsUp className="w-5 h-5 text-green-600" /> What Customers Love ({quality.summary.positive_percentage}%)
              </h3>
              <ul className="space-y-2 text-sm text-green-800">
                {quality.themes.positive.map((t, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">•</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-red-50/70 p-6 rounded-2xl border border-red-200 shadow-xs">
              <h3 className="font-bold text-red-900 mb-3 flex items-center gap-2 text-base">
                <AlertTriangle className="w-5 h-5 text-red-600" /> Things to Watch Out For ({quality.summary.negative_percentage}%)
              </h3>
              <ul className="space-y-2 text-sm text-red-800">
                {quality.themes.negative.map((t, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">•</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Compare;
