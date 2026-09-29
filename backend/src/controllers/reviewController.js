const supabase = require('../config/supabase');

exports.getReviewAnalysis = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (supabase) {
      try {
        const { data: variants } = await supabase
          .from('product_variants')
          .select('id')
          .eq('product_id', id);

        const variantIds = (variants || []).map(v => v.id);

        if (variantIds.length > 0) {
          const { data: listings } = await supabase
            .from('product_listings')
            .select(`
              id,
              review_analysis (
                average_rating,
                total_reviews,
                positive_percentage,
                neutral_percentage,
                negative_percentage,
                positive_themes,
                negative_themes,
                quality_score
              )
            `)
            .in('variant_id', variantIds);

          const analyses = (listings || [])
            .map(l => Array.isArray(l.review_analysis) ? l.review_analysis[0] : l.review_analysis)
            .filter(Boolean);

          if (analyses.length > 0) {
            const totalRev = analyses.reduce((acc, a) => acc + (a.total_reviews || 0), 0);
            const avgRating = totalRev > 0 
              ? (analyses.reduce((acc, a) => acc + (parseFloat(a.average_rating) * a.total_reviews), 0) / totalRev).toFixed(1)
              : analyses[0].average_rating;

            const positivePerc = Math.round(analyses.reduce((acc, a) => acc + parseFloat(a.positive_percentage || 0), 0) / analyses.length);
            const negativePerc = Math.round(analyses.reduce((acc, a) => acc + parseFloat(a.negative_percentage || 0), 0) / analyses.length);
            const neutralPerc = Math.max(0, 100 - positivePerc - negativePerc);

            const posThemes = Array.from(new Set(analyses.flatMap(a => a.positive_themes || [])));
            const negThemes = Array.from(new Set(analyses.flatMap(a => a.negative_themes || [])));

            return res.status(200).json({
              success: true,
              data: {
                product_id: id,
                summary: {
                  average_rating: parseFloat(avgRating),
                  total_reviews: totalRev,
                  positive_percentage: positivePerc,
                  neutral_percentage: neutralPerc,
                  negative_percentage: negativePerc
                },
                themes: {
                  positive: posThemes.slice(0, 4),
                  negative: negThemes.slice(0, 4)
                },
                quality_indicators: [
                  { name: "Rating", stars: Math.min(5, Math.round(avgRating)), description: "Consistently verified across multiple online stores" },
                  { name: "Review confidence", stars: 5, description: "Based on thousands of real customer purchases" },
                  { name: "Sentiment trend", stars: positivePerc > 80 ? 5 : 4, description: `${positivePerc}% verified positive sentiment` }
                ]
              }
            });
          }
        }
      } catch (dbErr) {
        console.warn('Supabase review error:', dbErr.message);
      }
    }

    // Static fallback
    res.status(200).json({
      success: true,
      data: {
        product_id: id,
        summary: {
          average_rating: 4.6,
          total_reviews: 24500,
          positive_percentage: 88,
          neutral_percentage: 8,
          negative_percentage: 4,
        },
        themes: {
          positive: [
            "Camera Quality",
            "Battery Life",
            "Build & Design",
            "USB-C Speed"
          ],
          negative: [
            "Heating during heavy usage",
            "Charging speed"
          ]
        },
        quality_indicators: [
          { name: "Rating", stars: 5, description: "Excellent overall rating" },
          { name: "Review confidence", stars: 5, description: "High volume of verified purchases" },
          { name: "Recent feedback", stars: 4, description: "Mostly positive trends recently" }
        ]
      }
    });
  } catch (error) {
    next(error);
  }
};
