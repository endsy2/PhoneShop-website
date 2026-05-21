# Database Migration Instructions

## Problem
The `orders` table has a `status` column with ENUM type that only allows these values:
- `'pending'`
- `'completed'`
- `'shipping'`
- `'delivered'`

When trying to set status to `'canceled'`, the database throws an error:
```
Data truncated for column 'status' at row 1
```

## Solution
You need to add `'canceled'` to the ENUM values.

## How to Run the Migration

### Option 1: Using MySQL Command Line
1. Open your MySQL command line or MySQL Workbench
2. Connect to your database
3. Run this command:

```sql
ALTER TABLE orders 
MODIFY COLUMN status ENUM('pending', 'completed', 'shipping', 'delivered', 'canceled') 
DEFAULT 'pending';
```

### Option 2: Using phpMyAdmin
1. Open phpMyAdmin
2. Select your database
3. Click on the "SQL" tab
4. Paste the SQL command above
5. Click "Go"

### Option 3: Using MySQL Workbench
1. Open MySQL Workbench
2. Connect to your database
3. Open a new SQL tab
4. Paste the SQL command above
5. Execute the query

## Verify the Change
After running the migration, verify it worked:

```sql
DESCRIBE orders;
```

You should see the `status` column with type:
```
enum('pending','completed','shipping','delivered','canceled')
```

## After Migration
Once the database is updated:
1. Restart your API server (if it's running)
2. Test the "Cancel Order" button in the admin panel
3. Test the "Confirm Payment" button (it was also failing)
4. Verify canceled orders show correctly in both admin and user panels

## What This Fixes
- ✅ Cancel Order button will work
- ✅ Confirm Payment button will work (it was trying to set status to 'Processing')
- ✅ Canceled orders will display with red badge and ❌ icon
- ✅ Order data is preserved (not deleted)
- ✅ Users can see canceled orders in their profile
