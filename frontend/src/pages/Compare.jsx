import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { getComparison, getQualityAnalysis, getRecommendations } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

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
        // We use Promise.all to fetch all data simultaneously
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
        <p className="text-gray-600">Gathering product data...</p>
      </div>
    );
  }

  if (error || !comparison) {
    return (
      <div className="text-center py-20 text-red-500 bg-red-50 rounded-xl">
        <h2 className="text-2xl font-bold mb-2">Oops!</h2>
        <p>{error || 'Product not found.'}</p>
      </div>
    );
  }

  const chartData = comparison.listings.map(l => ({
    name: l.platform,
    price: l.final_price,
    fill: l.platform === recommendation?.recommended_listing?.platform ? '#2563eb' : '#94a3b8'
  }));

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-2 border-b pb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">{comparison.name}</h1>
        {budget && <p className="text-lg text-gray-500">Your budget: <span className="font-semibold text-gray-800">₹{budget}</span></p>}
      </div>

      {/* Recommendation Card */}
      {recommendation?.recommended_listing && (
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-blue-900 mb-4">✨ Recommended for you</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-3xl font-black text-blue-700 mb-1">
                ₹{recommendation.recommended_listing.final_price.toLocaleString()}
              </p>
              <p className="text-sm text-blue-600 font-medium">on {recommendation.recommended_listing.platform}</p>
              <div className="mt-4 space-y-2 text-sm text-gray-700">
                <p>✓ {recommendation.explanation.budget_match}</p>
                <p>✓ {recommendation.explanation.rating_note}</p>
                <p>✓ {recommendation.explanation.review_note}</p>
                <p>✓ {recommendation.explanation.price_note}</p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-blue-100 text-sm">
              <h3 className="font-bold text-gray-800 mb-2">Things to consider:</h3>
              <p className="text-amber-600 flex items-start gap-2">
                <span className="text-lg">⚠</span> {recommendation.explanation.warning}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Price Comparison */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold border-b pb-2">Price Comparison</h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="py-3 font-semibold text-gray-600">Platform</th>
                  <th className="py-3 font-semibold text-gray-600">Price</th>
                  <th className="py-3 font-semibold text-gray-600">Shipping</th>
                  <th className="py-3 font-semibold text-gray-600">Final Price</th>
                  <th className="py-3 font-semibold text-gray-600">Action</th>
                </tr>
              </thead>
              <tbody>
                {comparison.listings.map((l, idx) => (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 font-medium text-gray-800">{l.platform}</td>
                    <td className="py-4 text-gray-600">₹{l.price.toLocaleString()}</td>
                    <td className="py-4 text-gray-600">{l.shipping > 0 ? `₹${l.shipping}` : 'Free'}</td>
                    <td className="py-4 font-bold text-gray-900">₹{l.final_price.toLocaleString()}</td>
                    <td className="py-4">
                      <a href={l.url || "#"} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-sm font-medium bg-blue-50 px-3 py-1 rounded-full border border-blue-200 hover:bg-blue-100 transition-colors">
                        View Offer
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="h-64 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <XAxis type="number" domain={[0, 'dataMax + 5000']} hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={80} />
                <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} cursor={{fill: 'transparent'}} />
                <Bar dataKey="price" radius={[0, 4, 4, 0]} barSize={30}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Quality and Reviews */}
      {quality && (
        <section className="space-y-6 pt-8">
          <h2 className="text-2xl font-bold border-b pb-2">Quality & Feedback</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl border border-gray-200 text-center shadow-sm">
              <p className="text-5xl font-black text-gray-900 mb-2">{quality.summary.average_rating}</p>
              <p className="text-yellow-400 text-2xl mb-1">★★★★½</p>
              <p className="text-sm text-gray-500">Based on {quality.summary.total_reviews.toLocaleString()} reviews</p>
            </div>
            
            <div className="bg-green-50 p-6 rounded-xl border border-green-100 shadow-sm">
              <h3 className="font-bold text-green-800 mb-3">✓ Positive Feedback ({quality.summary.positive_percentage}%)</h3>
              <ul className="space-y-2 text-sm text-green-700">
                {quality.themes.positive.map((t, i) => <li key={i}>• {t}</li>)}
              </ul>
            </div>

            <div className="bg-red-50 p-6 rounded-xl border border-red-100 shadow-sm">
              <h3 className="font-bold text-red-800 mb-3">⚠ Negative Feedback ({quality.summary.negative_percentage}%)</h3>
              <ul className="space-y-2 text-sm text-red-700">
                {quality.themes.negative.map((t, i) => <li key={i}>• {t}</li>)}
              </ul>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Compare;
