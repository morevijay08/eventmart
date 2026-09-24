'use client';
import { useEffect, useState } from 'react';
import API from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trash2, ShoppingBag, ChevronRight } from 'lucide-react';

export default function CartPage() {
  const router = useRouter();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  useEffect(() => { fetchCart(); }, []);

  const fetchCart = async () => {
    try {
      const res = await API.get('/api/cart/summary');
      setSummary(res.data.summary);
    } catch {
      setSummary(null);
    } finally {
      setLoading(false);
    }
  };

  const updateQty = async (productId, quantity) => {
    setUpdating(productId);
    try {
      await API.patch('/api/cart/update', { productId, quantity });
      await fetchCart();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setUpdating(null);
    }
  };

  const removeItem = async (productId) => {
    try {
      await API.delete(`/api/cart/remove/${productId}`);
      toast.success('Item removed');
      await fetchCart();
    } catch {
      toast.error('Failed to remove');
    }
  };

  if (loading) return (
    <div className="max-w-5xl mx-auto animate-pulse space-y-4">
      {[1,2,3].map(i => <div key={i} className="bg-white rounded-xl h-28 border border-gray-100" />)}
    </div>
  );

  if (!summary || summary.items?.length === 0) return (
    <div className="text-center py-24">
      <p className="text-6xl mb-4">🛒</p>
      <h2 className="text-xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
      <p className="text-gray-400 mb-6 text-sm">Looks like you haven't added anything yet.</p>
      <Link
        href="/products"
        className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-gray-700 transition-colors"
      >
        <ShoppingBag size={17} /> Start Shopping
      </Link>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Shopping Cart
        <span className="text-gray-400 font-normal text-base ml-2">
          ({summary.totalItems} items)
        </span>
      </h1>

      <div className="grid md:grid-cols-3 gap-6">

        {/* Cart Items */}
        <div className="md:col-span-2 space-y-3">
          {summary.items.map(item => (
            <div
              key={item.productId}
              className="bg-white rounded-xl border border-gray-100 p-4 flex gap-4"
            >
              {/* Image */}
              <Link href={`/products/${item.productId}`} className="flex-shrink-0">
                <img
                  src={item.thumbnail}
                  alt={item.name}
                  className="w-20 h-20 object-contain bg-gray-50 rounded-xl p-1"
                  onError={e => { e.target.src = 'https://placehold.co/80x80?text=?'; }}
                />
              </Link>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <Link href={`/products/${item.productId}`}>
                  <p className="text-sm font-medium text-gray-800 line-clamp-2 hover:text-blue-600">
                    {item.name}
                  </p>
                </Link>
                <p className="text-xs text-gray-400 mt-0.5">{item.brand}</p>
                <p className="text-base font-bold text-gray-900 mt-1">
                  ₹{item.price?.toLocaleString()}
                </p>
              </div>

              {/* Qty + Remove */}
              <div className="flex flex-col items-end justify-between flex-shrink-0">
                <button
                  onClick={() => removeItem(item.productId)}
                  className="text-gray-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={16} />
                </button>

                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => item.quantity > 1
                      ? updateQty(item.productId, item.quantity - 1)
                      : removeItem(item.productId)
                    }
                    disabled={updating === item.productId}
                    className="px-2.5 py-1 text-gray-600 hover:bg-gray-50 text-base font-medium disabled:opacity-40"
                  >−</button>
                  <span className="px-3 py-1 text-sm font-semibold border-x border-gray-200">
                    {updating === item.productId ? '...' : item.quantity}
                  </span>
                  <button
                    onClick={() => updateQty(item.productId, item.quantity + 1)}
                    disabled={updating === item.productId}
                    className="px-2.5 py-1 text-gray-600 hover:bg-gray-50 text-base font-medium disabled:opacity-40"
                  >+</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 h-fit sticky top-20">
          <h2 className="font-bold text-gray-900 mb-4">Order Summary</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal ({summary.totalItems} items)</span>
              <span>₹{summary.subTotal?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Delivery</span>
              <span className={summary.deliveryCharge === 0 ? 'text-green-600 font-medium' : ''}>
                {summary.deliveryCharge === 0 ? 'FREE' : `₹${summary.deliveryCharge}`}
              </span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Tax (18% GST)</span>
              <span>₹{summary.tax?.toLocaleString()}</span>
            </div>
            <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-gray-900 text-base">
              <span>Total</span>
              <span>₹{summary.grandTotal?.toLocaleString()}</span>
            </div>
          </div>

          {summary.freeDelivery && (
            <p className="text-xs text-green-600 font-medium mt-3 bg-green-50 rounded-lg px-3 py-2">
              🎉 You qualify for free delivery!
            </p>
          )}

          <button
            onClick={() => router.push('/checkout')}
            className="w-full mt-4 flex items-center justify-center gap-2 bg-yellow-400 text-gray-900 py-3 rounded-xl font-bold text-sm hover:bg-yellow-300 transition-colors"
          >
            Proceed to Checkout <ChevronRight size={16} />
          </button>

          <Link
            href="/products"
            className="block text-center text-sm text-gray-400 hover:text-gray-600 mt-3"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}