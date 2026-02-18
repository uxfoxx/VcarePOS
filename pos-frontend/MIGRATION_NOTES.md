# Database Migration Notes

## Required Migrations

### 1. Add Delivery Fields to E-commerce Orders (PostgreSQL)

**File needed:** `supabase/migrations/20260102145000_add_delivery_to_ecommerce_orders.sql`

```sql
/*
  # Add Delivery Fields to E-commerce Orders

  1. Schema Changes
    - Add `delivery_location` column to `ecommerce_orders` table
    - Add `delivery_charge` column to `ecommerce_orders` table

  2. Purpose
    - Allow e-commerce orders to track delivery location
    - Store delivery charges for each order

  3. Migration Notes
    - Columns are nullable (existing orders don't have delivery info)
    - Backward compatible with existing data
*/

-- Add delivery fields to ecommerce_orders table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ecommerce_orders' AND column_name = 'delivery_location'
  ) THEN
    ALTER TABLE ecommerce_orders ADD COLUMN delivery_location VARCHAR(100);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ecommerce_orders' AND column_name = 'delivery_charge'
  ) THEN
    ALTER TABLE ecommerce_orders ADD COLUMN delivery_charge DECIMAL(10, 2) DEFAULT 0;
  END IF;
END $$;
```

**To apply:** Run `npm run migrate:up` in the `/backend` directory

---

## Existing Migrations Status

### Already Created (Need to Run)

1. **20260102143259_create_delivery_charges_ecommerce.sql** - Creates `delivery_charges` table in Supabase
2. **20260102143500_create_delivery_charges_pos.sql** - Creates `delivery_charges` table in PostgreSQL and adds fields to `transactions` table
3. **20260102144000_add_color_selector_image.sql** - Adds `color_selector_image` column to `product_colors` table

### To Run Migrations

**For Supabase migrations:**
- The `delivery_charges` table has been created automatically in Supabase
- Status: ✅ Already applied

**For PostgreSQL (Backend) migrations:**
```bash
cd backend
npm run migrate:up
```

This will apply:
- Delivery charges POS system
- Color selector image column
- E-commerce order delivery fields (once file is created)

---

## Rollback Migrations

### Color Selector Image Rollback

**File:** `backend/migrations/down/20260102144000_add_color_selector_image_down.sql`

```sql
-- Rollback: Remove color_selector_image column from product_colors

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'product_colors' AND column_name = 'color_selector_image'
  ) THEN
    ALTER TABLE product_colors DROP COLUMN color_selector_image;
  END IF;
END $$;
```

### E-commerce Order Delivery Fields Rollback

**File:** `backend/migrations/down/20260102145000_add_delivery_to_ecommerce_orders_down.sql`

```sql
-- Rollback: Remove delivery fields from ecommerce_orders

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ecommerce_orders' AND column_name = 'delivery_location'
  ) THEN
    ALTER TABLE ecommerce_orders DROP COLUMN delivery_location;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ecommerce_orders' AND column_name = 'delivery_charge'
  ) THEN
    ALTER TABLE ecommerce_orders DROP COLUMN delivery_charge;
  END IF;
END $$;
```

---

## Verification

After running migrations, verify:

```sql
-- Check product_colors has color_selector_image
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'product_colors';

-- Check ecommerce_orders has delivery fields
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'ecommerce_orders';

-- Check delivery_charges table exists
SELECT * FROM delivery_charges LIMIT 5;

-- Check transactions table has delivery fields
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'transactions'
AND column_name LIKE 'delivery%';
```

---

## Important Notes

1. **Database Separation:**
   - Supabase: `delivery_charges` table (for e-commerce frontend display)
   - PostgreSQL: `delivery_charges`, `ecommerce_orders`, `transactions`, `products`, `product_colors` tables

2. **Migration System:**
   - Backend reads migration files from `supabase/migrations/` folder
   - Migrations are tracked in the `migrations` table
   - Only new migrations are applied

3. **Data Safety:**
   - All migrations use `IF NOT EXISTS` / `IF EXISTS` checks
   - Columns are nullable or have defaults
   - No data loss on rollback (columns are dropped, not data)
