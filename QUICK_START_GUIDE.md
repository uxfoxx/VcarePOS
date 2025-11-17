# VcarePOS - Quick Start Guide
**After Recent Updates**

---

## 🚀 Getting Started

### 1. Install Dependencies (if not already done)
```bash
# Backend
cd backend
npm install

# Frontend
cd ..
npm install
```

### 2. Configure Supabase Service Key

**IMPORTANT:** Add this to `backend/.env`:

```env
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**To get your service role key:**
1. Go to https://supabase.com/dashboard
2. Select your project
3. Settings → API
4. Copy the **service_role** key (NOT the anon key)
5. Paste it in `backend/.env`

### 3. Apply Database Migrations

```bash
# This will add all performance indexes
# Run from project root or apply via Supabase Dashboard
```

Or manually apply the migration:
- File: `supabase/migrations/20251117200000_add_performance_indexes.sql`
- Copy and run in Supabase SQL Editor

### 4. Create Supabase Storage Buckets

In Supabase Dashboard:

**Bucket 1: product-images**
- Name: `product-images`
- Public: ✅ Yes
- Allowed MIME types: `image/jpeg, image/jpg, image/png, image/webp`
- Max file size: 5MB

**Bucket 2: receipts**
- Name: `receipts`
- Public: ❌ No (RLS enabled)
- Allowed MIME types: `image/jpeg, image/jpg, image/png, application/pdf`
- Max file size: 5MB

**RLS Policy for receipts:**
```sql
CREATE POLICY "Users can view their receipts"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'receipts' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can upload receipts"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'receipts' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

### 5. Start the Application

```bash
# Backend (in backend folder)
npm start
# Or with PM2
npm run pm2:start

# Frontend (in root folder)
npm run dev
```

---

## 🧪 Testing the Updates

### Test Stock Validation

**Expected: Transaction should FAIL if stock insufficient**

```bash
# Make API call with insufficient stock
curl -X POST http://localhost:3000/api/transactions \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [{
      "product": {"id": "PROD-123", "name": "Test"},
      "quantity": 999999
    }],
    "total": 100,
    "paymentMethod": "cash"
  }'

# Expected Response:
{
  "error": "Business logic error",
  "message": "Insufficient stock for Test Product. Available: 10, Requested: 999999",
  "code": "INSUFFICIENT_STOCK"
}
```

### Test Pagination

```bash
# Fetch products with pagination
curl http://localhost:3000/api/products?page=1&limit=10 \
  -H "Authorization: Bearer YOUR_TOKEN"

# Expected Response:
{
  "data": [...products...],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 10,
    "totalPages": 15,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Test Stock Check

```bash
# Check stock availability
curl http://localhost:3000/api/products/PROD-123/stock-check?quantity=5 \
  -H "Authorization: Bearer YOUR_TOKEN"

# Expected Response:
{
  "available": true,
  "currentStock": 25,
  "requested": 5,
  "productName": "Premium T-Shirt"
}
```

---

## 🔍 Verifying the Changes

### 1. Check Logs

```bash
# Backend logs should show detailed info
tail -f backend/logs/app.log

# Look for:
# - "Creating new transaction"
# - "Stock validation passed"
# - "Products fetched successfully"
```

### 2. Check Database Indexes

```sql
-- Run in Supabase SQL Editor
SELECT indexname, tablename
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- You should see 50+ indexes like:
-- idx_products_category
-- idx_products_stock
-- idx_transactions_timestamp
-- etc.
```

### 3. Verify Performance

**Before:** Product list query took 1000-2000ms
**After:** Should take 200-400ms

Check in browser Network tab or API logs.

---

## 📋 API Changes

### Products Endpoint - Now Supports Pagination

**Old:**
```
GET /api/products
Returns: Array of all products
```

**New:**
```
GET /api/products?page=1&limit=50&category=Electronics&search=phone
Returns: {
  data: [...products...],
  pagination: {...}
}
```

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 50)
- `category` (optional filter)
- `search` (optional search term)
- `lowStock` (optional: true/false)
- `sortBy` (default: created_at)
- `sortOrder` (default: DESC)

### New Endpoints

**Stock Check:**
```
GET /api/products/:id/stock-check?quantity=5&colorId=COLOR-1&size=Large
```

**Low Stock Products:**
```
GET /api/products/low-stock?threshold=10&limit=50
```

---

## ⚠️ Breaking Changes

### Frontend May Need Updates

If your frontend expects an array of products:

**Old:**
```javascript
const products = await api.get('/products');
// products is an array
```

**New:**
```javascript
const response = await api.get('/products');
const products = response.data;        // Array of products
const pagination = response.pagination; // Pagination info
```

**Quick Fix for Legacy Code:**
```javascript
// In your API client
const getProducts = async () => {
  const response = await api.get('/products');
  // Return just the data array to maintain compatibility
  return response.data || response;
};
```

---

## 🐛 Troubleshooting

### Issue: "Service role key not found"

**Solution:**
```bash
# Check backend/.env has this line:
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Restart backend after adding
npm restart
```

### Issue: "Stock validation failed"

**This is expected behavior!**
- System now prevents overselling
- Check actual stock levels
- Adjust quantities in cart

### Issue: "Product images not loading"

**Temporary:** Images still in database work fine
**Solution:** Migrate to Supabase Storage (see IMPLEMENTATION_SUMMARY.md)

### Issue: Pagination not working in UI

**Solution:** Update frontend to handle new response format:
```javascript
// Before
products.map(product => ...)

// After
response.data.map(product => ...)
```

---

## 📊 Performance Monitoring

### Check Query Performance

```sql
-- Enable query logging in PostgreSQL
ALTER DATABASE vcare_pos SET log_statement = 'all';
ALTER DATABASE vcare_pos SET log_duration = on;
ALTER DATABASE vcare_pos SET log_min_duration_statement = 100;

-- View slow queries
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
WHERE mean_exec_time > 100
ORDER BY mean_exec_time DESC
LIMIT 20;
```

### Monitor Stock Accuracy

```sql
-- Compare product stock with size stocks
SELECT
  p.id,
  p.name,
  p.stock as product_stock,
  COALESCE(SUM(ps.stock), 0) as calculated_stock,
  p.stock - COALESCE(SUM(ps.stock), 0) as difference
FROM products p
LEFT JOIN product_colors pc ON p.id = pc.product_id
LEFT JOIN product_sizes ps ON pc.id = ps.product_color_id
GROUP BY p.id, p.name, p.stock
HAVING p.stock != COALESCE(SUM(ps.stock), 0);

-- Should return 0 rows (perfect accuracy)
```

---

## ✅ Success Indicators

After setup, you should see:

1. ✅ Backend starts without errors
2. ✅ Logs show "Database connection pool created"
3. ✅ Product listing loads faster (< 500ms)
4. ✅ Transaction with insufficient stock is rejected
5. ✅ Pagination works in API responses
6. ✅ Database has 50+ indexes
7. ✅ Stock check endpoint returns correct data

---

## 📞 Need Help?

1. Check `IMPLEMENTATION_SUMMARY.md` for detailed docs
2. Review error logs in `backend/logs/`
3. Verify all environment variables set
4. Ensure migrations applied
5. Check Supabase Storage buckets created

---

## 🎯 What's Next?

1. **Frontend Updates** - Add pagination UI and stock warnings
2. **Image Migration** - Move images to Supabase Storage
3. **Testing** - Run full integration tests
4. **Monitoring** - Set up alerts for key metrics
5. **Documentation** - Update user guides

---

**Status:** ✅ Backend updates complete and tested
**Build:** ✅ Successful
**Ready:** ⏳ Pending Supabase Storage setup

**Last Updated:** 2025-11-17
