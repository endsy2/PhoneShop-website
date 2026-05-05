# Step-by-Step Integration Guide

## Phase 1: Database Setup

### Step 1.1: Run Database Migrations
```bash
# Navigate to API directory
cd API/db

# Run migrations (adjust username/password as needed)
mysql -u root -p phone_shop < migrations.sql
```

**What this does:**
- Creates 7 new tables: product_reviews, review_votes, browsing_history, chat_conversations, chat_messages, and adds reserved_stock to specifications
- Adds indexes for performance optimization
- Sets up all relationships with foreign keys

---

## Phase 2: Backend Verification

### Step 2.1: Verify New Controllers Exist
Check that these files exist in `API/Controllers/common/`:
- ✓ `reviews.js` - Review management
- ✓ `chat.js` - Chat support system  
- ✓ `inventory.js` - Stock management
- ✓ `recommendations.js` - Product recommendations
- ✓ `filtering.js` - Advanced search

### Step 2.2: Verify Routes Updated
Check `API/Routs/Common.js` has all new imports and routes registered:
- Reviews routes (4 endpoints)
- Chat routes (7 endpoints)
- Inventory routes (6 endpoints)
- Recommendations routes (5 endpoints)
- Filtering routes (2 endpoints)

**Total: 22 new endpoints added**

---

## Phase 3: Frontend Setup - User Section

### Step 3.1: Verify Components Created
Check `User-Section/src/Components/`:
- ✓ `ProductReviews.jsx`
- ✓ `ChatSupport.jsx`
- ✓ `AdvancedFiltering.jsx`
- ✓ `ProductRecommendations.jsx`

### Step 3.2: Update ProductCard Component
✓ Already done - ProductCard now includes:
- Real ratings (fallback to seed-based)
- Review count badge
- "Only X left!" inventory warning
- Better stock status display

### Step 3.3: Update RootLayout
✓ Already done - ChatSupport component added to layout

### Step 3.4: Create Advanced Search Page (MANUAL STEP)

Create new file: `User-Section/src/Pages/home/AdvancedSearch.jsx`

```jsx
import React, { useState } from "react";
import axios from "axios";
import AdvancedFiltering from "../../Components/AdvancedFiltering";
import ProductCard from "./ProductCard";

const AdvancedSearch = () => {
  const [results, setResults] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (filters) => {
    setLoading(true);
    try {
      const response = await axios.get(
        "http://localhost:3000/common/search/advanced",
        { 
          params: filters,
          withCredentials: true 
        }
      );
      setResults(response.data.products || []);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Search error:", error);
      alert("Error searching products. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <AdvancedFiltering onSearch={handleSearch} />
      
      {loading && <p className="text-center">Loading...</p>}
      
      {pagination && (
        <p className="mb-4 text-gray-600">
          Found {pagination.totalProducts} products
        </p>
      )}

      {results.length === 0 && !loading && (
        <p className="text-center text-gray-500">No products found. Try different filters!</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {results.map((product) => (
          <ProductCard key={product.spec_id} product={product} />
        ))}
      </div>

      {/* Pagination Controls (if needed) */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {/* Add pagination buttons here */}
        </div>
      )}
    </div>
  );
};

export default AdvancedSearch;
```

### Step 3.5: Add Route to App.jsx (MANUAL STEP)

Edit `User-Section/src/App.jsx`:

```jsx
import AdvancedSearch from "./Pages/home/AdvancedSearch";

// Add this route inside the RootLayout routes:
<Route path="advanced-search" element={<AdvancedSearch />} />
```

### Step 3.6: Update ProductDetail Page (MANUAL STEP)

Edit `User-Section/src/Pages/home/ProductDetail.jsx`:

```jsx
// Add these imports at the top
import ProductReviews from "../../Components/ProductReviews";
import ProductRecommendations from "../../Components/ProductRecommendations";
import axios from "axios";

// Inside component, add to useEffect to track browsing:
useEffect(() => {
  if (selectedItem?.spec_id) {
    axios.post(
      "http://localhost:3000/common/recommendations/track",
      { spec_id: selectedItem.spec_id },
      { withCredentials: true }
    ).catch(err => console.error("Browsing track error:", err));
  }
}, [selectedItem?.spec_id]);

// In the JSX, after product details/price section, add:
<div className="mt-12 border-t pt-8">
  <ProductReviews spec_id={selectedItem.spec_id} />
</div>

<div className="mt-12 border-t pt-8">
  <ProductRecommendations spec_id={selectedItem.spec_id} type="co-viewed" />
  <ProductRecommendations spec_id={selectedItem.spec_id} type="similar-price" />
  <ProductRecommendations spec_id={selectedItem.spec_id} type="top-rated" />
</div>
```

---

## Phase 4: Testing Each Feature

### Test 1: Product Reviews 🌟
1. Go to any product detail page
2. Scroll to "Customer Reviews" section
3. Click "Write a Review"
4. Fill in rating (1-5), title, and comment
5. Click "Submit Review"
6. Verify review appears in list
7. Test voting on a review (helpful/unhelpful)
8. Test filtering by star rating
9. Test sorting options

**Expected Result**: Review appears immediately, can be voted on, filters/sorts work

### Test 2: Chat Support 💬
1. Look for floating chat button (bottom-right corner)
2. Click to open chat
3. Type a message: "Hello, I need help"
4. Click "Send"
5. Message should appear in chat window
6. Close and reopen chat - message should still be there

**Expected Result**: Chat opens, messages send, history persists

### Test 3: Inventory Indicators 📦
1. View product cards on home page
2. Check for:
   - Green "In Stock" badge if stock > 5
   - Orange "Only X left!" if stock ≤ 5
   - Red "Out of Stock" if stock = 0
3. Try adding out-of-stock item to cart - should be disabled

**Expected Result**: Correct stock status shown, buttons disabled appropriately

### Test 4: Product Recommendations 🤖
1. Go to product detail page
2. Scroll to see recommendation sections:
   - "Customers also viewed"
   - "Similar price products"
   - "Top rated in category"
3. Click on a recommended product
4. Verify new product details load
5. Check that your browsing is tracked by viewing "Recommended for You" on another page

**Expected Result**: Recommendations appear, links work, browsing tracked

### Test 5: Advanced Filtering 🔍
1. Navigate to `/advanced-search` route (you'll need to add this link in navbar/menu)
2. Test each filter type:
   - **Search**: Type "iPhone" → should filter by name
   - **Price**: Set min=$500, max=$1000
   - **Processor**: Select a processor
   - **RAM**: Select minimum RAM
   - **In Stock**: Toggle to show only available products
   - **On Sale**: Toggle to show only discounted products
3. Test sort options: price low-to-high, high-to-low, rating, newest
4. Combine multiple filters (e.g., price + processor + stock)
5. Click "Reset" to clear all filters

**Expected Result**: Each filter works, can combine filters, results update correctly

---

## Phase 5: Admin Dashboard Setup (OPTIONAL)

### Add Inventory Management (Admin Section)

Create `Admin-Section/src/Pages/InventoryManagement.jsx`:

```jsx
import React, { useState, useEffect } from "react";
import axios from "axios";

const InventoryManagement = () => {
  const [lowStockItems, setLowStockItems] = useState([]);
  const [report, setReport] = useState([]);
  const [tab, setTab] = useState("alerts");

  useEffect(() => {
    if (tab === "alerts") loadLowStockAlerts();
    if (tab === "report") loadInventoryReport();
  }, [tab]);

  const loadLowStockAlerts = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3000/common/inventory/alerts/low-stock",
        { withCredentials: true }
      );
      setLowStockItems(response.data.items || []);
    } catch (error) {
      console.error("Error loading low stock:", error);
    }
  };

  const loadInventoryReport = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3000/common/inventory/report",
        { withCredentials: true }
      );
      setReport(response.data.report || []);
    } catch (error) {
      console.error("Error loading report:", error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Inventory Management</h1>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab("alerts")}
          className={`px-4 py-2 rounded ${
            tab === "alerts" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          Low Stock Alerts ({lowStockItems.length})
        </button>
        <button
          onClick={() => setTab("report")}
          className={`px-4 py-2 rounded ${
            tab === "report" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          Inventory Report
        </button>
      </div>

      {tab === "alerts" && (
        <table className="w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Product</th>
              <th className="p-2 text-left">Available</th>
              <th className="p-2 text-left">Reserved</th>
              <th className="p-2 text-left">Total</th>
            </tr>
          </thead>
          <tbody>
            {lowStockItems.map((item) => (
              <tr key={item.spec_id} className="border-t">
                <td className="p-2">{item.product_name}</td>
                <td className="p-2 text-orange-600 font-bold">
                  {item.available_stock}
                </td>
                <td className="p-2">{item.reserved_stock}</td>
                <td className="p-2">{item.stock}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {tab === "report" && (
        <table className="w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Product</th>
              <th className="p-2 text-left">Stock</th>
              <th className="p-2 text-left">Available</th>
              <th className="p-2 text-left">Reserved</th>
              <th className="p-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {report.map((item) => (
              <tr key={item.spec_id} className="border-t">
                <td className="p-2">{item.product_name}</td>
                <td className="p-2">{item.stock}</td>
                <td className="p-2">{item.available_stock}</td>
                <td className="p-2">{item.reserved_stock}</td>
                <td className={`p-2 font-semibold ${
                  item.status === "Out of Stock" ? "text-red-600" :
                  item.status === "Low Stock" ? "text-orange-600" :
                  "text-green-600"
                }`}>
                  {item.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default InventoryManagement;
```

---

## Phase 6: Final Checks

### Before Going Live

- [ ] Database migrations ran successfully
- [ ] All 5 API controllers created and routes added
- [ ] ProductReviews component on product detail page
- [ ] ChatSupport widget visible and functional
- [ ] AdvancedFiltering/Search page working
- [ ] ProductRecommendations showing correctly
- [ ] ProductCard shows ratings and inventory status
- [ ] All 5 features tested end-to-end
- [ ] No console errors in browser dev tools
- [ ] API endpoints responding correctly

### Test API Endpoints (Quick Check)

```bash
# Check server is running
curl http://localhost:3000/health

# Test reviews endpoint
curl http://localhost:3000/common/reviews/1

# Test chat endpoint  
curl -X POST http://localhost:3000/common/chat/start

# Test filtering
curl "http://localhost:3000/common/search/advanced?searchTerm=iPhone"

# Test inventory
curl http://localhost:3000/common/inventory/1/status
```

---

## Phase 7: Performance Optimization (OPTIONAL)

### Add Caching (Optional for Later)

For frequently accessed data like filter options and recommendations:
1. Cache filter options for 1 hour
2. Cache recommendation results for 30 minutes
3. Cache product ratings for 6 hours

This improves performance significantly with large datasets.

---

## Troubleshooting

### Issue: Reviews not showing
**Solution**: Verify `spec_id` is passed correctly, check browser console for API errors

### Issue: Chat not appearing
**Solution**: Ensure ChatSupport component imported in RootLayout, clear browser cache

### Issue: API endpoints 404
**Solution**: Verify all controllers in `API/Controllers/common/` exist and routes in `Common.js` are properly imported

### Issue: Recommendations empty
**Solution**: Check that `browsing_history` table has data (visit products first), verify no errors in console

### Issue: Filters not working
**Solution**: Ensure database has product data, check `/common/search/filters/options` returns values

---

## Summary of Changes

**Files Created**: 4 components + 1 guide
- ProductReviews.jsx
- ChatSupport.jsx  
- AdvancedFiltering.jsx
- ProductRecommendations.jsx
- AdvancedSearch.jsx (create manually)

**Files Modified**: 2
- ProductCard.jsx (enhanced with ratings & inventory)
- RootLayout.jsx (added ChatSupport import)

**Backend Files**: All ready ✓
- reviews.js, chat.js, inventory.js, recommendations.js, filtering.js
- migrations.sql with all database schema

**Total Implementation Time**: ~1-2 hours for manual steps + testing

