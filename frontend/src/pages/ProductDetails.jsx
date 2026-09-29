import React from 'react';
import { Link, useParams } from 'react-router-dom';

const ProductDetails = () => {
  const { id } = useParams();
  
  return (
    <div className="max-w-4xl mx-auto py-12 text-center space-y-6">
      <h1 className="text-3xl font-bold">Product Details</h1>
      <p className="text-gray-600">Details for product {id} would be listed here (Specs, High-res images).</p>
      
      <Link to={`/product/${id}/compare`} className="inline-block bg-blue-600 text-white px-6 py-3 rounded-full font-bold hover:bg-blue-700">
        View Price Comparison
      </Link>
    </div>
  );
};

export default ProductDetails;
