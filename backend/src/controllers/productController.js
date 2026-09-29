// Mock database for now since we don't have a real Supabase DB populated
const demoProducts = [
  {
    id: "1",
    name: "Smartphone A",
    brand: "BrandX",
    category: "Smartphones",
    variants: [
      {
        id: "v1",
        color: "Black",
        storage: "256GB"
      }
    ]
  },
  {
    id: "2",
    name: "Smartphone B",
    brand: "BrandY",
    category: "Smartphones",
    variants: []
  },
  {
    id: "3",
    name: "Laptop A",
    brand: "BrandZ",
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

    // Basic product search logic for demo
    const query = q.toLowerCase();
    const results = demoProducts.filter(p => 
      p.name.toLowerCase().includes(query) || 
      p.brand.toLowerCase().includes(query)
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
