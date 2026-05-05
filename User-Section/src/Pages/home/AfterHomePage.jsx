import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { fetchdataProduct, fetchProductByDate, fetchProductDiscount } from '../../FetchAPI/Fetch';
import ProductCard from './ProductCard';
import { useLocation } from 'react-router-dom';

const AfterHomePage = () => {
    const search = window.location.search;
    const location = useLocation();
    const params = new URLSearchParams(search);
    const page = params.get("page");
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [query, setQuery] = useState("");
    const [sortBy, setSortBy] = useState("featured");
    const [priceRange, setPriceRange] = useState("all");
    const [showMobileFilters, setShowMobileFilters] = useState(false);


    const handleNewArrival = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const response = await fetchProductByDate();
            setData(response?.data || []);
        } catch (error) {
            console.log(error);
            setError("Unable to load new arrivals right now.");
        } finally {
            setLoading(false);

        }
    }, [])

    const handleDiscount = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const response = await fetchProductDiscount();
            setData(response?.data || [])
        } catch (error) {
            console.error(error);
            setError("Unable to load discount products right now.");
        } finally {
            setLoading(false);

        }
    }, [])

    const handleProduct = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const response = await fetchdataProduct();
            setData(response?.data || [])
        } catch (error) {
            console.error(error);
            setError("Unable to load products right now.");
        } finally {
            setLoading(false);

        }
    }, [])

    useEffect(() => {
        if (page === 'NEW ARRIVAL') {
            handleNewArrival();
        }
        else if (page === "DISCOUNT") {
            handleDiscount();
        }
        else {
            handleProduct();
        }
    }, [location, page, handleNewArrival, handleDiscount, handleProduct])

    const filteredAndSorted = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();

        const filtered = (data || []).filter((item) => {
            const titleMatch = !normalizedQuery || String(item?.name || "").toLowerCase().includes(normalizedQuery);
            const finalPrice = Number(item?.price_discount ?? item?.price ?? 0);

            if (priceRange === "under300") {
                return titleMatch && finalPrice < 300;
            }

            if (priceRange === "300to700") {
                return titleMatch && finalPrice >= 300 && finalPrice <= 700;
            }

            if (priceRange === "over700") {
                return titleMatch && finalPrice > 700;
            }

            return titleMatch;
        });

        return filtered.sort((a, b) => {
            const priceA = Number(a?.price_discount ?? a?.price ?? 0);
            const priceB = Number(b?.price_discount ?? b?.price ?? 0);

            if (sortBy === "priceLow") return priceA - priceB;
            if (sortBy === "priceHigh") return priceB - priceA;
            if (sortBy === "nameAsc") return String(a?.name || "").localeCompare(String(b?.name || ""));
            if (sortBy === "nameDesc") return String(b?.name || "").localeCompare(String(a?.name || ""));

            return 0;
        });
    }, [data, query, sortBy, priceRange]);

    const clearFilters = () => {
        setQuery("");
        setPriceRange("all");
        setSortBy("featured");
    };

    return (
        <div className='w-full bg-gray-50 px-4 py-6 pb-24 sm:px-6 lg:px-10 xl:px-16'>
            <div className='mx-auto max-w-7xl'>
                <h1 className='py-4 text-2xl font-bold text-green-600'>{page || "PRODUCT"}</h1>

                <div className='sticky top-2 z-30 mb-4 md:hidden'>
                    <div className='rounded-xl border border-slate-200 bg-white p-3 shadow-sm'>
                        <div className='flex items-center gap-2'>
                            <button
                                type='button'
                                onClick={() => setShowMobileFilters((prev) => !prev)}
                                className='h-10 rounded-lg bg-emerald-600 px-3 text-xs font-bold text-white'
                            >
                                {showMobileFilters ? "Hide" : "Filters"}
                            </button>
                            <input
                                type='text'
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder='Search products...'
                                className='h-10 flex-1 rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-emerald-600'
                            />
                        </div>

                        {showMobileFilters ? (
                            <div className='mt-2 grid grid-cols-1 gap-2'>
                                <select
                                    value={priceRange}
                                    onChange={(e) => setPriceRange(e.target.value)}
                                    className='h-10 rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-emerald-600'
                                >
                                    <option value='all'>All prices</option>
                                    <option value='under300'>Under $300</option>
                                    <option value='300to700'>$300 - $700</option>
                                    <option value='over700'>Over $700</option>
                                </select>

                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className='h-10 rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-emerald-600'
                                >
                                    <option value='featured'>Featured</option>
                                    <option value='priceLow'>Price: Low to High</option>
                                    <option value='priceHigh'>Price: High to Low</option>
                                    <option value='nameAsc'>Name: A to Z</option>
                                    <option value='nameDesc'>Name: Z to A</option>
                                </select>

                                <button
                                    type='button'
                                    onClick={clearFilters}
                                    className='h-10 rounded-lg border border-slate-300 bg-white text-sm font-semibold text-slate-700'
                                >
                                    Reset Filters
                                </button>
                            </div>
                        ) : null}
                    </div>
                </div>

                <div className='hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:block'>
                    <div className='grid grid-cols-1 gap-3 md:grid-cols-3'>
                        <input
                            type='text'
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder='Search in this collection...'
                            className='h-11 rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-emerald-600'
                        />

                        <select
                            value={priceRange}
                            onChange={(e) => setPriceRange(e.target.value)}
                            className='h-11 rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-emerald-600'
                        >
                            <option value='all'>All prices</option>
                            <option value='under300'>Under $300</option>
                            <option value='300to700'>$300 - $700</option>
                            <option value='over700'>Over $700</option>
                        </select>

                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className='h-11 rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-emerald-600'
                        >
                            <option value='featured'>Featured</option>
                            <option value='priceLow'>Price: Low to High</option>
                            <option value='priceHigh'>Price: High to Low</option>
                            <option value='nameAsc'>Name: A to Z</option>
                            <option value='nameDesc'>Name: Z to A</option>
                        </select>
                    </div>

                    <p className='mt-3 text-sm text-slate-600'>
                        Showing {filteredAndSorted.length} product{filteredAndSorted.length === 1 ? "" : "s"}
                    </p>
                </div>

                {error ? (
                    <div className='mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700'>
                        {error}
                    </div>
                ) : null}

                {loading ? (
                    <div className='mt-5 grid grid-cols-2 gap-4 rounded-lg bg-gray-100 p-4 md:grid-cols-3 lg:grid-cols-5'>
                        {Array.from({ length: 10 }).map((_, index) => (
                            <div key={index} className='h-64 animate-pulse rounded-lg bg-slate-200' />
                        ))}
                    </div>
                ) : filteredAndSorted.length > 0 ? (
                    <div className='mt-5 grid grid-cols-2 gap-4 rounded-lg bg-gray-100 p-4 md:grid-cols-3 lg:grid-cols-5'>
                        {filteredAndSorted.map((element) => (
                            <ProductCard key={element.phone_id || element.spec_id || element.id} product={element} />
                        ))}
                    </div>
                ) : (
                    <div className='mt-5 rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600'>
                        No products match your filters.
                    </div>
                )}
            </div>
        </div>
    )
}

export default AfterHomePage
