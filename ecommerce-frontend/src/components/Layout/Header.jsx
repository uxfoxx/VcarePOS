import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../store/slices/authSlice";

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

  // Navigation Links (reusable)
  const navLinks = [
    { label: "Home", to: "/" },
    { label: "Products", to: "/products" },
    { label: `Cart${totalItems > 0 ? ` (${totalItems})` : ""}`, to: "/cart" },
  ];

  const authLinks = [
    { label: "Login", to: "/login" },
    { label: "Sign Up", to: "/register", bold: true },
  ];

  const userMenu = [
    { label: "Profile", to: "/profile" },
    { label: "My Orders", to: "/orders" },
    { label: "Logout", action: "logout" }, // special action
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

          {/* User + Mobile */}
          <div className="flex items-center space-x-4">
            {/* Authenticated User */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen((prev) => !prev)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition"
                >
                  <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {customer?.firstName?.[0]}
                      {customer?.lastName?.[0]}
                    </span>
                  </div>
                  <span className="hidden md:block">{customer?.firstName}</span>
                </button>

                {/* User dropdown */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    {userMenu.map((item) =>
                      item.to ? (
                        // Normal Link Items
                        <Link
                          key={item.label}
                          to={item.to}
                          onClick={closeAllMenus}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary-600 font-medium"
                        >
                          {item.label}
                        </Link>
                      ) : (
                        // Action Items (Logout)
                        <button
                          key={item.label}
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm font-bold hover:text-primary-600 hover:bg-gray-100 text-red-600"
                        >
                          {item.label}
                        </button>
                      )
                    )}
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
              className="md:hidden text-gray-700 hover:text-primary-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
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
