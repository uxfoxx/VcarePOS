import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../store/slices/authSlice";
import { ShoppingCart, User, LogOut, Package, Menu, X, Search } from 'lucide-react';

const Header = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, customer } = useSelector((state) => state.auth);
  const { totalItems } = useSelector((state) => state.cart);

  // Menus
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
            {/* Search Icon (Optional Feature Placeholder) */}
            <button className="hidden sm:block text-gray-500 hover:text-primary-600 transition-colors">
              <Search className="w-5 h-5" />
            </button>

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
