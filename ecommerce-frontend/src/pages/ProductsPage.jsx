import { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProducts } from '../store/slices/productsSlice';
import ProductCard from '../components/Products/ProductCard';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, ChevronDown, SlidersHorizontal } from 'lucide-react';

const ProductsPage = () => {
  const dispatch = useDispatch();
  const { products, categories, listLoading, error } = useSelector(state => state.products);
  const location = useLocation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const sortOrder = 'asc'; // Fixed order for minimalist UI

  // Get category from URL
  const selectedCategory = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("category") || "All";
  }, [location.search]);

  // Fetch products once
  useEffect(() => {
    if (products.length === 0) dispatch(fetchProducts());
  }, [dispatch, products.length]);

  // When user changes category from dropdown
  const handleCategoryChange = (category) => {
    const params = new URLSearchParams(location.search);
    if (category === 'All') {
      params.delete('category');
    } else {
      params.set('category', category);
    }
    navigate(`/products?${params.toString()}`);
  };


  useEffect(() => {
    console.log('E-commerce ProductsPage: Products state updated', {
      productsLength: products.length,
      categoriesLength: categories.length,
      listLoading,
      sampleProducts: products.slice(0, 3).map(p => ({
        id: p.id,
        name: p.name,
        stock: p.stock,
        category: p.category
      }))
    });
  }, [products, categories, listLoading]);

  // Seed data products to exclude (demo/sample products)
  const SEED_PRODUCT_IDS = ['PROD-001', 'PROD-002', 'PROD-003'];

  // Filter and sort products with memoization for performance
  const filteredProducts = useMemo(() => {
    if (!products || !Array.isArray(products)) return [];

    return products
      .filter(product => {
        if (!product) return false;

        // Exclude seed data products
        const isNotSeedData = !SEED_PRODUCT_IDS.includes(product.id);

        const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
        const searchLower = (searchTerm || '').toLowerCase();
        const matchesSearch =
          product.name?.toLowerCase().includes(searchLower) ||
          product.description?.toLowerCase().includes(searchLower);
        const hasStock = product.stock > 0; // Only show products with stock available

        return isNotSeedData && matchesCategory && matchesSearch && hasStock;
      })
      .sort((a, b) => {
        let aValue = a[sortBy];
        let bValue = b[sortBy];

        if (sortBy === 'price') {
          aValue = parseFloat(aValue) || 0;
          bValue = parseFloat(bValue) || 0;
        }

        if (sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, selectedCategory, searchTerm, sortBy, sortOrder]);

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 py-8 lg:py-12">

      {/* Editorial Breadcrumb / Minimal Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <nav className="text-sm font-medium text-gray-400 mb-2">
            <span>Home</span> <span className="mx-2">/</span> <span className="text-gray-900">Products</span>
          </nav>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Furniture Collection</h1>
        </div>

        {/* Minimal Search & Sort Utility */}
        <div className="flex items-center gap-6">
          <div className="relative group">
            <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-gray-900 transition-colors" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-6 pb-1 bg-transparent border-b border-gray-200 focus:border-gray-900 text-sm font-medium text-gray-900 placeholder-gray-400 outline-none w-32 focus:w-48 transition-all duration-300"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-500">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-sm font-bold text-gray-900 outline-none cursor-pointer appearance-none pr-4"
              style={{ background: 'url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 20 20\' fill=\'currentColor\'%3E%3Cpath fill-rule=\'evenodd\' d=\'M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z\' clip-rule=\'evenodd\'/%3E%3C/svg%3E") no-repeat right center / 1rem' }}
            >
              <option value="name">Name</option>
              <option value="price">Price</option>
              <option value="createdAt">Newest</option>
            </select>
          </div>
        </div>
      </div>

      {/* Horizontal Category Pills */}
      <div className="flex overflow-x-auto pb-4 mb-8 scrollbar-hide gap-3 border-b border-gray-100" style={{ scrollbarWidth: 'none' }}>
        <button
          onClick={() => handleCategoryChange('All')}
          className={`px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-300 ${selectedCategory === 'All'
            ? 'bg-gray-900 text-white shadow-md'
            : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
        >
          All Items
        </button>
        {categories.map(category => (
          <button
            key={category}
            onClick={() => handleCategoryChange(category)}
            className={`px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-300 ${selectedCategory === category
              ? 'bg-gray-900 text-white shadow-md'
              : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
          >
            {category}
          </button>
        ))}
      </div>

      {listLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="large" />
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Products</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => dispatch(fetchProducts())}
            className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Products Found</h3>
          <p className="text-gray-600">
            {searchTerm ? `No products found for "${searchTerm}"` : 'No products available in this category'}
          </p>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-6">
            <p className="text-gray-600">
              Showing {filteredProducts.length} of {products.length} products
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ProductsPage;