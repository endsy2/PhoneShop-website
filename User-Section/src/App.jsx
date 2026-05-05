import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import Signup from "./Pages/auth/SignUpScreen";
import RootLayout from "./Pages/layout/RootLayout";
import AuthLayout from "./Pages/layout/AuthLayout";
import Compare from "./Pages/home/Compare";
import Add_to_favorite from "./Pages/home/Add_to_favorite";
import Home from "./Pages/home/Home"; // Make sure Home is imported
import Payment from "./Pages/home/Payment";
import UserProfile from "./Pages/home/UserProfile";

import Login from "./Pages/auth/Login";
import ProductDetail from "./Pages/home/ProductDetail";
import CheckoutPage from "./Pages/home/Checkout";
import MyOrderPage from "./Pages/home/My_Order";
import AddToCart from "./Pages/home/AddToCart";
import Category from "./Pages/home/Category";
import Search from "./Pages/home/Search";
import AfterHomePage from "./Pages/home/AfterHomePage";

export default function App() {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route path="/" element={<RootLayout />}>
          <Route index element={<Home />} />
          <Route path="product-detail" element={<ProductDetail />} />
          <Route path="Sort" element={<Category />} />
          <Route path="compare-product" element={<Compare />} />
          <Route path="add-to-favorite" element={<Add_to_favorite />} />
          <Route path="add-to-cart" element={<AddToCart />} />
          <Route path="payment" element={<Payment />} />
          <Route path="user-profile" element={<UserProfile />} /> {/* Updated path */}
          <Route path="Search" element={<Search />} /> {/* Updated path */}
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="myorder" element={<MyOrderPage />} />
          <Route path="AfterHomePage" element={<AfterHomePage />} />
        </Route>

        <Route path="/auth" element={<AuthLayout />}> {/* Updated path */}
          <Route path="signup" element={<Signup />} /> {/* Updated path */}
          <Route path="login" element={<Login />} /> {/* Updated path */}
        </Route>

        {/* Fallback route for undefined paths */}
        <Route path="*" element={<h1>Page Not Found</h1>} />
      </>
    )
  );

  return <RouterProvider router={router} />;
}
