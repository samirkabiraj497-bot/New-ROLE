// Mock Data for platforms and prices
const demoComparisons = {
  "1": { // Product ID: 1 (Smartphone A)
    product_id: "1",
    name: "Smartphone A",
    listings: [
      {
        platform: "Platform A",
        price: 44999,
        shipping: 0,
        discount: 0,
        final_price: 44999,
        rating: 4.5,
        reviews: 12000,
        availability: "In Stock"
      },
      {
        platform: "Platform B",
        price: 46499,
        shipping: 99,
        discount: 500,
        final_price: 46098,
        rating: 4.4,
        reviews: 8500,
        availability: "In Stock"
      },
      {
        platform: "Platform C",
        price: 45299,
        shipping: 0,
        discount: 0,
        final_price: 45299,
        rating: 4.6,
        reviews: 15000,
        availability: "In Stock"
      }
    ]
  }
};

exports.getComparison = async (req, res, next) => {
  try {
    const { id } = req.params;

    const comparisonData = demoComparisons[id];

    if (!comparisonData) {
      return res.status(404).json({
        success: false,
        message: 'Comparison data not found for this product'
      });
    }

    res.status(200).json({
      success: true,
      data: comparisonData
    });
  } catch (error) {
    next(error);
  }
};
