# Genius Store — Project Overview

> **Design and Development of Genius Store: An E-Commerce Platform for Smart Devices**

---

## 📌 Project Description

Genius Store is a full-stack web-based e-commerce platform for selling smart devices including smartphones, smartwatches, tablets, and accessories. The system consists of two separate portals — a **customer-facing storefront** for browsing and purchasing products, and a **secure admin dashboard** for managing the entire store.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend (User) | React.js 18, Redux Toolkit, Tailwind CSS, Vite |
| Frontend (Admin) | React.js 18, Tailwind CSS, Vite |
| Backend | Node.js, Express.js |
| Database | MySQL |
| Authentication | JWT (JSON Web Token) + HTTP-only Cookies |
| Image Upload | Multer |
| HTTP Client | Axios |

---

## 📁 Project Structure

```
PhoneShop-website/
├── API/                        # Backend (Node.js + Express)
│   ├── Controllers/
│   │   ├── adminCrud/          # Admin product, order, offer, dashboard
│   │   ├── auth/               # User & admin authentication
│   │   ├── common/             # Public product, reviews, notifications
│   │   └── user/               # User orders, profile
│   ├── Routs/                  # Express route definitions
│   ├── Utils/                  # JWT, cookies, image upload helpers
│   └── db/                     # MySQL connection pool
│
├── Admin-Section/              # Admin Panel (React)
│   └── src/
│       ├── Pages/              # Dashboard, Orders, Products, Offers, Auth
│       ├── Section/            # Reusable page sections
│       ├── Component/          # Tables (Product, Order, Offer)
│       ├── Fetch/              # All API call functions
│       └── Constants/          # Nav items, table headers, icons
│
└── User-Section/               # User Storefront (React)
    └── src/
        ├── Pages/
│       │   ├── home/           # Home, ProductDetail, Cart, Checkout, Orders
│       │   ├── auth/           # Login, Register
│       │   └── layout/         # RootLayout, AuthLayout
│       ├── Components/         # ProductReviews, ChatSupport
│       ├── Conponents/         # CheckoutCart, Arrow
│       ├── FetchAPI/           # All API call functions
│       ├── network/            # Base URL config, endpoint constants
│       └── store/              # Redux slices (cart, favorite, compare)
```

---

## 👤 User Features

### Authentication
- Register new account (username, email, password)
- Login / Logout with JWT token stored in HTTP-only cookies
- Token auto-refresh when access token expires

### Product Browsing
- View all products on home page
- Filter by **Category** (Smartphones, Smartwatches, Accessories, etc.)
- Filter by **Brand**
- View **New Arrivals** (products released in last 6 months)
- View **Special Offers** (discounted products)
- **Search** products by name
- **Sort** by price (low/high), name (A-Z), featured

### Product Detail
- View full product specifications (screen, processor, RAM, storage, battery, camera)
- Select **color variant** and **storage variant**
- View discounted price if promotion is active
- Add to **Cart** with quantity selection
- Add to **Favorites** (wishlist)
- **Compare** up to 3 products side by side
- **Write a Review** — star rating (1-5), title, comment
- View all customer reviews with helpful/unhelpful voting
- Recently viewed products

### Shopping Cart
- Add/remove items, change quantity
- Cart persists in localStorage
- Cart versioning to clear stale items automatically

### Checkout
- Fill recipient name, delivery type, payment method, location
- Order placed and linked to logged-in account via JWT
- Supports: **By Delivery** (pay on arrival) and **Paid** (online)
- Validates all cart items have valid spec_ids before placing order

### My Orders
- View full order history grouped by order ID
- See order status (Pending, Completed, Canceled)
- View order receipt with product details, quantities, prices
- Compare ordered items

### User Profile
- Update name, email, phone number, address
- Upload profile picture
- Change password
- Sign out (clears server-side cookies)

### Other
- **Live Chat Support** — real-time chat with admin
- **Notifications** — receive store announcements
- **Favorites** — save and manage wishlist
- **Compare** — compare product specs side by side

---

## 🔧 Admin Features

### Authentication
- Separate admin login/register
- Protected routes — redirects to login if not authenticated

### Dashboard
- Total Revenue, Total Orders, Total Customers
- Filter by date range (Last 1, 2, 3, 6 months or All Time)
- Product inventory table with search

### Product Management
- **Add Product** — name, category, brand, images, color, specs (screen, processor, RAM, storage, battery, camera, price, stock), release date
- **Edit Spec** — select product → select color variant → edit existing spec or add new spec (changes reflect immediately on user page)
- **Add Brand** — name + logo image, delete brands
- **Add Category** — name, delete categories
- **Add Color Variant** — add new color with images to existing product
- **Delete Product** — cascades to variants, specs, images, order items, promotions
- **Delete Variant** — removes color variant and all associated data
- Filter products by category

### Order Management
- View all orders with customer name, delivery address, date, total amount
- Search orders by customer name or recipient name
- View order detail — customer info, all ordered products, quantities, prices, discounts
- Delete order items individually
- Delete entire order
- Order status tracking (Pending, Completed, Canceled)

### Promotion Management
- Create promotions — select product → color → storage → set discount %, start date, end date
- Promotion status auto-calculated (Active/Inactive) based on current date
- Edit existing promotions
- Delete promotions
- View all active promotions in table

### Message / Chat
- View and respond to customer chat messages

---

## 🗄️ Database Schema (Key Tables)

| Table | Description |
|---|---|
| `customers` | User accounts |
| `admin` | Admin accounts |
| `phones` | Products |
| `phone_variants` | Color variants per product |
| `specifications` | Storage/spec variants per color (price, stock, RAM, etc.) |
| `productimage` | Product images per variant |
| `categories` | Product categories |
| `brands` | Product brands with logo |
| `orders` | Customer orders (with recipient_name, delivery, payment, location) |
| `order_items` | Line items per order (spec_id, quantity, amount auto-calculated by trigger) |
| `promotions` | Discount promotions per spec |
| `product_reviews` | Customer reviews (rating, title, comment, verified purchase) |
| `review_votes` | Helpful/unhelpful votes on reviews |
| `chat_conversations` | Live chat sessions |
| `chat_messages` | Chat messages |

---

## 🔐 Authentication Flow

```
User Login
    → POST /auth/login
    → Server verifies email + password (bcrypt)
    → Generates Access Token (1 day) + Refresh Token (7 days)
    → Stores both in HTTP-only cookies
    → Frontend stores token in localStorage for UI state

Protected Routes
    → validateToken_refresh_token middleware
    → Verifies access token
    → If expired → auto-refreshes using refresh token
    → If refresh token expired → returns 403 (user must login again)
```

---

## 🌐 API Endpoints Summary

### Auth (`/auth`)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/login` | User login |
| POST | `/auth/register` | User register |
| POST | `/auth/logout` | User logout |
| POST | `/auth/adminLogin` | Admin login |
| POST | `/auth/adminRegister` | Admin register |

### Common — Public (`/common`)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/common/getAllProduct` | All products |
| GET | `/common/getProduct` | Product by name or ID |
| GET | `/common/getAllProductbyCategory` | Filter by category |
| GET | `/common/getAllProductbyBrand` | Filter by brand |
| GET | `/common/getAllProductbydate` | New arrivals |
| GET | `/common/offerDisplay` | Active promotions |
| GET | `/common/reviews/:spec_id` | Product reviews |
| POST | `/common/reviews` | Add review (auth required) |
| DELETE | `/common/reviews/:id` | Delete review (auth required) |

### User — Protected (`/user`)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/user/checkout` | Place order |
| GET | `/user/userInfo` | Get profile |
| PUT | `/user/userInfo` | Update profile |
| POST | `/user/change-password` | Change password |
| GET | `/user/orderByName` | Get user orders |

### Admin — Protected (`/admin`)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/admin/addNewProduct` | Add product |
| POST | `/admin/addNewSpecification` | Add spec |
| PUT | `/admin/updateSpec` | Update spec |
| DELETE | `/admin/deleteProduct` | Delete product |
| GET | `/admin/tableOrder` | All orders |
| PUT | `/admin/offerInsert` | Create promotion |
| GET | `/admin/dashboardHeadAll` | Dashboard stats |

---

## 🚀 Running the Project

### Prerequisites
- Node.js v18+
- MySQL 8+
- npm

### Setup

**1. Start the API (Backend)**
```bash
cd API
npm install
npm run dev
# Runs on http://localhost:3000
```

**2. Start the Admin Panel**
```bash
cd Admin-Section
npm install
npm run dev
# Runs on http://localhost:5173
```

**3. Start the User Storefront**
```bash
cd User-Section
npm install
npm run dev
# Runs on http://localhost:5174
```

### Environment Variables (`API/.env`)
```env
PORT=3000
db_host=localhost
db_name=phone
db_password=your_password
db_port=3306
db_user=root
jwt_access_expired=1d
jwt_refresh_expired=7d
ACCESS_TOKEN_SECRET=your_secret
REFRESH_TOKEN_SECRET=your_secret
SESSION_SECRET=your_secret
```

---

## 👨‍💻 Developer Notes

- All images are served from `API/uploads/` via `http://localhost:3000/uploads/filename`
- Frontend uses `NETWORK_CONFIG.apiBaseUrl` (from `Network_EndPoint.js`) for all image URLs — no hardcoded localhost
- Cart uses versioning (`carts_version`) to auto-clear stale items on update
- Reviews are shown per-product (all variants combined), not per-spec
- Order `recipient_name` is stored separately from `location` so admin sees who receives the delivery
- Database triggers auto-calculate `order_items.amount` and `orders.total_amount`

---

*Genius Store — Built with React, Node.js, Express, and MySQL*
