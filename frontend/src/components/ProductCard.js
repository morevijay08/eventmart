import Link from 'next/link';
import { Star, ShoppingCart } from 'lucide-react';

export default function ProductCard({ product, onAddToCart, adding = false, added = false }) {
  const discount = product.discount || 0;

  return (
    <div className="bg-white rounded-xl border border-gray-100 hover:shadow-md transition-shadow group">
      <Link href={`/products/${product._id}`}>
        <div className="relative overflow-hidden rounded-t-xl bg-gray-50 h-48">
          <img
            src={product.thumbnail}
            alt={product.name}
            className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
            onError={(e) => { e.target.src = 'https://placehold.co/300x200?text=No+Image'; }}
          />
          {discount > 0 && (
            <span className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              {discount}% OFF
            </span>
          )}
          {product.isNewArrival && (
            <span className="absolute top-2 right-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              NEW
            </span>
          )}
        </div>
      </Link>

      <div className="p-4">
        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{product.brand}</p>
        <Link href={`/products/${product._id}`}>
          <h3 className="text-sm font-medium text-gray-800 line-clamp-2 hover:text-blue-600 transition-colors leading-snug">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1 mt-2">
          <Star size={13} className="fill-yellow-400 text-yellow-400" />
          <span className="text-xs text-gray-600">
            {product.averageRating > 0 ? product.averageRating : 'No reviews'}
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 mt-2">
          <span className="text-lg font-bold text-gray-900">
            ₹{product.price?.toLocaleString()}
          </span>
          {product.originalPrice && (
            <span className="text-sm text-gray-400 line-through">
              ₹{product.originalPrice?.toLocaleString()}
            </span>
          )}
        </div>

        {/* Stock */}
        {product.stock === 0 ? (
          <p className="text-xs text-red-500 mt-1 font-medium">Out of Stock</p>
        ) : product.stock < 5 ? (
          <p className="text-xs text-orange-500 mt-1 font-medium">Only {product.stock} left!</p>
        ) : null}

        {/* Add to Cart */}
        <button
          onClick={() => onAddToCart(product._id)}
          disabled={product.stock === 0 || adding}
          className="mt-3 w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          <ShoppingCart size={15} />
          {product.stock === 0
            ? 'Out of Stock'
            : adding
              ? 'Adding...'
              : added
                ? 'Added to Cart ✓'
                : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
}