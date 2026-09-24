'use client';
import { useEffect, useState } from 'react';
import API from '@/lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ChevronRight, Package } from 'lucide-react';

const STATUS_STYLES = {
  placed:         'bg-blue-50 text-blue-700',
  confirmed:      'bg-green-50 text-green-700',
  processing:     'bg-yellow-50 text-yellow-700',
  shipped:        'bg-purple-50 text-purple-700',
  delivered:      'bg-green-100 text-green-800',
  cancelled:      'bg-red-50 text-red-600',
  payment_failed: 'bg-red-50 text-red-600'
};

export default function OrdersPage() {
  const { user }  = useAuth();
  const router    = useRouter();
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return; }
    API.get('/api/orders/my-orders')
      .then(res => setOrders(res.data.orders || []))
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return (
    <div className="max-w-3xl mx-auto space-y-3 animate-pulse">
      {[1,2,3].map(i => <div key={i} className="bg-white rounded-xl h-28 border border-gray-100" />)}
    </div>
  );

  if (orders.length === 0) return (
    <div className="text-center py-24">
      <Package size={48} className="text-gray-200 mx-auto mb-4" />
      <h2 className="text-xl font-bold text-gray-800 mb-2">No orders yet</h2>
      <p className="text-gray-400 mb-6 text-sm">Your order history will appear here</p>
      <Link
        href="/products"
        className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-gray-700"
      >
        Start Shopping
      </Link>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h1>
      <div className="space-y-3">
        {orders.map(order => (
          <Link
            key={order._id}
            href={`/orders/${order._id}`}
            className="block bg-white rounded-xl border border-gray-100 p-4 hover:border-gray-200 hover:shadow-sm transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-semibold text-gray-800">
                  Order #{order._id.toString().slice(-8).toUpperCase()}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(order.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric'
                  })}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize
                  ${STATUS_STYLES[order.status] || 'bg-gray-50 text-gray-600'}`}
                >
                  {order.status.replace(/_/g, ' ')}
                </span>
                <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
              </div>
            </div>

            {/* Items preview */}
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {order.items.slice(0, 3).map((item, i) => (
                  <img
                    key={i}
                    src={item.thumbnail}
                    alt={item.name}
                    className="w-10 h-10 object-contain bg-gray-50 rounded-lg border border-white p-0.5"
                    onError={e => { e.target.src = 'https://placehold.co/40x40?text=?'; }}
                  />
                ))}
                {order.items.length > 3 && (
                  <div className="w-10 h-10 bg-gray-100 rounded-lg border border-white flex items-center justify-center text-xs font-medium text-gray-500">
                    +{order.items.length - 3}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 truncate">
                  {order.items.map(i => i.name).join(', ')}
                </p>
              </div>
              <p className="font-bold text-gray-900 text-sm flex-shrink-0">
                ₹{order.grandTotal?.toLocaleString()}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}