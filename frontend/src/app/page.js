'use client';

import Link from 'next/link';
import { ShoppingBag, ArrowRight, Smartphone, Laptop, Headphones, Camera } from 'lucide-react';

const categories = [
  { label: 'Mobiles', value: 'mobiles', icon: Smartphone },
  { label: 'Laptops', value: 'laptops', icon: Laptop },
  { label: 'Audio', value: 'audio', icon: Headphones },
  { label: 'Cameras', value: 'cameras', icon: Camera },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <section className="bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-6 py-20 md:py-28">
          <div className="max-w-3xl">
            <p className="text-yellow-400 font-semibold text-sm uppercase tracking-wider mb-3">
              Welcome to EventMart
            </p>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              Shop your favourite electronics in one place.
            </h1>
            <p className="text-gray-300 text-lg mt-5 max-w-2xl">
              Browse mobiles, laptops, audio devices, cameras and more.
            </p>

            <div className="flex flex-wrap gap-3 mt-8">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 bg-yellow-400 text-gray-900 px-6 py-3 rounded-xl font-bold hover:bg-yellow-300 transition-colors"
              >
                <ShoppingBag size={18} />
                Browse Products
                <ArrowRight size={17} />
              </Link>

              <Link
                href="/cart"
                className="inline-flex items-center gap-2 border border-gray-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors"
              >
                View Cart
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Shop by Category</h2>
            <p className="text-gray-500 text-sm mt-1">Find products quickly.</p>
          </div>
          <Link href="/products" className="text-sm font-semibold text-blue-600 hover:underline">
            View all
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map(({ label, value, icon: Icon }) => (
            <Link
              key={value}
              href={`/products?category=${value}`}
              className="bg-white border border-gray-100 rounded-xl p-6 hover:shadow-md transition-shadow"
            >
              <Icon size={28} className="text-gray-700 mb-4" />
              <h3 className="font-semibold text-gray-900">{label}</h3>
              <p className="text-xs text-gray-400 mt-1">Explore {label.toLowerCase()}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-16">
        <div className="bg-white border border-gray-100 rounded-2xl p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Ready to shop?</h2>
            <p className="text-gray-500 text-sm mt-1">
              Browse the available products and start your order.
            </p>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center justify-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-700 transition-colors"
          >
            Explore Products <ArrowRight size={17} />
          </Link>
        </div>
      </section>
    </main>
  );
}
