'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import API from '@/lib/api';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { ShoppingCart, Zap, Star, ChevronRight, Package, RotateCcw, Shield } from 'lucide-react';
import Link from 'next/link';

export default function ProductDetailPage() {
  const { id }     = useParams();
  const { user }   = useAuth();
  const router     = useRouter();
  const [product, setProduct]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [selImage, setSelImage] = useState(0);
  const [qty, setQty]           = useState(1);
  const [adding, setAdding]     = useState(false);
  const [added, setAdded]       = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await API.get(`/api/products/${id}`);
        setProduct(res.data.product);
      } catch {
        toast.error('Product not found');
        router.push('/products');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) { router.push('/auth/login'); return; }
    setAdding(true);
    try {
      const res = await API.post('/api/cart/add', { productId: id, quantity: qty });
      setAdded(true);
      toast.success(
        res.data.alreadyInCart
          ? 'Already in cart — quantity updated.'
          : 'Added to cart!'
      );
      setTimeout(() => setAdded(false), 2500);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add');
    } finally {
      setAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (!user) { router.push('/auth/login'); return; }
    try {
      await API.post('/api/cart/add', { productId: id, quantity: qty });
      router.push('/cart');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  if (loading) return (
    <div className="grid md:grid-cols-2 gap-10 animate-pulse">
      <div className="bg-gray-100 rounded-2xl h-96" />
      <div className="space-y-4">
        <div className="h-6 bg-gray-100 rounded w-1/3" />
        <div className="h-8 bg-gray-100 rounded w-3/4" />
        <div className="h-10 bg-gray-100 rounded w-1/2" />
      </div>
    </div>
  );

  if (!product) return null;

  const images = product.images?.length ? product.images : [product.thumbnail];
  const specs  = product.specs ? Object.entries(product.specs) : [];

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link href="/" className="hover:text-gray-600">Home</Link>
        <ChevronRight size={14} />
        <Link href="/products" className="hover:text-gray-600">Products</Link>
        <ChevronRight size={14} />
        <Link href={`/products?category=${product.category}`} className="hover:text-gray-600 capitalize">
          {product.category}
        </Link>
        <ChevronRight size={14} />
        <span className="text-gray-600 line-clamp-1">{product.name}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-10">

        {/* Left — Images */}
        <div>
          <div className="bg-gray-50 rounded-2xl p-6 mb-3 h-80 flex items-center justify-center border border-gray-100">
            <img
              src={images[selImage]}
              alt={product.name}
              className="max-h-full max-w-full object-contain"
              onError={e => { e.target.src = 'https://placehold.co/400x300?text=No+Image'; }}
            />
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelImage(i)}
                  className={`flex-shrink-0 w-16 h-16 rounded-xl bg-gray-50 border-2 p-1 transition-all
                    ${selImage === i ? 'border-gray-900' : 'border-gray-100 hover:border-gray-300'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right — Details */}
        <div>
          <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-1">{product.brand}</p>
          <h1 className="text-2xl font-bold text-gray-900 leading-snug mb-3">{product.name}</h1>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-1 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
              <Star size={11} fill="white" />
              {product.averageRating || 'N/A'}
            </div>
            <span className="text-sm text-gray-400">{product.totalReviews || 0} reviews</span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl font-bold text-gray-900">
              ₹{product.price?.toLocaleString()}
            </span>
            {product.originalPrice && (
              <span className="text-lg text-gray-400 line-through">
                ₹{product.originalPrice?.toLocaleString()}
              </span>
            )}
            {product.discount > 0 && (
              <span className="text-green-600 font-bold text-lg">{product.discount}% off</span>
            )}
          </div>

          {/* Stock status */}
          <div className="mb-5">
            {product.stock === 0 ? (
              <span className="text-red-500 font-medium text-sm">Out of Stock</span>
            ) : product.stock < 5 ? (
              <span className="text-orange-500 font-medium text-sm">
                Only {product.stock} left in stock — order soon!
              </span>
            ) : (
              <span className="text-green-600 font-medium text-sm">✓ In Stock</span>
            )}
          </div>

          {/* Quantity selector */}
          {product.stock > 0 && (
            <div className="flex items-center gap-3 mb-5">
              <span className="text-sm font-medium text-gray-700">Qty:</span>
              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                  className="px-3 py-2 text-gray-600 hover:bg-gray-50 text-lg font-medium"
                >−</button>
                <span className="px-4 py-2 text-sm font-semibold border-x border-gray-200">
                  {qty}
                </span>
                <button
                  onClick={() => setQty(q => Math.min(product.stock, q + 1))}
                  className="px-3 py-2 text-gray-600 hover:bg-gray-50 text-lg font-medium"
                >+</button>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={handleAddToCart}
              disabled={adding || product.stock === 0}
              className="flex-1 flex items-center justify-center gap-2 border-2 border-gray-900 text-gray-900 py-3 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <ShoppingCart size={17} />
              {adding ? 'Adding...' : added ? 'Added to Cart ✓' : 'Add to Cart'}
            </button>
            <button
              onClick={handleBuyNow}
              disabled={product.stock === 0}
              className="flex-1 flex items-center justify-center gap-2 bg-yellow-400 text-gray-900 py-3 rounded-xl font-semibold text-sm hover:bg-yellow-300 transition-colors disabled:opacity-50"
            >
              <Zap size={17} />
              Buy Now
            </button>
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { icon: <Package size={16} />, text: 'Free Delivery over ₹50K' },
              { icon: <RotateCcw size={16} />, text: '7 Day Return' },
              { icon: <Shield size={16} />, text: '1 Year Warranty' }
            ].map((b, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5 bg-gray-50 rounded-xl p-3 text-center">
                <span className="text-gray-500">{b.icon}</span>
                <span className="text-xs text-gray-500 leading-tight">{b.text}</span>
              </div>
            ))}
          </div>

          {/* Description */}
          <div className="mb-5">
            <h3 className="font-semibold text-gray-800 mb-2">About this product</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
          </div>
        </div>
      </div>

      {/* Specs Table */}
      {specs.length > 0 && (
        <div className="mt-10 bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Specifications</h2>
          <div className="divide-y divide-gray-50">
            {specs.map(([key, value]) => (
              <div key={key} className="flex py-3">
                <span className="w-44 text-sm text-gray-400 capitalize flex-shrink-0">
                  {key.replace(/_/g, ' ')}
                </span>
                <span className="text-sm text-gray-800 font-medium">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reviews */}
      {product.reviews?.length > 0 && (
        <div className="mt-8 bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Customer Reviews ({product.totalReviews})
          </h2>
          <div className="space-y-4">
            {product.reviews.slice(0, 5).map((r, i) => (
              <div key={i} className="border-b border-gray-50 pb-4 last:border-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex items-center gap-1 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded">
                    <Star size={10} fill="white" /> {r.rating}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{r.userName}</span>
                  <span className="text-xs text-gray-400">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{r.comment}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}