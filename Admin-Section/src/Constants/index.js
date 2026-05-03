import {
  offer,
  order,
  product,
  dashboard,
  revanue,
  addToCart,
  profile,
  pending,
  delivery,
  addGreen,
  phone,
  category,
  stock,
} from "../Assets";

export const nav_bar = [
  { img: dashboard, label: "DashBoard", path: "" },
  { img: order, label: "Order", path: "order" },
  { img: product, label: "Product", path: "product" },
  { img: addGreen, label: "Add Product", path: "addProduct" },
  { img: offer, label: "Promotion", path: "offer" },
  { img: pending, label: "Message", path: "message" },
];
export const inventory_title = [
  { title: "Total Product" },
  { title: "Categories" },
  { title: "Total Items" },
  { title: "Out Of Stock" },
];
export const ProductCategory = [
  { label: "All" },
  { label: "All" },
  { label: "All" },
  { label: "All" },
];
export const ProductSort = [
  { label: "Newest" },
  { label: "Newest" },
  { label: "Newest" },
  { label: "Newest" },
];
export const Inventory_items = [
  {
    id: "1",
    code: "001",
    name: "product1",
    category: "phone",
    brand: "iphone",
    inventory: "10",
    price: "1000",
  },
  {
    id: "2",
    code: "002",
    name: "product2",
    category: "phone",
    brand: "iphone",
    inventory: "10",
    price: "1000",
  },
  {
    id: "3",
    code: "003",
    name: "product3",
    category: "phone",
    brand: "iphone",
    inventory: "10",
    price: "1000",
  },
  {
    id: "4",
    code: "004",
    name: "product4",
    category: "phone",
    brand: "iphone",
    inventory: "10",
    price: "1000",
  },
  {
    id: "5",
    code: "005",
    name: "product5",
    category: "phone",
    brand: "iphone",
    inventory: "10",
    price: "1000",
  },
];
export const dashBoradMain_item = [
  { img: revanue },
  { img: addToCart },
  { img: profile },
];
export const tableHeadProduct = [
  "ID",
  "Product Name",
  "Category",
  "Price",
  "Inventory",
  "Release Date"
];
export const tableHeadOrder = [
  "ID",
  "Customer Name",
  "Address",
  "Date",
  "Amount",
]

export const tableInfor = [
  {
    id: "1",
    productCode: "001",
    productName: "phone",
    category: "phone",
    inventory: "11",
    price: 100,
  },
  {
    id: "1",
    productCode: "001",
    productName: "phone",
    category: "phone",
    inventory: "11",
    price: 100,
  },
  {
    id: "1",
    productCode: "001",
    productName: "phone",
    category: "phone",
    inventory: "11",
    price: 100,
  },
  {
    id: "1",
    productCode: "001",
    productName: "phone",
    category: "phone",
    inventory: "11",
    price: 100,
  },
  {
    id: "1",
    productCode: "001",
    productName: "phone",
    category: "phone",
    inventory: "11",
    price: 100,
  },
  {
    id: "1",
    productCode: "001",
    productName: "phone",
    category: "phone",
    inventory: "11",
    price: 100,
  },
  {
    id: "1",
    productCode: "001",
    productName: "phone",
    category: "phone",
    inventory: "11",
    price: 100,
  },
  {
    id: "1",
    productCode: "001",
    productName: "phone",
    category: "phone",
    inventory: "11",
    price: 100,
  },
  {
    id: "1",
    productCode: "001",
    productName: "phone",
    category: "phone",
    inventory: "11",
    price: 100,
  },
  {
    id: "1",
    productCode: "001",
    productName: "phone",
    category: "phone",
    inventory: "11",
    price: 100,
  },
  {
    id: "1",
    productCode: "001",
    productName: "phone",
    category: "phone",
    inventory: "11",
    price: 100,
  },
  {
    id: "1",
    productCode: "001",
    productName: "phone",
    category: "phone",
    inventory: "11",
    price: 100,
  },
];

export const order_header = [
  { img: addToCart },
  { img: pending },
  { img: delivery },
];
export const offer_header = [
  { label: "Product Name", dbLabel: "phone_name" },
  { label: "Promotion Name", dbLabel: "promo_name" },
  { label: "Storage", dbLabel: "storage" },
  { label: "Discount Percentage", dbLabel: "discount_percent" },
  { label: "Start Date", dbLabel: "start_date" },
  { label: "End Date", dbLabel: "end_date" },
  { label: "Color", dbLabel: "Color" }

];

export const productHeader = [
  { img: phone },
  { img: category },
  { img: stock }
]
export const tableHeadOffer = ["ID", "Product_Name", "Promotion Name", "Price", "Discount", "Discount Percentage", "end Date"];