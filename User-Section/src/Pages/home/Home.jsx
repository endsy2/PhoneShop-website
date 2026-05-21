import React, { useEffect } from "react";
import ProductCard from "./ProductCard";
import { useState } from "react";
import Card from "./Card";
import {
  fetchBrand,
  fetchCategory,
  fetchdataProduct,
  fetchProductByCategory,
  fetchProductByDate,
  fetchProductDiscount,
} from "../../FetchAPI/Fetch";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
// import Poster from "./Poster";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import { CustomNextArrow, CustomPrevArrow } from "../../Conponents/Arrow";

const HomePage = () => {
  const [products, setProduct] = useState([]);
  const [discountProduct, setDiscountProduct] = useState([]);
  const [newArrival, setNewArrival] = useState([]);
  const [category, setCategory] = useState([]);
  const [brand, setBrand] = useState([]);
  const [accessories, setAccessories] = useState([]);
  const [smartWatch, setSmartWatch] = useState([]);
  const [phone, setPhone] = useState([]);
  const statusTab = useSelector((store) => store.cart.statusTab);

  const handlefetchProduct = async () => {
    const response = await fetchdataProduct();
    setProduct(response.data);
    // console.log(response.data);
  };
  const handleFetchDiscountProduct = async () => {
    const response = await fetchProductDiscount();
    setDiscountProduct(response.data);
  };
  const handleNewArrival = async () => {
    const response = await fetchProductByDate();
    setNewArrival(response.data);
  };
  const handleFetchCategory = async () => {
    try {
      const response = await fetchCategory();
      setCategory(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };
  const handleFetchBrand = async () => {
    try {
      const response = await fetchBrand();
      setBrand(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleAccessories = async () => {
    try {
      const response = await fetchProductByCategory({ category: 'Accessories' });
      setAccessories(response.data);
    } catch (error) {
      console.error(error);

    }
  }
  const handlePhone = async () => {
    try {
      const response = await fetchProductByCategory({ category: 'Smartphones' });
      setPhone(response.data);
    } catch (error) {
      console.error(error);

    }
  }
  const handleSmartWatch = async () => {
    try {
      const response = await fetchProductByCategory({ category: 'Smartwatches' });
      setSmartWatch(response.data);
    } catch (error) {
      console.error(error);

    }
  }

  const uniqueDiscountProducts = Array.from(
    new Map((discountProduct || []).map((item) => [item.phone_id, item])).values()
  );

  const trustBenefits = [
    {
      title: "Fast Nationwide Delivery",
      description: "Reliable delivery partners with real-time updates on your order.",
      icon: "🚚",
    },
    {
      title: "Genuine Products",
      description: "All devices are quality checked and sourced from trusted suppliers.",
      icon: "✅",
    },
    {
      title: "Secure Payment",
      description: "Safe checkout flow with trusted payment options and fraud protection.",
      icon: "🔒",
    },
    {
      title: "Warranty & Support",
      description: "Post-purchase support and warranty guidance from our service team.",
      icon: "🛠️",
    },
  ];

  useEffect(() => {
    handlefetchProduct();
    handleFetchDiscountProduct();
    handleNewArrival();
    handleFetchCategory();
    handleFetchBrand();
    handleAccessories();
    handleSmartWatch();
    handlePhone();
  }, []);
  const makeSliderSettings = (items = []) => ({
    dots: true,
    infinite: items.length > 5,
    speed: 500,
    slidesToShow: Math.min(5, items.length || 1),
    slidesToScroll: 1,
    initialSlide: 0,
    arrows: true,
    prevArrow: <CustomPrevArrow />,
    nextArrow: <CustomNextArrow />,
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: Math.min(4, items.length || 1),
          slidesToScroll: 1,
          infinite: items.length > 4,
          dots: true,
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: Math.min(3, items.length || 1),
          slidesToScroll: 1,
          infinite: items.length > 3,
          dots: true,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: Math.min(2, items.length || 1),
          slidesToScroll: 1,
          infinite: items.length > 2,
          dots: true,
        },
      },
      {
        breakpoint: 580,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          infinite: items.length > 1,
          dots: true,
        },
      },
    ],
  });

  var settings = makeSliderSettings(phone);

  const specialOfferSettings = {
    dots: true,
    infinite: uniqueDiscountProducts.length > 5,
    speed: 500,
    slidesToShow: Math.min(5, uniqueDiscountProducts.length || 1),
    slidesToScroll: 1,
    arrows: true,
    prevArrow: <CustomPrevArrow />,
    nextArrow: <CustomNextArrow />,
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: Math.min(4, uniqueDiscountProducts.length || 1),
          slidesToScroll: 1,
          infinite: uniqueDiscountProducts.length > 4,
          dots: true,
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: Math.min(3, uniqueDiscountProducts.length || 1),
          slidesToScroll: 1,
          infinite: uniqueDiscountProducts.length > 3,
          dots: true,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: Math.min(2, uniqueDiscountProducts.length || 1),
          slidesToScroll: 1,
          infinite: uniqueDiscountProducts.length > 2,
          dots: true,
        },
      },
      {
        breakpoint: 580,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          infinite: uniqueDiscountProducts.length > 1,
          dots: true,
        },
      },
    ],
  };

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="px-4 py-8 md:px-20 md:py-12">
        <div className="relative mx-auto overflow-hidden rounded-3xl border-2 border-emerald-300/80 bg-[linear-gradient(130deg,#f7fff9_0%,#ffffff_42%,#ecfdf3_100%)] px-6 py-16 shadow-[0_25px_70px_-35px_rgba(16,185,129,0.35)] md:px-12 md:py-20">
          <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-cyan-200/45 blur-3xl" />
          <div className="pointer-events-none absolute -left-10 -bottom-14 h-44 w-44 rounded-full bg-emerald-200/45 blur-3xl" />
          <div className="relative mx-auto flex max-w-3xl flex-col items-center text-center">
            <span className="mb-5 inline-flex items-center rounded-full border border-slate-200 bg-white/80 px-5 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600 shadow-sm">
              ✨ Genius Store
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl lg:text-5xl whitespace-nowrap">
              Welcome to <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Genius Store</span>
            </h1>
            <p className="mt-5 text-lg font-medium text-slate-600 md:text-2xl">
              Discover the latest smartphones, smartwatches & accessories
            </p>
          </div>
        </div>
      </div>

      {/* Trust Benefits Section */}
      <div className="px-4 pb-8 md:px-20">
        <div className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-lg md:grid-cols-2 xl:grid-cols-4">
          {trustBenefits.map((benefit) => (
            <div key={benefit.title} className="group rounded-xl border border-slate-100 bg-gradient-to-br from-slate-50 to-white p-5 transition-all duration-300 hover:shadow-md hover:border-green-200 hover:-translate-y-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="text-3xl group-hover:scale-110 transition-transform duration-300" aria-hidden="true">{benefit.icon}</div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-green-600 transition-colors">{benefit.title}</h3>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Popular Brands Section */}
      <div className="px-4 py-8 md:px-20">
        <div className="mb-6">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 flex items-center gap-3">
            <span className="text-3xl">🏷️</span>
            Popular Brands
          </h2>
          <p className="text-gray-600 mt-2">Shop by your favorite brands</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 py-6 px-6 rounded-2xl bg-white shadow-lg border border-gray-100">
          {brand.map((element, index) => (
            <Card key={index} data={element} page="Brands" />
          ))}
        </div>
      </div>

      {/* Special Offer Section */}
      <div className="slider-container px-4 py-8 md:px-20">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 flex items-center gap-3">
              <span className="text-3xl">🔥</span>
              Special Offers
            </h2>
            <p className="text-gray-600 mt-2">Limited time deals you don't want to miss</p>
          </div>
          <Link 
            to={`/AfterHomePage?page=DISCOUNT`} 
            className="text-green-600 hover:text-green-700 font-semibold flex items-center gap-2 group transition-all"
          >
            View All
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>
        <Slider {...specialOfferSettings}>
          {uniqueDiscountProducts.map((product) => (
            <div key={`${product.phone_id}-${product.spec_id || product.promo_id || "offer"}`} className="px-2">
              <div className="max-w-[280px] mx-auto">
                <ProductCard product={product} />
              </div>
            </div>
          ))}
        </Slider>
      </div>

      {/* New Arrival Section */}
      <div className="px-4 py-8 md:px-20">
        <div className="rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 p-6 md:p-8 border border-green-100 shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 flex items-center gap-3">
                <span className="text-3xl">✨</span>
                New Arrivals
              </h2>
              <p className="text-gray-600 mt-2">Fresh products just for you</p>
            </div>
            <Link
              to={`/AfterHomePage?page=NEW ARRIVAL`}
              className="text-green-600 hover:text-green-700 font-semibold flex items-center gap-2 group transition-all"
            >
              View All
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
            {newArrival.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div> 
{/*       

      <div className="slider-container px-8 py-4">
        <div className="flex justify-between">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
            NEW ARRIVAL
          </h2>
          <Link
            to={`/AfterHomePage?page=NEW ARRIVAL`}
            className="text-blue-500"
          >
            VIEW ALL
          </Link>
        </div>
        <Slider {...settings}>
          {newArrival.map((product) => (
            <div key={product.id} className="mt-4 bg-gray-100 p-4 rounded-lg">
              <ProductCard product={product} />
            </div>
          ))}
        </Slider>
      </div> */}
      
  

      {/* Smartphones Section */}
      <div className="slider-container px-4 py-8 md:px-20">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 flex items-center gap-3">
              <span className="text-3xl">📱</span>
              Smartphones
            </h2>
            <p className="text-gray-600 mt-2">Latest mobile technology at your fingertips</p>
          </div>
          <Link 
            to={`/Sort?category=SmartPhones`} 
            className="text-green-600 hover:text-green-700 font-semibold flex items-center gap-2 group transition-all"
          >
            View All
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>
        <Slider {...makeSliderSettings(phone)}>
          {phone.map((product) => (
            <div key={product.id} className="px-2">
              <div className="max-w-[280px] mx-auto">
                <ProductCard product={product} />
              </div>
            </div>
          ))}
        </Slider>
      </div>

      {/* Categories Section */}
      <div className="px-4 py-8 md:px-20">
        <div className="mb-6">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 flex items-center gap-3">
            <span className="text-3xl">📂</span>
            Shop by Category
          </h2>
          <p className="text-gray-600 mt-2">Browse products by category</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 py-6 px-6 rounded-2xl bg-white shadow-lg border border-gray-100">
          {category.map((element, index) => (
            <Card key={index} data={element} page="Categories" />
          ))}
        </div>
      </div>

      {/* Accessories Section */}
      <div className="slider-container px-4 py-8 md:px-20">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 flex items-center gap-3">
              <span className="text-3xl">🎧</span>
              Accessories
            </h2>
            <p className="text-gray-600 mt-2">Complete your tech setup</p>
          </div>
          <Link 
            to={`/Sort?category=Accessories`} 
            className="text-green-600 hover:text-green-700 font-semibold flex items-center gap-2 group transition-all"
          >
            View All
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>
        <Slider {...makeSliderSettings(accessories)}>
          {accessories.map((product) => (
            <div key={product.id} className="px-2">
              <div className="max-w-[280px] mx-auto">
                <ProductCard product={product} />
              </div>
            </div>
          ))}
        </Slider>
      </div>

      {/* Smart Watch Section */}
      <div className="slider-container px-4 py-8 md:px-20">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 flex items-center gap-3">
              <span className="text-3xl">⌚</span>
              Smartwatches
            </h2>
            <p className="text-gray-600 mt-2">Stay connected on the go</p>
          </div>
          <Link 
            to={`/AfterHomePage?page=Accessories`} 
            className="text-green-600 hover:text-green-700 font-semibold flex items-center gap-2 group transition-all"
          >
            View All
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>
        <Slider {...makeSliderSettings(smartWatch)}>
          {smartWatch.map((product) => (
            <div key={product.id} className="px-2">
              <div className="max-w-[280px] mx-auto">
                <ProductCard product={product} />
              </div>
            </div>
          ))}
        </Slider>
      </div>

      {/* All Products Section */}
      <div className="px-4 py-8 md:px-20 mb-8">
        <div className="rounded-2xl bg-white p-6 md:p-8 border border-gray-200 shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 flex items-center gap-3">
                <span className="text-3xl">🛍️</span>
                All Products
              </h2>
              <p className="text-gray-600 mt-2">Explore our complete collection</p>
            </div>
            <Link 
              to={`/AfterHomePage?page=PRODUCT`} 
              className="text-green-600 hover:text-green-700 font-semibold flex items-center gap-2 group transition-all"
            >
              View All
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>

      {/* Accessories section */}
      {/* <div className="px-8 py-4 bg-gray-100 rounded-lg">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-extrabold text-gray-900">
              ACCESSORIES
            </h2>
            <Link to={`/AfterHomePage?page=PRODUCT`} className="text-blue-500">
              VIEW ALL
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-4 bg-gray-100 p-4 rounded-lg">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div> */}
    </div >
  );
};

export default HomePage;
