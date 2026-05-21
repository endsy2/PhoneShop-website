import { useCallback, useEffect, useMemo, useState } from 'react'
import { fetchProductByBrand, fetchProductByCategory } from '../../FetchAPI/Fetch';
import ProductCard from './ProductCard';
import Breadcrumb from '../../Components/Breadcrumb';

const Category = () => {
    const search = window.location.search;
    const params = new URLSearchParams(search);
    const category = params.get("category");
    const brand = params.get("brand");

    const [data, setData] = useState([]);
    const [query, setQuery] = useState("");
    const [priceRange, setPriceRange] = useState("all");
    const [sortBy, setSortBy] = useState("featured");
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    const handleData = useCallback(async () => {
        try {
            const response = await fetchProductByCategory({ category: category });
            setData(response?.data || []);
        } catch (error) {
            console.error(error);
        }
    }, [category])

    const handlebrand = useCallback(async () => {
        try {
            const response = await fetchProductByBrand({ brand: brand });
            setData(response?.data || []);
        } catch (error) {
            console.error(error);
        }
    }, [brand])


    useEffect(() => {
        if (category) {
            handleData();
        }
        else {
            handlebrand()
        }
    }, [category, brand, handleData, handlebrand])

    const filteredAndSorted = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();

        const filtered = (data || []).filter((item) => {
            const nameMatch = !normalizedQuery || String(item?.name || "").toLowerCase().includes(normalizedQuery);
            const finalPrice = Number(item?.price_discount ?? item?.price ?? 0);

            if (priceRange === "under300") return nameMatch && finalPrice < 300;
            if (priceRange === "300to700") return nameMatch && finalPrice >= 300 && finalPrice <= 700;
            if (priceRange === "over700") return nameMatch && finalPrice > 700;

            return nameMatch;
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
    }, [data, query, priceRange, sortBy]);

    const clearFilters = () => {
        setQuery("");
        setPriceRange("all");
        setSortBy("featured");
    };

    return (
        <div className='w-full bg-gray-50 px-4 py-6 sm:px-6 lg:px-12'>
            <div className='mx-auto max-w-7xl'>
                {/* Breadcrumb */}
                <Breadcrumb 
                    items={[
                        { label: category || brand || "Products" }
                    ]}
                />
            <h1 className='font-bold my-3 text-2xl text-green-600'>{category || brand}</h1>

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
                            placeholder='Search this list...'
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

            <div className='mb-4 hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:block'>
                <div className='grid grid-cols-1 gap-3 md:grid-cols-3'>
                    <input
                        type='text'
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder='Search this list...'
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

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 py-4">
                {filteredAndSorted.map((element) => (
                    <ProductCard key={element.phone_id || element.id} product={element} />
                ))}
            </div>
            </div>
        </div>
    )
}

export default Category
