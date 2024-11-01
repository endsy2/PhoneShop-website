import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from "react-router-dom";
import Signup from "./Pages/auth/SignUpScreen";
import RootLayout from "./Pages/layout/RootLayout";
import AuthLayout from "./Pages/layout/AuthLayout";
import Product_detail from "./Pages/home/Product_detail";
import Compare from "./Pages/home/Compare";
import Add_to_favorite from "./Pages/home/Add_to_favorite";
import Home from "./Pages/home/Home";  // Make sure Home is imported
import Payment from "./Pages/home/Payment";
import UserProfile from "./Pages/home/UserProfile";
import After_home_page from "./Pages/home/After_home_page";
import Login from "./Pages/auth/Login";

export default function App() {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route path="/" element={<RootLayout />}>
          <Route index element={<Signup />} />
          <Route path="product-detail" element={<Product_detail />} />
          <Route path="compare-product" element={<Compare />} />
          <Route path="add-to-favorite" element={<Add_to_favorite />} />
          <Route path="payment" element={<Payment />} />
          <Route path="User-Profile" element={<UserProfile />} />
          <Route path="After-Home-Page" element={<After_home_page />} />
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
