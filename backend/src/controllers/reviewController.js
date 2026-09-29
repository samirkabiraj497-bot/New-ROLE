// Mock reviews and analysis data
exports.getReviewAnalysis = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Return static demo data
    const analysis = {
      product_id: id,
      summary: {
        average_rating: 4.5,
        total_reviews: 12430,
        positive_percentage: 84,
        neutral_percentage: 9,
        negative_percentage: 7,
      },
      themes: {
        positive: [
          "Battery life",
          "Display",
          "Performance"
        ],
        negative: [
          "Heating",
          "Camera in low light",
          "Charging speed"
        ]
      },
      quality_indicators: [
        { name: "Rating", stars: 5, description: "Excellent overall rating" },
        { name: "Review confidence", stars: 4, description: "High volume of verified purchases" },
        { name: "Recent feedback", stars: 4, description: "Mostly positive trends recently" }
      ]
    };

    res.status(200).json({
      success: true,
      data: analysis
    });
  } catch (error) {
    next(error);
  }
};
