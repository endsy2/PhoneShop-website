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
import After_home_page from "./Pages/home/After_home_page";
import Login from "./Pages/auth/Login";
import ProductDetail from "./Pages/home/ProductDetail";
import CheckoutPage from "./Pages/home/Checkout";
import MyOrderPage from "./Pages/home/My_Order";
import AddToCart from "./Pages/home/AddToCart";

export default function App() {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route path="/" element={<RootLayout />}>
          <Route index element={<Home />} />
          <Route path="product-detail" element={<ProductDetail />} />
          <Route path="compare-product" element={<Compare />} />
          <Route path="add-to-favorite" element={<Add_to_favorite />} />
          <Route path="add-to-cart" element={<AddToCart />} />
          <Route path="payment" element={<Payment />} />
          <Route path="User-Profile" element={<UserProfile />} />
          <Route path="After-home-page" element={<After_home_page />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="myorder" element={<MyOrderPage />} />
        </Route>
        <Route path="/Auth" element={<AuthLayout />}>
          <Route path="Signup" element={<Signup />} />
          <Route path="Login" element={<Login />} />
        </Route>
      </>
    )
  );

  return <RouterProvider router={router} />;
}
