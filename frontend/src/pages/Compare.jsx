import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { getComparison, getQualityAnalysis, getRecommendations } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ExternalLink, ArrowLeft, ShieldCheck, ThumbsUp, AlertTriangle } from 'lucide-react';

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
        <p className="text-gray-600 font-medium">Querying database for live prices and reviews...</p>
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

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12 animate-fade-in">
      <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-blue-600 transition">
        <ArrowLeft className="w-4 h-4" /> Back to Search
      </Link>

      {/* Product Hero Header */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 shadow-sm">
        {comparison.image && (
          <div className="w-32 h-32 md:w-40 md:h-40 flex-shrink-0 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 flex items-center justify-center p-2">
            <img 
              src={comparison.image} 
              alt={comparison.name} 
              className="max-h-full max-w-full object-contain hover:scale-105 transition-transform" 
            />
          </div>
        )}
        <div className="flex-1 text-center md:text-left space-y-2">
          {comparison.brand && (
            <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-full uppercase tracking-wider">
              {comparison.brand}
            </span>
          )}
          <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900 leading-tight">
            {comparison.name}
          </h1>
          {budget && (
            <p className="text-sm md:text-base text-gray-600">
              Target Budget: <span className="font-bold text-gray-900">₹{Number(budget).toLocaleString()}</span>
            </p>
          )}
        </div>
      </div>

      {/* AI / Smart Recommendation Card */}
      {recommendation?.recommended_listing && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 md:p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-blue-900">Top Recommended Deal</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-baseline gap-3">
                <p className="text-3xl md:text-4xl font-black text-blue-700">
                  ₹{recommendation.recommended_listing.final_price.toLocaleString()}
                </p>
                <span className="text-sm font-semibold px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                  on {recommendation.recommended_listing.platform}
                </span>
              </div>
              <div className="mt-4 space-y-2 text-sm text-gray-700">
                <p className="flex items-center gap-2">
                  <span className="text-blue-600 font-bold">✓</span> {recommendation.explanation.budget_match}
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-blue-600 font-bold">✓</span> {recommendation.explanation.rating_note}
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-blue-600 font-bold">✓</span> {recommendation.explanation.review_note}
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-blue-600 font-bold">✓</span> {recommendation.explanation.price_note}
                </p>
              </div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-blue-100 text-sm space-y-3 shadow-xs">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Consideration & Advice
              </h3>
              <p className="text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-200">
                {recommendation.explanation.warning}
              </p>
              {recommendation.recommended_listing.url && (
                <a 
                  href={recommendation.recommended_listing.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-xl transition text-center shadow-xs"
                >
                  Buy on {recommendation.recommended_listing.platform} <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Price Comparison Table & Chart */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold border-b border-gray-200 pb-3 text-gray-900">
          Store Price Comparison
        </h2>
        
        <div className="grid lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 overflow-x-auto bg-white rounded-2xl border border-gray-200 shadow-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Store</th>
                  <th className="py-3 px-4">Base Price</th>
                  <th className="py-3 px-4">Shipping</th>
                  <th className="py-3 px-4">Final Net Price</th>
                  <th className="py-3 px-4 text-right">Offer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {comparison.listings.map((l, idx) => {
                  const isBest = l.platform === recommendation?.recommended_listing?.platform;
                  return (
                    <tr key={idx} className={`hover:bg-gray-50 transition-colors ${isBest ? 'bg-blue-50/40 font-medium' : ''}`}>
                      <td className="py-4 px-4 font-semibold text-gray-800 flex items-center gap-2">
                        {l.platform}
                        {isBest && (
                          <span className="text-[10px] font-bold bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                            BEST
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-gray-600">₹{l.price.toLocaleString()}</td>
                      <td className="py-4 px-4 text-gray-600">{l.shipping > 0 ? `₹${l.shipping}` : 'Free'}</td>
                      <td className="py-4 px-4 font-bold text-gray-900">₹{l.final_price.toLocaleString()}</td>
                      <td className="py-4 px-4 text-right">
                        <a 
                          href={l.url || "#"} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 text-sm font-semibold bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200 transition"
                        >
                          Visit Store <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="h-64 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between">
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">Price Breakdown</h3>
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={90} tick={{ fontSize: 12, fill: '#4b5563' }} />
                  <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
                  <Bar dataKey="price" radius={[0, 6, 6, 0]} barSize={26}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      {/* Quality and Reviews */}
      {quality && (
        <section className="space-y-6 pt-4">
          <h2 className="text-2xl font-bold border-b border-gray-200 pb-3 text-gray-900">
            Sentiment & Quality Analysis
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-200 text-center shadow-xs flex flex-col justify-center">
              <p className="text-5xl font-black text-gray-900 mb-2">{quality.summary.average_rating}</p>
              <p className="text-amber-400 text-2xl mb-1">★★★★½</p>
              <p className="text-sm text-gray-500">
                Aggregated across {quality.summary.total_reviews.toLocaleString()} customer reviews
              </p>
            </div>
            
            <div className="bg-green-50/70 p-6 rounded-2xl border border-green-200 shadow-xs">
              <h3 className="font-bold text-green-900 mb-3 flex items-center gap-2">
                <ThumbsUp className="w-4 h-4 text-green-600" /> What Customers Love ({quality.summary.positive_percentage}%)
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
              <h3 className="font-bold text-red-900 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600" /> Known Concerns ({quality.summary.negative_percentage}%)
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
