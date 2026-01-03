# VCare E-commerce Frontend

A modern, customer-facing e-commerce application for the VCare POS System. Built with React, Redux Toolkit, and Vite for a fast and responsive shopping experience.

## Overview

The E-commerce Frontend provides customers with an intuitive online shopping experience, featuring:

- Browse products with filtering and search
- View product details with variants (colors, sizes)
- Shopping cart functionality
- User registration and authentication with OTP verification
- Secure checkout process
- Multiple payment methods (Cash on Delivery, Bank Transfer)
- Order tracking and history
- Customer profile management
- Responsive design for mobile and desktop

## Technology Stack

- **Framework**: React 18 with Hooks
- **State Management**: Redux Toolkit with Redux Saga
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Routing**: React Router v6
- **Authentication**: Supabase Auth with OTP
- **API Integration**: Axios/Fetch

## Features

### Shopping Experience
- Product catalog with categories
- Product search and filtering
- Color and size variant selection
- Product image gallery
- Add to cart with quantity selection
- Persistent shopping cart
- Real-time stock availability

### User Management
- Email-based registration with OTP verification
- Secure login/logout
- Customer profile management
- Password change functionality
- Order history tracking

### Checkout Process
- Shopping cart review
- Delivery address input
- Delivery charge calculation based on location
- Multiple payment methods:
  - Cash on Delivery
  - Bank Transfer (with receipt upload)
- Order confirmation
- Email notifications

### Order Management
- View all past orders
- Track order status
- Download invoices
- Order details with item breakdown

## Prerequisites

- Node.js v18 or higher
- npm or yarn
- Backend API running (VCare POS Backend)
- Supabase project for authentication

## Installation

### 1. Install Dependencies

```bash
cd ecommerce-frontend
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the `ecommerce-frontend` directory:

```env
# Backend API URL
VITE_API_URL=http://localhost:3000/api

# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

**Getting Supabase Credentials:**
1. Go to your Supabase project dashboard
2. Navigate to **Project Settings** > **API**
3. Copy the **URL** and **anon/public** key

### 3. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5174`

### 4. Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Project Structure

```
ecommerce-frontend/
├── src/
│   ├── pages/              # Page components
│   │   ├── HomePage.jsx    # Landing page
│   │   ├── ProductsPage.jsx # Product listing
│   │   ├── ProductDetailPage.jsx # Single product
│   │   ├── CartPage.jsx    # Shopping cart
│   │   ├── CheckoutPage.jsx # Checkout flow
│   │   ├── LoginPage.jsx   # Login/Register
│   │   ├── OrdersPage.jsx  # Order history
│   │   ├── ProfilePage.jsx # User profile
│   │   └── ...
│   │
│   ├── components/         # Reusable components
│   │   ├── Layout/        # Layout components
│   │   │   ├── Header.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── MainLayout.jsx
│   │   ├── Products/      # Product components
│   │   │   └── ProductCard.jsx
│   │   ├── Orders/        # Order components
│   │   │   └── EcommerceInvoiceModal.jsx
│   │   └── Common/        # Common UI components
│   │
│   ├── store/             # Redux store
│   │   ├── index.js       # Store configuration
│   │   ├── slices/        # Redux slices
│   │   │   ├── authSlice.js
│   │   │   ├── cartSlice.js
│   │   │   ├── productsSlice.js
│   │   │   └── ordersSlice.js
│   │   └── sagas/         # Redux sagas
│   │       ├── authSaga.js
│   │       ├── productsSaga.js
│   │       └── ordersSaga.js
│   │
│   ├── utils/            # Utility functions
│   │   ├── supabaseClient.js
│   │   └── apiClient.js
│   │
│   ├── App.jsx           # Main app component
│   ├── main.jsx          # Entry point
│   └── index.css         # Global styles
│
├── public/               # Static assets
│   ├── favicon.ico
│   ├── VCARELogo 1.png
│   └── ...
│
├── .env                  # Environment variables (create this)
├── .env.example          # Environment template
├── package.json
├── vite.config.js        # Vite configuration
└── README.md            # This file
```

## User Flow

### 1. Registration & Login

**New Customer Registration:**
1. Click "Register" on the login page
2. Enter name, email, phone number, and password
3. Receive OTP code via email
4. Enter OTP code to verify account
5. Account is created and auto-logged in

**Existing Customer Login:**
1. Enter email and password
2. Click "Login"
3. Redirected to home page

### 2. Shopping

**Browse Products:**
1. View featured products on home page
2. Navigate to "Products" page for full catalog
3. Filter by category
4. Search by product name
5. Click product card to view details

**Add to Cart:**
1. On product detail page, select:
   - Color (if available)
   - Size (if available)
   - Quantity
2. Click "Add to Cart"
3. Continue shopping or proceed to cart

### 3. Checkout

**Review Cart:**
1. Click cart icon in header
2. Review items, quantities, and prices
3. Update quantities or remove items
4. Click "Proceed to Checkout"

**Complete Order:**
1. Enter delivery address
2. View calculated delivery charge
3. Review order summary
4. Select payment method:
   - **Cash on Delivery**: No additional action
   - **Bank Transfer**: Upload payment receipt
5. Click "Place Order"
6. Receive order confirmation

### 4. Order Tracking

1. Navigate to "My Orders" page
2. View all past orders
3. Click order to view details
4. Track order status:
   - Pending
   - Confirmed
   - Processing
   - Shipped
   - Delivered
5. Download invoice (PDF)

## Payment Methods

### Cash on Delivery (COD)

- Pay when you receive the order
- Available for all orders
- No upfront payment required

### Bank Transfer

- Upload proof of payment during checkout
- Supported formats: JPG, PNG, PDF (max 5MB)
- Order confirmed after payment verification
- Bank details provided during checkout

## API Integration

The frontend communicates with the backend API:

### Public Endpoints (No Authentication)

- `GET /api/ecommerce/products` - Get all products
- `GET /api/ecommerce/products/:id` - Get product details
- `GET /api/ecommerce/categories` - Get categories
- `POST /api/ecommerce/auth/register` - Register customer
- `POST /api/ecommerce/auth/verify-otp` - Verify OTP
- `POST /api/ecommerce/orders` - Create order

### Authenticated Endpoints

- `GET /api/ecommerce/orders/customer/:email` - Get customer orders
- `PUT /api/auth/change-password` - Change password
- `GET /api/auth/me` - Get current user

## State Management

### Redux Store Structure

```javascript
{
  auth: {
    user: {...},
    isAuthenticated: boolean,
    loading: boolean
  },
  cart: {
    items: [...],
    total: number
  },
  products: {
    items: [...],
    loading: boolean,
    selectedProduct: {...}
  },
  orders: {
    items: [...],
    loading: boolean
  }
}
```

### Shopping Cart Persistence

The cart is persisted in `localStorage` to survive page refreshes:

```javascript
// Cart saved automatically on changes
localStorage.setItem('cart', JSON.stringify(cartItems))

// Cart loaded on app initialization
const savedCart = localStorage.getItem('cart')
```

## Styling

The application uses Tailwind CSS for styling:

### Color Scheme

- Primary: Teal/Blue (`teal-600`, `blue-600`)
- Background: White/Gray (`gray-50`, `gray-100`)
- Text: Dark Gray (`gray-900`, `gray-700`)
- Accents: Green for success, Red for errors

### Responsive Breakpoints

- Mobile: `< 640px`
- Tablet: `640px - 1024px`
- Desktop: `> 1024px`

### Custom Components

- Toast notifications for user feedback
- Loading spinners
- Error boundaries
- Product cards with hover effects
- Responsive navigation

## Development

### Running Development Server

```bash
npm run dev
```

### Building for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Linting

```bash
npm run lint
```

## Deployment

### PM2 Deployment

Build and serve with PM2:

```bash
# Build the application
npm run build

# Serve with PM2 on port 3002
npx pm2 start "npx serve -s dist -p 3002" --name vcare-ecommerce-frontend

# Manage the process
npx pm2 status
npx pm2 logs vcare-ecommerce-frontend
npx pm2 restart vcare-ecommerce-frontend
npx pm2 stop vcare-ecommerce-frontend
```

### Static Hosting

The built files in `dist/` can be deployed to:
- Netlify
- Vercel
- GitHub Pages
- AWS S3 + CloudFront
- Any static hosting service

**Important Configuration:**

For single-page applications, configure redirects:

**Netlify** (`public/_redirects`):
```
/*    /index.html   200
```

**Apache** (`public/.htaccess`):
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

## Environment Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| VITE_API_URL | Backend API base URL | Yes | `http://localhost:3000/api` |
| VITE_SUPABASE_URL | Supabase project URL | Yes | `https://xxx.supabase.co` |
| VITE_SUPABASE_ANON_KEY | Supabase anonymous key | Yes | `eyJhbGc...` |

## Troubleshooting

### API Connection Issues

**Error**: "Network Error" or "Failed to fetch"

**Solutions**:
1. Verify `VITE_API_URL` in `.env`
2. Ensure backend is running on the correct port
3. Check CORS configuration in backend
4. Check browser console for detailed errors

### Authentication Issues

**Error**: "Invalid token" or "Authentication failed"

**Solutions**:
1. Clear browser localStorage: `localStorage.clear()`
2. Verify Supabase credentials in `.env`
3. Check if user exists in database
4. Ensure JWT_SECRET matches backend

### Cart Not Persisting

**Issue**: Cart items disappear on refresh

**Solutions**:
1. Check browser localStorage is enabled
2. Verify cart persistence code in `cartSlice.js`
3. Check browser console for errors
4. Try different browser

### Images Not Loading

**Issue**: Product images show broken links

**Solutions**:
1. Verify image URLs in database
2. Check Supabase storage configuration
3. Ensure images are publicly accessible
4. Check network tab in browser DevTools

### Build Failures

**Error**: Build fails or module not found

**Solutions**:
1. Delete `node_modules` and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```
2. Clear Vite cache:
   ```bash
   rm -rf node_modules/.vite
   ```
3. Check for syntax errors in code
4. Verify all imports are correct

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Optimization

- Code splitting with React.lazy()
- Image lazy loading
- Production build minification
- Tree shaking unused code
- Gzip compression in production

## Security Considerations

1. **Never expose sensitive data** in client-side code
2. **Validate all user inputs** before sending to API
3. **Use HTTPS** in production
4. **Store tokens securely** (Supabase handles this)
5. **Implement CSRF protection** on backend
6. **Sanitize user-generated content**

## Testing

### Manual Testing Checklist

- [ ] User can register with OTP verification
- [ ] User can login and logout
- [ ] Products load and display correctly
- [ ] Product search and filtering work
- [ ] Add to cart functionality works
- [ ] Cart persists on page refresh
- [ ] Checkout process completes successfully
- [ ] Orders appear in order history
- [ ] Invoice download works
- [ ] Responsive design on mobile devices

## Future Enhancements

- Product reviews and ratings
- Wishlist functionality
- Product recommendations
- Live chat support
- Social media integration
- Payment gateway integration (Stripe, PayPal)
- Guest checkout option
- Order cancellation
- Advanced search with filters
- Product comparison

## Additional Resources

- [Main Project Documentation](../README.md)
- [Backend API Documentation](../backend/README.md)
- [React Documentation](https://react.dev/)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Vite Documentation](https://vitejs.dev/)

## Support

For issues or questions:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review browser console for errors
3. Check backend API is running and accessible
4. Contact the development team

## License

Proprietary - VCare POS System
