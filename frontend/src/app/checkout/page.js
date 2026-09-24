'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import API from '@/lib/api';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { MapPin, CreditCard, Truck } from 'lucide-react';

export default function CheckoutPage() {
  const { user }  = useAuth();
  const router    = useRouter();
  const [summary, setSummary]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [placing, setPlacing]   = useState(false);
  const [payMethod, setPayMethod] = useState('cod');

  const [address, setAddress] = useState({
    fullName: user?.name || '',
    phone:    '',
    street:   '',
    city:     '',
    state:    '',
    pincode:  ''
  });

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return; }
    API.get('/api/cart/summary')
      .then(res => setSummary(res.data.summary))
      .catch(() => router.push('/cart'))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    setAddress(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    const empty = Object.values(address).some(v => !v.trim());
    if (empty) { toast.error('Please fill all address fields'); return; }

    setPlacing(true);
    try {
      const res = await API.post('/api/orders', {
        shippingAddress: address,
        paymentMethod:   payMethod
      });
      toast.success('Order placed successfully!');
      router.push(`/orders/${res.data.order.orderId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  if (loading) return (
    <div className="max-w-4xl mx-auto animate-pulse">
      <div className="h-8 bg-gray-100 rounded w-48 mb-8" />
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl h-96 border border-gray-100" />
        <div className="bg-white rounded-xl h-64 border border-gray-100" />
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>

      <form onSubmit={handlePlaceOrder}>
        <div className="grid md:grid-cols-2 gap-6">

          {/* Left — Address + Payment */}
          <div className="space-y-5">

            {/* Shipping Address */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-center gap-2 mb-4">
                <MapPin size={18} className="text-gray-500" />
                <h2 className="font-semibold text-gray-800">Delivery Address</h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { name: 'fullName', label: 'Full Name',   col: 'col-span-2' },
                  { name: 'phone',   label: 'Phone Number', col: 'col-span-2' },
                  { name: 'street',  label: 'Street',       col: 'col-span-2' },
                  { name: 'city',    label: 'City',         col: '' },
                  { name: 'state',   label: 'State',        col: '' },
                  { name: 'pincode', label: 'Pincode',      col: 'col-span-2' }
                ].map(field => (
                  <div key={field.name} className={field.col}>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      {field.label}
                    </label>
                    <input
                      name={field.name}
                      value={address[field.name]}
                      onChange={handleChange}
                      required
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gray-900"
                      placeholder={field.label}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard size={18} className="text-gray-500" />
                <h2 className="font-semibold text-gray-800">Payment Method</h2>
              </div>
              <div className="space-y-2">
                {[
                  { key: 'cod',  label: 'Cash on Delivery', icon: '💵', desc: 'Pay when your order arrives' },
                  { key: 'card', label: 'Credit / Debit Card', icon: '💳', desc: 'Secure payment via Stripe' },
                  { key: 'upi',  label: 'UPI',               icon: '📱', desc: 'GPay, PhonePe, Paytm' }
                ].map(method => (
                  <label
                    key={method.key}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all
                      ${payMethod === method.key
                        ? 'border-gray-900 bg-gray-50'
                        : 'border-gray-100 hover:border-gray-200'
                      }`}
                  >
                    <input
                      type="radio"
                      name="payMethod"
                      value={method.key}
                      checked={payMethod === method.key}
                      onChange={() => setPayMethod(method.key)}
                      className="accent-gray-900"
                    />
                    <span className="text-xl">{method.icon}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{method.label}</p>
                      <p className="text-xs text-gray-400">{method.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Right — Order Summary */}
          <div>
            <div className="bg-white rounded-xl border border-gray-100 p-5 sticky top-20">
              <div className="flex items-center gap-2 mb-4">
                <Truck size={18} className="text-gray-500" />
                <h2 className="font-semibold text-gray-800">Order Summary</h2>
              </div>

              {/* Items */}
              <div className="space-y-3 mb-4 max-h-52 overflow-y-auto">
                {summary?.items?.map(item => (
                  <div key={item.productId} className="flex items-center gap-3">
                    <img
                      src={item.thumbnail}
                      alt={item.name}
                      className="w-12 h-12 object-contain bg-gray-50 rounded-lg p-1 flex-shrink-0"
                      onError={e => { e.target.src = 'https://placehold.co/48x48?text=?'; }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-700 line-clamp-2">{item.name}</p>
                      <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 flex-shrink-0">
                      ₹{(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t border-gray-100 pt-3 space-y-2 text-sm">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span>
                  <span>₹{summary?.subTotal?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Delivery</span>
                  <span className={summary?.deliveryCharge === 0 ? 'text-green-600 font-medium' : ''}>
                    {summary?.deliveryCharge === 0 ? 'FREE' : `₹${summary?.deliveryCharge}`}
                  </span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>GST (18%)</span>
                  <span>₹{summary?.tax?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-gray-900 text-base border-t border-gray-100 pt-2">
                  <span>Grand Total</span>
                  <span>₹{summary?.grandTotal?.toLocaleString()}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={placing}
                className="w-full mt-5 bg-yellow-400 text-gray-900 py-3 rounded-xl font-bold text-sm hover:bg-yellow-300 transition-colors disabled:opacity-60"
              >
                {placing ? 'Placing Order...' : `Place Order — ₹${summary?.grandTotal?.toLocaleString()}`}
              </button>

              <p className="text-xs text-center text-gray-400 mt-3">
                🔒 Secure checkout. Your data is safe.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}