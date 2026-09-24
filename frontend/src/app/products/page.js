'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import API from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { SlidersHorizontal, X } from 'lucide-react';

const CATEGORIES = [
  { key: '',            label: 'All' },
  { key: 'mobiles',     label: 'Mobiles' },
  { key: 'laptops',     label: 'Laptops' },
  { key: 'audio',       label: 'Audio' },
  { key: 'cameras',     label: 'Cameras' },
  { key: 'tablets',     label: 'Tablets' },
  { key: 'televisions', label: 'Televisions' },
  { key: 'accessories', label: 'Accessories' }
];

const BRANDS = ['Apple', 'Samsung', 'Sony', 'Dell', 'Lenovo', 'OnePlus', 'Canon', 'LG', 'JBL', 'boAt', 'Logitech', 'Realme'];

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const { user }     = useAuth();
  const router       = useRouter();

  const [products, setProducts]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [pagination, setPagination] = useState({});
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    brand:    searchParams.get('brand')    || '',
    minPrice: '',
    maxPrice: '',
    sort:     'newest',
    page:     1
  });

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const search = searchParams.get('search');
      let res;

      if (search) {
        res = await API.get(`/api/products/search?q=${search}`);
        setProducts(res.data.products || []);
      } else {
        const params = new URLSearchParams();
        if (filters.category) params.append('category', filters.category);
        if (filters.brand)    params.append('brand',    filters.brand);
        if (filters.minPrice) params.append('minPrice', filters.minPrice);
        if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
        if (filters.sort)     params.append('sort',     filters.sort);
        params.append('page',  filters.page);
        params.append('limit', 12);

        res = await API.get(`/api/products?${params.toString()}`);
        setProducts(res.data.products || []);
        setPagination(res.data.pagination || {});
      }
    } catch (err) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (productId) => {
    if (!user) { router.push('/auth/login'); return; }
    try {
      await API.post('/api/cart/add', { productId, quantity: 1 });
      toast.success('Added to cart!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add');
    }
  };

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({ category: '', brand: '', minPrice: '', maxPrice: '', sort: 'newest', page: 1 });
  };

  const hasActiveFilters = filters.category || filters.brand || filters.minPrice || filters.maxPrice;

  return (
    <div className="flex gap-6">

      {/* Sidebar Filters — desktop */}
      <aside className="hidden md:block w-56 flex-shrink-0">
        <div className="bg-white rounded-xl border border-gray-100 p-5 sticky top-20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800 text-sm">Filters</h3>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="text-xs text-red-500 hover:underline flex items-center gap-1">
                <X size={12} /> Clear
              </button>
            )}
          </div>

          {/* Category */}
          <div className="mb-5">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Category</p>
            <div className="space-y-1">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.key}
                  onClick={() => updateFilter('category', cat.key)}
                  className={`w-full text-left text-sm px-3 py-1.5 rounded-lg transition-colors
                    ${filters.category === cat.key
                      ? 'bg-gray-900 text-white font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                    }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Brand */}
          <div className="mb-5">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Brand</p>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {BRANDS.map(brand => (
                <button
                  key={brand}
                  onClick={() => updateFilter('brand', filters.brand === brand ? '' : brand)}
                  className={`w-full text-left text-sm px-3 py-1.5 rounded-lg transition-colors
                    ${filters.brand === brand
                      ? 'bg-gray-900 text-white font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                    }`}
                >
                  {brand}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="mb-5">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Price Range (₹)</p>
            <div className="space-y-2">
              <input
                type="number"
                placeholder="Min price"
                value={filters.minPrice}
                onChange={e => updateFilter('minPrice', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-900"
              />
              <input
                type="number"
                placeholder="Max price"
                value={filters.maxPrice}
                onChange={e => updateFilter('maxPrice', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1">

        {/* Top bar */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {searchParams.get('search')
                ? `Results for "${searchParams.get('search')}"`
                : filters.category
                  ? filters.category.charAt(0).toUpperCase() + filters.category.slice(1)
                  : 'All Products'
              }
            </h1>
            {pagination.total && (
              <p className="text-sm text-gray-400 mt-0.5">{pagination.total} products found</p>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Mobile filter toggle */}
            <button
              className="md:hidden flex items-center gap-2 text-sm border border-gray-200 px-3 py-2 rounded-lg"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal size={15} /> Filters
            </button>

            {/* Sort */}
            <select
              value={filters.sort}
              onChange={e => updateFilter('sort', e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-900 bg-white"
            >
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Best Rated</option>
            </select>
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl h-72 animate-pulse border border-gray-100" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🔍</p>
            <p className="text-gray-500 font-medium">No products found</p>
            <button onClick={clearFilters} className="mt-4 text-blue-600 text-sm hover:underline">
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {products.map(p => (
              <ProductCard key={p._id} product={p} onAddToCart={handleAddToCart} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {[...Array(pagination.pages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setFilters(prev => ({ ...prev, page: i + 1 }))}
                className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors
                  ${filters.page === i + 1
                    ? 'bg-gray-900 text-white'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}