import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import RootLayOut from "./Pages/Root/RootLayOut";
import DashBorad from "./Pages/DashBorad";
import Order from "./Pages/Order/Order";
import Product from "./Pages/Product";
import Offer from "./Pages/Offer";
import Login from "./Pages/Auth/Login";
import Register from "./Pages/Auth/Register";
import AuthLayOut from "./Pages/Root/AuthLayOut";
import Order_By_ID from "./Pages/Order/Order_By_ID";
import AddProductPage from "./Pages/AddProductPage";
import AddBrandPage from "./Pages/AddBrandPage";
import AddCategoryPage from "./Pages/AddCategoryPage";
import MainOffer from "./Pages/MainOffer";

import AddColorPage from "./Pages/AddColorPage";
import AddDetailPage from "./Pages/AddDetailPage";
import Message from "./Pages/Message";
import NotFound from "./Pages/NotFound"; // Create this component

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<AuthLayOut />}>
        <Route index element={<Login />} />
        <Route path="register" element={<Register />} />
      </Route>
      <Route path="/dashboard" element={<RootLayOut />}>
        <Route index element={<DashBorad />} />
        <Route path="order" element={<Order />} />
        <Route path="order/:id" element={<Order_By_ID />} />
        <Route path="product" element={<Product />} />
        <Route path="productByName" element={<Offer />} />
        <Route path="addProduct" element={<AddProductPage />} />
        <Route path="addBrand" element={<AddBrandPage />} />
        <Route path="addCategory" element={<AddCategoryPage />} />
        <Route path="addColor" element={<AddColorPage />} />
        <Route path="addDetail" element={<AddDetailPage />} />
        <Route path="offer" element={<MainOffer />} />
        <Route path="offer/:id" element={<Offer />} />
        <Route path="message" element={<Message />} />
      </Route>
      {/* Wildcard route to handle 404 */}
      <Route path="*" element={<NotFound />} />
    </>
  )
);

export default function App() {
  return <RouterProvider router={router} />;
}
