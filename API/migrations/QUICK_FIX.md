# 🚨 QUICK FIX - Run This SQL Command

## The Error You're Seeing
```
Error: Data truncated for column 'status' at row 1
```

## Why It's Happening
Your database `orders` table only allows these status values:
- pending
- completed  
- shipping
- delivered

But the code is trying to set status to **"canceled"** which isn't allowed yet.

---

## ✅ THE FIX (Copy and Run This)

### Step 1: Open Your Database Tool
Choose ONE of these:
- MySQL Command Line
- phpMyAdmin
- MySQL Workbench
- Any MySQL client

### Step 2: Copy This EXACT Command
```sql
ALTER TABLE orders 
MODIFY COLUMN status ENUM('pending', 'completed', 'shipping', 'delivered', 'canceled') 
DEFAULT 'pending';
```

### Step 3: Run It
Paste the command and execute it.

### Step 4: Verify (Optional)
```sql
DESCRIBE orders;
```

You should see the status column now includes 'canceled'.

### Step 5: Restart Your API Server
```bash
# Stop the server (Ctrl+C)
# Then restart it
npm run dev
```

---

## ✅ After Running the Command

Everything will work:
- ✅ Cancel Order button will work
- ✅ Confirm Payment button will work  
- ✅ Canceled orders will show in admin panel
- ✅ Canceled orders will show in user profile
- ✅ Order data is preserved (not deleted)

---

## 🎯 Test It

1. Go to admin panel → Orders → Click any order
2. Click "Cancel Order" button (red button in yellow card)
3. Confirm the action
4. Order status should change to "Canceled" with red badge ❌
5. Check user profile → My Orders → Canceled order should appear

---

## Need Help?

If you're not sure how to run SQL commands:

### For phpMyAdmin:
1. Open phpMyAdmin in your browser
2. Click your database name on the left
3. Click "SQL" tab at the top
4. Paste the command
5. Click "Go" button

### For MySQL Command Line:
```bash
mysql -u root -p
# Enter your password
USE your_database_name;
# Paste the ALTER TABLE command
```

---

That's it! Just run that one SQL command and everything will work. 🎉
