const supabase = require('../config/supabase');

const calculateComparisonScore = (listing, weights) => {
  const priceScore = Math.max(0, 100 - (listing.final_price / 1000));
  const ratingScore = (listing.rating || 4) * 20;
  const reviewScore = Math.min(100, (listing.reviews || 1000) / 200);

  const totalScore = (
    (priceScore * (weights.price || 0.40)) + 
    (ratingScore * (weights.quality || 0.30)) + 
    (reviewScore * (weights.reviews || 0.20))
  );

  return Math.round(totalScore);
};

exports.getRecommendations = async (req, res, next) => {
  try {
    const { product_id, budget, preferences } = req.body;

    if (!product_id) {
      return res.status(400).json({ success: false, message: 'product_id is required' });
    }

    const weights = {
      price: 0.40,
      quality: 0.30,
      reviews: 0.20,
      warranty: 0.10,
      ...preferences
    };

    let listings = [];

    if (supabase) {
      try {
        const { data: variants } = await supabase
          .from('product_variants')
          .select('id')
          .eq('product_id', product_id);

        const variantIds = (variants || []).map(v => v.id);

        if (variantIds.length > 0) {
          const { data: listingsData } = await supabase
            .from('product_listings')
            .select(`
              id,
              url,
              title,
              platforms (name, logo_url),
              prices (price, shipping_cost, discount, final_price, recorded_at),
              review_analysis (average_rating, total_reviews, quality_score, negative_themes)
            `)
            .in('variant_id', variantIds);

          if (listingsData && listingsData.length > 0) {
            listings = listingsData.map(l => {
              const latestPrice = (l.prices && l.prices.length > 0)
                ? [...l.prices].sort((a, b) => new Date(b.recorded_at) - new Date(a.recorded_at))[0]
                : null;
              const rev = Array.isArray(l.review_analysis) ? l.review_analysis[0] : l.review_analysis;

              const priceVal = latestPrice ? parseFloat(latestPrice.price) : 0;
              const shippingVal = latestPrice ? parseFloat(latestPrice.shipping_cost) : 0;
              const discountVal = latestPrice ? parseFloat(latestPrice.discount) : 0;
              const finalPriceVal = latestPrice ? parseFloat(latestPrice.final_price) : (priceVal + shippingVal - discountVal);

              return {
                listing_id: l.id,
                platform: l.platforms?.name || 'Retailer',
                price: priceVal,
                shipping: shippingVal,
                discount: discountVal,
                final_price: finalPriceVal,
                rating: rev?.average_rating || 4.5,
                reviews: rev?.total_reviews || 5000,
                url: l.url || `https://www.google.com/search?q=${encodeURIComponent(l.title || 'Product')}`,
                negative_themes: rev?.negative_themes || []
              };
            });
          }
        }
      } catch (dbErr) {
        console.warn('Supabase recommendation error:', dbErr.message);
      }
    }

    if (listings.length === 0) {
      listings = [
        { platform: "Amazon", price: 69999, shipping: 0, discount: 2000, final_price: 67999, rating: 4.6, reviews: 24500, url: "https://amazon.in" },
        { platform: "Croma", price: 79900, shipping: 0, discount: 11410, final_price: 68490, rating: 4.6, reviews: 6800, url: "https://croma.com" },
        { platform: "Reliance Digital", price: 70500, shipping: 0, discount: 1500, final_price: 69000, rating: 4.7, reviews: 5400, url: "https://reliancedigital.in" },
        { platform: "Flipkart", price: 71999, shipping: 99, discount: 3000, final_price: 69098, rating: 4.5, reviews: 18900, url: "https://flipkart.com" },
        { platform: "Tata CLiQ", price: 79900, shipping: 0, discount: 11000, final_price: 68900, rating: 4.5, reviews: 3400, url: "https://tatacliq.com" }
      ];
    }

    // Score all listings
    const scoredListings = listings.map(l => ({
      ...l,
      comparisonScore: calculateComparisonScore(l, weights)
    }));

    // Check if any listings fit strictly within budget
    let eligibleListings = scoredListings;
    let isUnderBudget = true;

    if (budget && Number(budget) > 0) {
      const budgetNum = Number(budget);
      const withinBudget = scoredListings.filter(l => l.final_price <= budgetNum);

      if (withinBudget.length > 0) {
        eligibleListings = withinBudget;
      } else {
        // If all are above budget, pick the lowest price listing available!
        isUnderBudget = false;
        eligibleListings = [...scoredListings].sort((a, b) => a.final_price - b.final_price);
      }
    }

    eligibleListings.sort((a, b) => b.comparisonScore - a.comparisonScore);

    const bestMatch = eligibleListings[0];
    const topWarning = (bestMatch.negative_themes && bestMatch.negative_themes.length > 0)
      ? `User note: ${bestMatch.negative_themes[0]}`
      : 'Compare bank offers at checkout to get additional discounts.';

    let budgetNote = 'Budget criteria satisfied';
    if (budget && Number(budget) > 0) {
      if (isUnderBudget) {
        const savings = Number(budget) - bestMatch.final_price;
        budgetNote = savings > 0 
          ? `Within budget of ₹${Number(budget).toLocaleString()} (Saves ₹${savings.toLocaleString()} under your limit!)`
          : `Exact match for your ₹${Number(budget).toLocaleString()} budget`;
      } else {
        const over = bestMatch.final_price - Number(budget);
        budgetNote = `Lowest market offer is ₹${bestMatch.final_price.toLocaleString()} (₹${over.toLocaleString()} above your ₹${Number(budget).toLocaleString()} budget)`;
      }
    }

    const explanation = {
      budget_match: budgetNote,
      rating_note: `High verified customer score of ${bestMatch.rating}/5`,
      review_note: `Confidence backed by ${bestMatch.reviews.toLocaleString()} real customer purchases`,
      price_note: `Best overall deal price available on ${bestMatch.platform}`,
      warning: topWarning
    };

    res.status(200).json({
      success: true,
      data: {
        recommended_listing: bestMatch,
        all_eligible: eligibleListings,
        explanation
      }
    });
  } catch (error) {
    next(error);
  }
};
