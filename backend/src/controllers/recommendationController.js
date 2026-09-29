const { getComparison } = require('./comparisonController');

// Mock function to calculate recommendation score based on configurable weights
const calculateComparisonScore = (listing, weights) => {
  // Normalize values (Mock logic)
  const priceScore = Math.max(0, 100 - (listing.final_price / 1000)); // lower is better
  const ratingScore = listing.rating * 20; // 5.0 -> 100
  const reviewScore = Math.min(100, listing.reviews / 200); // 20k -> 100
  
  const totalScore = (
    (priceScore * weights.price) + 
    (ratingScore * weights.quality) + 
    (reviewScore * weights.reviews)
  );

  return Math.round(totalScore);
};

exports.getRecommendations = async (req, res, next) => {
  try {
    const { product_id, budget, preferences } = req.body;

    if (!product_id) {
      return res.status(400).json({ success: false, message: 'product_id is required' });
    }

    // Default weights
    const weights = {
      price: 0.40,
      quality: 0.30,
      reviews: 0.20,
      warranty: 0.10,
      ...preferences
    };

    // Use mock comparisons for now
    const comparisonData = require('./comparisonController')._demoComparisons?.[product_id]; // Need to export demoComparisons if we use it this way, or we just mock it again here.
    
    // Instead of importing, just mock the data directly here for demo purposes
    const listings = [
      {
        platform: "Amazon",
        price: 44999,
        shipping: 0,
        discount: 0,
        final_price: 44999,
        rating: 4.5,
        reviews: 12000,
        availability: "In Stock",
        url: "https://amazon.in/demo"
      },
      {
        platform: "Flipkart",
        price: 46499,
        shipping: 99,
        discount: 500,
        final_price: 46098,
        rating: 4.4,
        reviews: 8500,
        availability: "In Stock",
        url: "https://flipkart.com/demo"
      },
      {
        platform: "Reliance Digital",
        price: 45299,
        shipping: 0,
        discount: 0,
        final_price: 45299,
        rating: 4.6,
        reviews: 15000,
        availability: "In Stock",
        url: "https://reliancedigital.in/demo"
      }
    ];

    // Filter by budget
    let eligibleListings = listings;
    if (budget) {
      eligibleListings = listings.filter(l => l.final_price <= budget);
    }

    if (eligibleListings.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No products found within the budget',
        recommendation: null
      });
    }

    // Calculate score
    eligibleListings = eligibleListings.map(l => ({
      ...l,
      comparisonScore: calculateComparisonScore(l, weights)
    }));

    // Sort by score descending
    eligibleListings.sort((a, b) => b.comparisonScore - a.comparisonScore);

    const bestMatch = eligibleListings[0];

    const explanation = {
      budget_match: budget ? `Within budget of ₹${budget}` : 'No budget specified',
      rating_note: `Strong customer rating of ${bestMatch.rating}/5`,
      review_note: `Large review volume (${bestMatch.reviews} reviews)`,
      price_note: 'Competitive total price compared to alternatives',
      warning: 'Some customer feedback mentions heating.' // Static warning for demo
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
