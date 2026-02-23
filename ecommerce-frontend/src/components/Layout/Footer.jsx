import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { Facebook, Instagram, Twitter, MapPin, Phone, Mail } from 'lucide-react';
import { invoiceSettingsApi } from '../../api/apiClient';

const Footer = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, loading: authLoading } = useSelector(state => state.auth);
  const { categories, loading } = useSelector(state => state.products);

  const [invoiceInfo, setInvoiceInfo] = useState(null);

  useEffect(() => {
    invoiceSettingsApi.getInvoiceInfo()
      .then(data => setInvoiceInfo(data))
      .catch(() => { }); // fail silently — footer still renders fine
  }, []);

  const handleLogout = () => {
    if (!authLoading) {
      dispatch(logout());
    }
  };

  const displayCategories =
    !loading && categories && categories.length > 0
      ? categories.slice(0, 4)
      : ['Tables', 'Chairs', 'Storage'];

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main footer body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* ── Column 1: Brand ── */}
          <div className="sm:col-span-2 lg:col-span-1">
            <img
              alt="VCare Logo"
              className="h-10 object-contain mb-4"
              src="/VCARELogo 1.png"
            />
            <p className="text-gray-400 text-sm leading-relaxed mb-5">
              Premium workspace solutions for Sri Lankan homes and offices. Ergonomic
              chairs, smart desks, and modern furniture with island-wide delivery and
              up to 2-year warranty.
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-3">
              <a
                href="#"
                aria-label="Facebook"
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-800 text-gray-400 hover:bg-primary-600 hover:text-white transition-colors"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-800 text-gray-400 hover:bg-primary-600 hover:text-white transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="#"
                aria-label="Twitter"
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-800 text-gray-400 hover:bg-primary-600 hover:text-white transition-colors"
              >
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* ── Column 2: Quick Links ── */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link
                  to="/products"
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  All Products
                </Link>
              </li>
              {displayCategories.map(category => (
                <li key={category}>
                  <Link
                    to={`/products?category=${encodeURIComponent(category)}`}
                    className="text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    {category}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Column 3: Company ── */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Company
            </h3>
            <ul className="space-y-2.5 mb-5">
              <li>
                <Link to="/about" className="text-gray-400 hover:text-white text-sm transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Visit Showroom
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>

            {/* Contact details — loaded from invoice settings */}
            <div className="space-y-1.5 text-sm text-gray-500">
              {invoiceInfo?.business_address && (
                <p className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-600" />
                  <span>{invoiceInfo.business_address}</span>
                </p>
              )}
              {invoiceInfo?.phone_number && (
                <p className="flex items-center gap-2">
                  <Phone className="w-4 h-4 flex-shrink-0 text-gray-600" />
                  <a href={`tel:${invoiceInfo.phone_number}`} className="hover:text-gray-300 transition-colors">
                    {invoiceInfo.phone_number}
                  </a>
                </p>
              )}
              {invoiceInfo?.email_address && (
                <p className="flex items-center gap-2">
                  <Mail className="w-4 h-4 flex-shrink-0 text-gray-600" />
                  <a href={`mailto:${invoiceInfo.email_address}`} className="hover:text-gray-300 transition-colors">
                    {invoiceInfo.email_address}
                  </a>
                </p>
              )}
            </div>
          </div>

          {/* ── Column 4: Account + Legal ── */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Account
            </h3>
            <ul className="space-y-2.5 mb-6">
              {isAuthenticated ? (
                <>
                  <li>
                    <Link to="/profile" className="text-gray-400 hover:text-white text-sm transition-colors">
                      My Profile
                    </Link>
                  </li>
                  <li>
                    <Link to="/orders" className="text-gray-400 hover:text-white text-sm transition-colors">
                      My Orders
                    </Link>
                  </li>
                  <li>
                    <button
                      onClick={handleLogout}
                      className="text-gray-400 hover:text-white text-sm transition-colors text-left"
                    >
                      Logout
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link to="/login" className="text-gray-400 hover:text-white text-sm transition-colors">
                      Login
                    </Link>
                  </li>
                  <li>
                    <Link to="/register" className="text-gray-400 hover:text-white text-sm transition-colors">
                      Sign Up
                    </Link>
                  </li>
                </>
              )}
            </ul>

            {/* Legal */}
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Legal
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link to="/refund-policy" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Refund &amp; Return Policy
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Terms &amp; Conditions
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-500">
          <p>
            © {new Date().getFullYear()} V Care Services (Private) Limited. All rights reserved.
          </p>
          <p>
            Designed &amp; developed for{' '}
            <a href="https://www.vcaresl.com" className="text-gray-400 hover:text-white transition-colors">
              vcaresl.com
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;