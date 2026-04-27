import React, { useEffect } from "react";
import ProductCard from "./ProductCard";
import { useState } from "react";
import {
  desertColor,
  blackColor,
  silverColor,
  naturalColor,
} from "../Assets/image";
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
  var settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 5,
    slidesToScroll: 1,
    initialSlide: 1,
    arrows: true, // Corrected 'arrow' to 'arrows'
    prevArrow: <CustomPrevArrow />,
    nextArrow: <CustomNextArrow />,
    responsive: [
      {
        breakpoint: 1200, // For larger screens (e.g., tablets or small desktops)
        settings: {
          slidesToShow: 4,
          slidesToScroll: 1,
          infinite: true,
          dots: true,
        },
      },
      {
        breakpoint: 1024, // Standard tablets and smaller desktops
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          infinite: true,
          dots: true,
        },
      },
      {
        breakpoint: 768, // Portrait tablets and large mobile devices
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          infinite: true,
          dots: true,
        },
      },
      {
        breakpoint: 580, // Small mobile devices
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          infinite: true,
          dots: true,
        },
      },
    ],
  };

  const specialOfferSettings = {
    ...settings,
    rows: 1,
    vertical: false,
    adaptiveHeight: false,
    slidesToShow: Math.min(5, Math.max(1, uniqueDiscountProducts.length || 1)),
    infinite: uniqueDiscountProducts.length > 5,
  };

  return (
    <div>
      <div className="px-4 py-6 md:px-20">
        <div className="relative mx-auto overflow-hidden rounded-3xl border-2 border-emerald-300/80 bg-[linear-gradient(130deg,#f7fff9_0%,#ffffff_42%,#ecfdf3_100%)] px-6 py-14 shadow-[0_25px_70px_-35px_rgba(16,185,129,0.35)] md:px-12">
          <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-cyan-200/45 blur-3xl" />
          <div className="pointer-events-none absolute -left-10 -bottom-14 h-44 w-44 rounded-full bg-emerald-200/45 blur-3xl" />
          <div className="relative mx-auto flex max-w-3xl flex-col items-center text-center">
            <span className="mb-5 inline-flex items-center rounded-full border border-slate-200 bg-white/80 px-4 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
              Genius Store
            </span>
            <p className="text-4xl font-extrabold tracking-tight text-slate-900 md:text-6xl">
              Welcome to Genius Store
            </p>
            <p className="mt-4 text-lg font-medium text-slate-600 md:text-2xl">
              What product are you looking for?
            </p>
          </div>
        </div>
      </div>

      {/* Popular-brand section */}
      <div className="px-20 py-4">
        <div>
          <h1 className="text-3xl font-extrabold mb-6 text-gray-900">Brands</h1>
        </div>
        <div className="flex flex-wrap gap-4 py-5 px-4 items-center justify-center mb-4 rounded-lg shadow-md">
          {brand.map((element, index) => (
            <Card data={element} page="Brands" />
          ))}
        </div>
      </div>

      {/* Specail section */}

      <div className="slider-container px-20 py-4">
        <div className="flex justify-between">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
            SPECIAL OFFER
          </h2>
          <Link to={`/AfterHomePage?page=DISCOUNT`} className="text-blue-500">
            VIEW ALL
          </Link>
        </div>
        <Slider {...specialOfferSettings}>
          {uniqueDiscountProducts.map((product) => (
            <div key={`${product.phone_id}-${product.spec_id || product.promo_id || "offer"}`} className="mt-4 px-2">
              <div className="mx-auto w-full max-w-[340px] rounded-lg bg-gray-100 p-4">
                <ProductCard product={product} />
              </div>
            </div>
          ))}
        </Slider>
      </div>

      {/* New-Arrival section */}
      <div className="px-20 py-4 bg-gray-100 rounded-lg mb-4">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-extrabold text-gray-900 my-2">
            NEW ARRIVAL
          </h2>
          <Link
            to={`/AfterHomePage?page=NEW ARRIVAL`}
            className="text-blue-500"
          >
            VIEW ALL
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 mt-4 mb-4 ">
          {newArrival.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
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
      
  

      {/* Categories section */}
      {/* Smartphones section */}
      {/* <div className="px-8 py-4 bg-gray-100 rounded-lg">
        <div className="mb-6">
          <div className="flex justify-between items-center my-2">
            <h2 className="text-3xl font-extrabold text-gray-900">
              SMART PHONES
            </h2>
            <Link to={`/AfterHomePage?page=PRODUCT`} className="text-blue-500">
              VIEW ALL
            </Link>
          </div>
          <div className="slider-container">
            <Slider {...settings}>
              <div className="flex gap-4 mt-4 bg-gray-100 p-4 rounded-lg">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </Slider>
          </div>
        </div>
      </div> */}
      <div className="slider-container px-20 py-4">
        <div className="flex justify-between">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
            SMART PHONES
          </h2>
          <Link to={`/Sort?category=SmartPhones`} className="text-blue-500">
            VIEW ALL
          </Link>
        </div>
        <Slider {...settings}>
          {phone.map((product) => (
            <div key={product.id} className="mt-4 bg-gray-100 p-4 rounded-lg">
              <ProductCard product={product} />
            </div>
          ))}
        </Slider>
      </div>

      <div className="px-20 py-4">
        <div>
          <h1 className="text-3xl font-extrabold mb-6 text-gray-900">
            Categories
          </h1>
        </div>
        <div className="flex flex-wrap gap-4 py-5 px-4 items-center mb-4 rounded-lg shadow-md">
          {category.map((element, index) => (
            <Card data={element} page="Categories" />
          ))}
        </div>
      </div>

      <div className="slider-container px-20 py-4">
        <div className="flex justify-between">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
            Accessories
          </h2>
          <Link to={`/Sort?category=Accessories`} className="text-blue-500">
            VIEW ALL
          </Link>
        </div>
        <Slider {...settings}>
          {accessories.map((product) => (
            <div key={product.id} className="mt-4 bg-gray-100 p-4 rounded-lg">
              <ProductCard product={product} />
            </div>
          ))}
        </Slider>
      </div>
      <div className="slider-container px-20 py-4">
        <div className="flex justify-between">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
            Smart Watch
          </h2>
          <Link to={`/AfterHomePage?page=Accessories`} className="text-blue-500">
            VIEW ALL
          </Link>
        </div>
        <Slider {...settings}>
          {smartWatch.map((product) => (
            <div key={product.id} className="mt-4 bg-gray-100 p-4 rounded-lg">
              <ProductCard product={product} />
            </div>
          ))}
        </Slider>
      </div>

      {/* Product section */}
      <div className="px-20 py-4">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-extrabold text-gray-900">PRODUCT</h2>
            <Link to={`/AfterHomePage?page=PRODUCT`} className="text-blue-500">
              VIEW ALL
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-4 bg-gray-100 p-4 rounded-lg">
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
