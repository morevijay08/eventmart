'use client';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { ShoppingCart, User, Zap, LogOut, Package } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-gray-900 text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <Zap className="text-yellow-400" size={22} />
          EventMart
        </Link>

        {/* Main navigation */}
        <div className="hidden md:flex items-center gap-5 ml-6">
          <Link
            href="/"
            className="text-sm font-semibold hover:text-yellow-400 transition-colors"
          >
            Home
          </Link>
          <Link
            href="/products"
            className="text-sm font-semibold hover:text-yellow-400 transition-colors"
          >
            Products
          </Link>
        </div>

        {/* Search bar */}
        <form
          className="hidden md:flex flex-1 max-w-md mx-8"
          onSubmit={(e) => {
            e.preventDefault();
            const q = e.target.q.value.trim();
            if (q) window.location.href = `/products?search=${q}`;
          }}
        >
          <input
            name="q"
            type="text"
            placeholder="Search phones, laptops, audio..."
            className="w-full bg-white text-gray-900 placeholder:text-gray-500 px-4 py-2 rounded-l-lg text-sm outline-none"
          />
          <button
            type="submit"
            className="bg-yellow-400 text-gray-900 px-4 rounded-r-lg font-semibold text-sm hover:bg-yellow-300"
          >
            Search
          </button>
        </form>

        {/* Right side */}
        <div className="flex items-center gap-5">
          <Link href="/cart" className="flex items-center gap-1 hover:text-yellow-400 transition-colors">
            <ShoppingCart size={20} />
            <span className="hidden md:inline text-sm">Cart</span>
          </Link>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 hover:text-yellow-400 transition-colors"
              >
                <User size={20} />
                <span className="hidden md:inline text-sm">{user.name?.split(' ')[0]}</span>
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white text-gray-800 rounded-lg shadow-xl py-2 z-50">
                  <Link
                    href="/orders"
                    className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50"
                    onClick={() => setMenuOpen(false)}
                  >
                    <Package size={15} /> My Orders
                  </Link>
                  <button
                    onClick={() => { logout(); setMenuOpen(false); }}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-50 w-full text-left"
                  >
                    <LogOut size={15} /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/auth/login"
              className="bg-yellow-400 text-gray-900 px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-yellow-300 transition-colors"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}