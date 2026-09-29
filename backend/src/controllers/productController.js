const supabase = require('../config/supabase');

// Fallback demo data
const demoProducts = [
  {
    id: "a0000000-0000-0000-0000-000000000001",
    name: "Apple iPhone 15 (128 GB)",
    brand: "Apple",
    category: "Smartphones",
    variants: [
      { id: "v1", color: "Black", storage: "128GB" }
    ]
  },
  {
    id: "a0000000-0000-0000-0000-000000000002",
    name: "Samsung Galaxy S24 5G",
    brand: "Samsung",
    category: "Smartphones",
    variants: [
      { id: "v2", color: "Marble Gray", storage: "256GB" }
    ]
  },
  {
    id: "a0000000-0000-0000-0000-000000000003",
    name: "Sony WH-1000XM5 Wireless Headphones",
    brand: "Sony",
    category: "Audio",
    variants: []
  },
  {
    id: "a0000000-0000-0000-0000-000000000004",
    name: "Apple MacBook Air M3 (13-inch)",
    brand: "Apple",
    category: "Laptops",
    variants: []
  }
];

exports.searchProducts = async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ success: false, message: 'Please provide a search query' });
    }

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('products')
          .select(`
            id,
            name,
            brand,
            category,
            description,
            base_image_url,
            product_variants (
              id,
              color,
              storage,
              ram
            )
          `)
          .or(`name.ilike.%${q}%,brand.ilike.%${q}%,category.ilike.%${q}%`);

        if (!error && data && data.length > 0) {
          const results = data.map(p => ({
            id: p.id,
            name: p.name,
            brand: p.brand,
            category: p.category,
            description: p.description,
            image: p.base_image_url,
            variants: p.product_variants || []
          }));

          return res.status(200).json({
            success: true,
            count: results.length,
            data: results
          });
        }
      } catch (dbErr) {
        console.warn('Supabase product query error:', dbErr.message);
      }
    }

    // Fallback to local data
    const query = q.toLowerCase();
    const results = demoProducts.filter(p => 
      p.name.toLowerCase().includes(query) || 
      p.brand.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query)
    );

    res.status(200).json({
      success: true,
      count: results.length,
      data: results
    });
  } catch (error) {
    next(error);
  }
};

exports.getProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('products')
          .select(`
            id,
            name,
            brand,
            category,
            description,
            base_image_url,
            product_variants (*)
          `)
          .eq('id', id)
          .single();

        if (!error && data) {
          return res.status(200).json({
            success: true,
            data: {
              id: data.id,
              name: data.name,
              brand: data.brand,
              category: data.category,
              description: data.description,
              image: data.base_image_url,
              variants: data.product_variants || []
            }
          });
        }
      } catch (dbErr) {
        console.warn('Supabase getProduct error:', dbErr.message);
      }
    }

    const product = demoProducts.find(p => p.id === id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};
