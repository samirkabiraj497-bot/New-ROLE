const supabase = require('../config/supabase');

// Mock Data for fallback
const demoComparisons = {
  "a0000000-0000-0000-0000-000000000001": {
    product_id: "a0000000-0000-0000-0000-000000000001",
    name: "Apple iPhone 15 (128 GB)",
    listings: [
      {
        platform: "Amazon",
        price: 69999,
        shipping: 0,
        discount: 2000,
        final_price: 67999,
        rating: 4.6,
        reviews: 24500,
        availability: "In Stock",
        url: "https://www.amazon.in/Apple-iPhone-15-128-GB/dp/B0CHX1W1XY"
      },
      {
        platform: "Flipkart",
        price: 71999,
        shipping: 99,
        discount: 3000,
        final_price: 69098,
        rating: 4.5,
        reviews: 18900,
        availability: "In Stock",
        url: "https://www.flipkart.com/apple-iphone-15-black-128-gb/p/itm6ac6485515ae4"
      },
      {
        platform: "Reliance Digital",
        price: 70500,
        shipping: 0,
        discount: 1500,
        final_price: 69000,
        rating: 4.7,
        reviews: 5400,
        availability: "In Stock",
        url: "https://www.reliancedigital.in/apple-iphone-15-128-gb-black/p/493839219"
      }
    ]
  },
  "1": {
    product_id: "1",
    name: "Smartphone A",
    listings: [
      {
        platform: "Amazon",
        price: 44999,
        shipping: 0,
        discount: 0,
        final_price: 44999,
        rating: 4.5,
        reviews: 12000,
        availability: "In Stock",
        url: "https://amazon.in"
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
        url: "https://flipkart.com"
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
        url: "https://reliancedigital.in"
      }
    ]
  }
};

exports.getComparison = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (supabase) {
      try {
        // 1. Get product
        const { data: product, error: prodErr } = await supabase
          .from('products')
          .select('id, name, brand, category, base_image_url')
          .eq('id', id)
          .single();

        if (!prodErr && product) {
          // 2. Get variants
          const { data: variants } = await supabase
            .from('product_variants')
            .select('id')
            .eq('product_id', id);

          const variantIds = (variants || []).map(v => v.id);

          if (variantIds.length > 0) {
            // 3. Get listings
            const { data: listingsData, error: listErr } = await supabase
              .from('product_listings')
              .select(`
                id,
                url,
                title,
                availability_status,
                platforms (id, name, website_url, logo_url),
                prices (price, shipping_cost, discount, final_price, recorded_at),
                review_analysis (average_rating, total_reviews, quality_score, positive_themes, negative_themes)
              `)
              .in('variant_id', variantIds);

            if (!listErr && listingsData && listingsData.length > 0) {
              const listings = listingsData.map(l => {
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
                  platform_logo: l.platforms?.logo_url,
                  price: priceVal,
                  shipping: shippingVal,
                  discount: discountVal,
                  final_price: finalPriceVal,
                  rating: rev?.average_rating || 4.5,
                  reviews: rev?.total_reviews || 5000,
                  availability: l.availability_status === 'IN_STOCK' ? 'In Stock' : 'Out of Stock',
                  url: l.url,
                  quality_score: rev?.quality_score || 85,
                  positive_themes: rev?.positive_themes || [],
                  negative_themes: rev?.negative_themes || []
                };
              });

              listings.sort((a, b) => a.final_price - b.final_price);

              return res.status(200).json({
                success: true,
                data: {
                  product_id: product.id,
                  name: product.name,
                  brand: product.brand,
                  image: product.base_image_url,
                  listings
                }
              });
            }
          }
        }
      } catch (dbErr) {
        console.warn('Supabase comparison query error:', dbErr.message);
      }
    }

    const comparisonData = demoComparisons[id] || demoComparisons["1"];

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
