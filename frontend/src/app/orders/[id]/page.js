'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import API from '@/lib/api';
import OrderStatusTracker from '@/components/OrderStatusTracker';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Package } from 'lucide-react';

export default function OrderDetailPage() {
  const { id }   = useParams();
  const [order, setOrder]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    API.get(`/api/orders/${id}`)
      .then(res => setOrder(res.data.order))
      .catch(() => toast.error('Order not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    setCancelling(true);
    try {
      await API.patch(`/api/orders/${id}/cancel`);
      toast.success('Order cancelled');
      const res = await API.get(`/api/orders/${id}`);
      setOrder(res.data.order);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot cancel');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return (
    <div className="max-w-3xl mx-auto animate-pulse space-y-4">
      <div className="h-8 bg-gray-100 rounded w-64" />
      <div className="bg-white rounded-xl h-32 border border-gray-100" />
      <div className="bg-white rounded-xl h-48 border border-gray-100" />
    </div>
  );

  if (!order) return (
    <div className="text-center py-20">
      <p className="text-gray-400">Order not found</p>
      <Link href="/orders" className="text-blue-600 text-sm hover:underline mt-2 block">
        Back to orders
      </Link>
    </div>
  );

  const canCancel = !['shipped', 'delivered', 'cancelled', 'payment_failed'].includes(order.status);

  return (
    <div className="max-w-3xl mx-auto space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Order #{order._id.toString().slice(-8).toUpperCase()}
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric', month: 'long', year: 'numeric'
            })}
          </p>
        </div>
        <Link href="/orders" className="text-sm text-blue-600 hover:underline">
          ← All Orders
        </Link>
      </div>

      {/* Status Tracker */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-800 mb-5">Order Status</h2>
        <OrderStatusTracker status={order.status} />
        {order.estimatedDelivery && !['cancelled','payment_failed','delivered'].includes(order.status) && (
          <p className="text-center text-sm text-gray-400 mt-4">
            Estimated delivery by{' '}
            <strong className="text-gray-700">
              {new Date(order.estimatedDelivery).toLocaleDateString('en-IN', {
                weekday: 'short', day: 'numeric', month: 'short'
              })}
            </strong>
          </p>
        )}
      </div>

      {/* Items */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Package size={17} /> Items Ordered
        </h2>
        <div className="space-y-4">
          {order.items.map((item, i) => (
            <div key={i} className="flex items-center gap-4">
              <img
                src={item.thumbnail}
                alt={item.name}
                className="w-16 h-16 object-contain bg-gray-50 rounded-xl p-1"
                onError={e => { e.target.src = 'https://placehold.co/64x64?text=?'; }}
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">{item.name}</p>
                <p className="text-xs text-gray-400">{item.brand}</p>
                <p className="text-xs text-gray-400 mt-0.5">Qty: {item.quantity}</p>
              </div>
              <p className="font-semibold text-gray-900 text-sm">
                ₹{(item.price * item.quantity).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Price + Address row */}
      <div className="grid md:grid-cols-2 gap-5">

        {/* Price Breakdown */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-800 mb-3">Payment Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal</span>
              <span>₹{order.subTotal?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Delivery</span>
              <span>{order.deliveryCharge === 0 ? 'FREE' : `₹${order.deliveryCharge}`}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Tax</span>
              <span>₹{order.tax?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-bold text-gray-900 border-t border-gray-100 pt-2">
              <span>Grand Total</span>
              <span>₹{order.grandTotal?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs pt-1">
              <span className="text-gray-400">Payment</span>
              <span className={`font-medium capitalize
                ${order.paymentStatus === 'paid' ? 'text-green-600' :
                  order.paymentStatus === 'failed' ? 'text-red-500' : 'text-orange-500'}`}
              >
                {order.paymentStatus} via {order.paymentMethod?.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-800 mb-3">Delivery Address</h2>
          <div className="text-sm text-gray-600 leading-relaxed">
            <p className="font-semibold text-gray-800">{order.shippingAddress?.fullName}</p>
            <p>{order.shippingAddress?.street}</p>
            <p>{order.shippingAddress?.city}, {order.shippingAddress?.state}</p>
            <p>{order.shippingAddress?.pincode}</p>
            <p className="mt-1">📞 {order.shippingAddress?.phone}</p>
          </div>
        </div>
      </div>

      {/* Status History */}
      {order.statusHistory?.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Activity Log</h2>
          <div className="space-y-3">
            {[...order.statusHistory].reverse().map((h, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-gray-400 mt-1.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-800 capitalize">
                    {h.status?.replace(/_/g, ' ')}
                  </p>
                  <p className="text-xs text-gray-400">{h.message}</p>
                  <p className="text-xs text-gray-300 mt-0.5">
                    {new Date(h.timestamp).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cancel button */}
      {canCancel && (
        <button
          onClick={handleCancel}
          disabled={cancelling}
          className="w-full border-2 border-red-200 text-red-500 py-3 rounded-xl font-semibold text-sm hover:bg-red-50 transition-colors disabled:opacity-50"
        >
          {cancelling ? 'Cancelling...' : 'Cancel Order'}
        </button>
      )}
    </div>
  );
}