import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../store/slices/authSlice";
import { ShoppingCart, User, LogOut, Package, Menu, X, Search, Loader2 } from 'lucide-react';
import { productsApi } from "../../api/apiClient";

const Header = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, customer } = useSelector((state) => state.auth);
  const { totalItems } = useSelector((state) => state.cart);

  // Menus
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const searchRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  // Handle outside click to close search
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle live search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearchLoading(true);
      try {
        const results = await productsApi.search(searchQuery);
        setSearchResults(results || []);
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setIsSearchLoading(false);
      }
    }, 300);

    return () => clearTimeout(searchTimeoutRef.current);
  }, [searchQuery]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
    closeAllMenus();
  };

  const closeAllMenus = () => {
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
  };

  // Navigation Links
  const navLinks = [
    { label: "Home", to: "/" },
    { label: "Products", to: "/products" },
    { label: "About Us", to: "/about" },
  ];

  const authLinks = [
    { label: "Login", to: "/login" },
    { label: "Sign Up", to: "/register", bold: true },
  ];

  const userMenu = [
    { label: "Profile", to: "/profile", icon: User },
    { label: "My Orders", to: "/orders", icon: Package },
    { label: "Logout", action: "logout", icon: LogOut, danger: true },
  ];

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="mx-auto sm:px-6 lg:px-[100px]">
        <div className="flex justify-between items-center h-[90px] px-4 sm:px-0">
          {/* Logo */}
          <Link to="/" onClick={closeAllMenus} className="flex items-center">
            <img src="/VCARELogo 1.png" alt="VCare Logo" className="h-[40px]" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={closeAllMenus}
                className="text-gray-700 hover:text-primary-600 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* User + Mobile + Cart */}
          <div className="flex items-center space-x-5">
            {/* Search */}
            <div className="relative" ref={searchRef}>
              <div className={`flex items-center transition-all duration-300 ${isSearchOpen ? 'w-[200px] sm:w-[300px]' : 'w-10'}`}>
                {isSearchOpen ? (
                  <div className="relative w-full">
                    <input
                      type="text"
                      autoFocus
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-primary-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all bg-white"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    {isSearchLoading && (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-500 animate-spin" />
                    )}
                    <button
                      onClick={() => {
                        setIsSearchOpen(false);
                        setSearchQuery("");
                      }}
                      className="absolute -right-8 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsSearchOpen(true)}
                    className="p-2 text-gray-500 hover:text-primary-600 transition-colors"
                  >
                    <Search className="w-6 h-6" />
                  </button>
                )}
              </div>

              {/* Search Results Dropdown */}
              {isSearchOpen && (searchQuery.trim() !== "" || isSearchLoading) && (
                <div className="fixed sm:absolute left-4 right-4 sm:left-auto sm:right-0 top-[90px] sm:top-full mt-0 sm:mt-3 w-auto sm:w-[400px] bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                  {isSearchLoading ? (
                    <div className="p-8 text-center text-gray-500">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-primary-500" />
                      <p className="text-sm">Finding products...</p>
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="max-h-[70vh] overflow-y-auto custom-scrollbar">
                      <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Results ({searchResults.length})</span>
                      </div>
                      {searchResults.map((product) => {
                        const hasColors = product.colors && product.colors.length > 0;
                        const displayImage = hasColors && product.colors[0].productImageInColor
                          ? product.colors[0].productImageInColor
                          : product.image;

                        const imageUrl = displayImage?.startsWith('http')
                          ? displayImage
                          : `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}${displayImage?.startsWith('/') ? displayImage : `/${displayImage}`}`;

                        return (
                          <Link
                            key={product.id}
                            to={`/products/${product.id}`}
                            onClick={() => {
                              setIsSearchOpen(false);
                              setSearchQuery("");
                            }}
                            className="flex items-center p-3 hover:bg-primary-50 border-b border-gray-50 last:border-0 transition-colors group"
                          >
                            <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-100 flex-shrink-0 bg-gray-50">
                              <img
                                src={imageUrl}
                                alt={product.name}
                                className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                onError={(e) => { e.target.src = "/placeholder-product.png"; }}
                              />
                            </div>
                            <div className="ml-3 flex-1">
                              <h4 className="text-sm font-bold text-gray-900 line-clamp-1 group-hover:text-primary-600 transition-colors">{product.name}</h4>
                              <p className="text-xs text-gray-500 mb-1">{product.category}</p>
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-extrabold text-primary-600">LKR {product.price?.toLocaleString()}</span>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-tight ${product.stock > 0
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-red-100 text-red-700'
                                  }`}>
                                  {product.stock > 0 ? 'Available' : 'Out of Stock'}
                                </span>
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                      <Link
                        to={`/products?search=${encodeURIComponent(searchQuery)}`}
                        onClick={() => setIsSearchOpen(false)}
                        className="block p-3 text-center text-sm font-bold text-primary-600 hover:bg-primary-50 transition-colors border-t border-gray-100"
                      >
                        View all products
                      </Link>
                    </div>
                  ) : (
                    <div className="p-8 text-center text-gray-500">
                      <Search className="w-12 h-12 text-gray-200 mx-auto mb-2" />
                      <p className="text-sm font-medium">No products found for "{searchQuery}"</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Cart Icon */}
            <Link
              to="/cart"
              onClick={closeAllMenus}
              className="relative text-gray-600 hover:text-primary-600 transition-colors p-2"
            >
              <ShoppingCart className="w-6 h-6" />
              {totalItems > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Authenticated User */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen((prev) => !prev)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition focus:outline-none"
                >
                  <div className="w-9 h-9 bg-primary-50 rounded-full border border-primary-100 flex items-center justify-center transition-colors hover:bg-primary-100">
                    <span className="text-primary-700 text-sm font-bold">
                      {customer?.firstName?.[0]}
                      {customer?.lastName?.[0]}
                    </span>
                  </div>
                  <span className="hidden lg:block font-medium">{customer?.firstName}</span>
                </button>

                {/* User dropdown */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-50 mb-2">
                      <p className="text-sm text-gray-500">Signed in as</p>
                      <p className="text-sm font-semibold text-gray-900 truncate">{customer?.email}</p>
                    </div>
                    {userMenu.map((item) => {
                      const IconComponent = item.icon;
                      if (item.to) {
                        return (
                          <Link
                            key={item.label}
                            to={item.to}
                            onClick={closeAllMenus}
                            className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600 transition-colors"
                          >
                            <IconComponent className="w-4 h-4 mr-3 text-gray-400" />
                            <span className="font-medium">{item.label}</span>
                          </Link>
                        );
                      }
                      return (
                        <button
                          key={item.label}
                          onClick={handleLogout}
                          className="flex items-center w-full text-left px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors mt-1 border-t border-gray-50 pt-3"
                        >
                          <IconComponent className="w-4 h-4 mr-3" />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center space-x-4">
                {authLinks.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={closeAllMenus}
                    className={`text-gray-700 hover:text-primary-600 transition ${item.bold ? "font-bold" : "font-medium"
                      }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className="md:hidden text-gray-700 hover:text-primary-600 p-2"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200">
            <div className="flex flex-col">
              {navLinks.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={closeAllMenus}
                  className="text-gray-700 hover:text-primary-600 transition hover:bg-gray-100 px-3 py-2 rounded-md"
                >
                  {item.label}
                </Link>
              ))}

              {!isAuthenticated &&
                authLinks.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={closeAllMenus}
                    className={`text-gray-700 hover:text-primary-600 transition hover:bg-gray-100 px-3 py-2 rounded-md ${item.bold ? "font-bold" : ""
                      }`}
                  >
                    {item.label}
                  </Link>
                ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
