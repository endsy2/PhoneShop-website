import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL_COMMON = "http://localhost:3000/common";

const AdvancedFiltering = ({ onSearch }) => {
    const [filters, setFilters] = useState({
        searchTerm: "",
        category: null,
        brand: null,
        minPrice: null,
        maxPrice: null,
        minRating: null,
        processor: null,
        minRam: null,
        minStorage: null,
        minCamera: null,
        minBattery: null,
        releaseYear: null,
        inStock: false,
        onSale: false,
        sortBy: "featured"
    });

    const [filterOptions, setFilterOptions] = useState(null);
    const [showAdvanced, setShowAdvanced] = useState(false);

    useEffect(() => {
        loadFilterOptions();
    }, []);

    const loadFilterOptions = async () => {
        try {
            const response = await axios.get(
                `${API_URL_COMMON}/search/filters/options`,
                { withCredentials: true }
            );
            setFilterOptions(response.data.filters);
        } catch (error) {
            console.error("Error loading filter options:", error);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleSearch = (e) => {
        e.preventDefault();
        onSearch(filters);
    };

    const handleReset = () => {
        setFilters({
            searchTerm: "",
            category: null,
            brand: null,
            minPrice: null,
            maxPrice: null,
            minRating: null,
            processor: null,
            minRam: null,
            minStorage: null,
            minCamera: null,
            minBattery: null,
            releaseYear: null,
            inStock: false,
            onSale: false,
            sortBy: "featured"
        });
    };

    if (!filterOptions) return <p className="text-center">Loading filters...</p>;

    return (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="mb-6">
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Search phones..."
                        value={filters.searchTerm}
                        onChange={(e) => handleFilterChange("searchTerm", e.target.value)}
                        className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                    <button
                        type="submit"
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Search
                    </button>
                    <button
                        type="button"
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className="px-6 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
                    >
                        {showAdvanced ? 'Hide' : 'Show'} Filters
                    </button>
                </div>
            </form>

            {/* Quick Filters */}
            <div className="flex flex-wrap gap-3 mb-6">
                <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={filters.inStock}
                        onChange={(e) => handleFilterChange("inStock", e.target.checked)}
                        className="w-4 h-4"
                    />
                    <span className="text-sm">In Stock Only</span>
                </label>
                <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={filters.onSale}
                        onChange={(e) => handleFilterChange("onSale", e.target.checked)}
                        className="w-4 h-4"
                    />
                    <span className="text-sm">On Sale</span>
                </label>

                {/* Sort */}
                <select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                    className="px-3 py-1 border rounded text-sm"
                >
                    <option value="featured">Featured</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="rating">Top Rated</option>
                    <option value="newest">Newest</option>
                    <option value="name-asc">Name A-Z</option>
                </select>
            </div>

            {/* Advanced Filters */}
            {showAdvanced && (
                <div className="border-t pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Price Range */}
                        <div>
                            <label className="block text-sm font-semibold mb-2">Price Range</label>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    placeholder="Min"
                                    value={filters.minPrice || ""}
                                    onChange={(e) => handleFilterChange("minPrice", e.target.value ? parseInt(e.target.value) : null)}
                                    className="w-1/2 px-2 py-1 border rounded text-sm"
                                />
                                <input
                                    type="number"
                                    placeholder="Max"
                                    value={filters.maxPrice || ""}
                                    onChange={(e) => handleFilterChange("maxPrice", e.target.value ? parseInt(e.target.value) : null)}
                                    className="w-1/2 px-2 py-1 border rounded text-sm"
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                Price range: ${filterOptions.priceRange.min_price} - ${filterOptions.priceRange.max_price}
                            </p>
                        </div>

                        {/* Processor */}
                        <div>
                            <label className="block text-sm font-semibold mb-2">Processor</label>
                            <select
                                value={filters.processor || ""}
                                onChange={(e) => handleFilterChange("processor", e.target.value || null)}
                                className="w-full px-2 py-1 border rounded text-sm"
                            >
                                <option value="">Any</option>
                                {filterOptions.processors.map(p => (
                                    <option key={p} value={p}>{p}</option>
                                ))}
                            </select>
                        </div>

                        {/* RAM */}
                        <div>
                            <label className="block text-sm font-semibold mb-2">Minimum RAM</label>
                            <select
                                value={filters.minRam || ""}
                                onChange={(e) => handleFilterChange("minRam", e.target.value ? parseInt(e.target.value) : null)}
                                className="w-full px-2 py-1 border rounded text-sm"
                            >
                                <option value="">Any</option>
                                {filterOptions.ram.map(r => (
                                    <option key={r} value={r}>{r}</option>
                                ))}
                            </select>
                        </div>

                        {/* Storage */}
                        <div>
                            <label className="block text-sm font-semibold mb-2">Minimum Storage</label>
                            <select
                                value={filters.minStorage || ""}
                                onChange={(e) => handleFilterChange("minStorage", e.target.value ? parseInt(e.target.value) : null)}
                                className="w-full px-2 py-1 border rounded text-sm"
                            >
                                <option value="">Any</option>
                                {filterOptions.storage.map(s => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>

                        {/* Camera */}
                        <div>
                            <label className="block text-sm font-semibold mb-2">Minimum Camera MP</label>
                            <select
                                value={filters.minCamera || ""}
                                onChange={(e) => handleFilterChange("minCamera", e.target.value ? parseInt(e.target.value) : null)}
                                className="w-full px-2 py-1 border rounded text-sm"
                            >
                                <option value="">Any</option>
                                {filterOptions.camera.map(c => (
                                    <option key={c} value={c}>{c}MP</option>
                                ))}
                            </select>
                        </div>

                        {/* Battery */}
                        <div>
                            <label className="block text-sm font-semibold mb-2">Minimum Battery (mAh)</label>
                            <select
                                value={filters.minBattery || ""}
                                onChange={(e) => handleFilterChange("minBattery", e.target.value ? parseInt(e.target.value) : null)}
                                className="w-full px-2 py-1 border rounded text-sm"
                            >
                                <option value="">Any</option>
                                {filterOptions.battery.map(b => (
                                    <option key={b} value={b}>{b}</option>
                                ))}
                            </select>
                        </div>

                        {/* Release Year */}
                        <div>
                            <label className="block text-sm font-semibold mb-2">Release Year</label>
                            <select
                                value={filters.releaseYear || ""}
                                onChange={(e) => handleFilterChange("releaseYear", e.target.value ? parseInt(e.target.value) : null)}
                                className="w-full px-2 py-1 border rounded text-sm"
                            >
                                <option value="">Any</option>
                                {filterOptions.releaseYears.map(y => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                        </div>

                        {/* Minimum Rating */}
                        <div>
                            <label className="block text-sm font-semibold mb-2">Minimum Rating</label>
                            <select
                                value={filters.minRating || ""}
                                onChange={(e) => handleFilterChange("minRating", e.target.value ? parseInt(e.target.value) : null)}
                                className="w-full px-2 py-1 border rounded text-sm"
                            >
                                <option value="">Any</option>
                                <option value="4">4+ Stars</option>
                                <option value="3">3+ Stars</option>
                                <option value="2">2+ Stars</option>
                                <option value="1">1+ Star</option>
                            </select>
                        </div>
                    </div>

                    <div className="mt-6 flex gap-3">
                        <button
                            onClick={handleSearch}
                            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                            Apply Filters
                        </button>
                        <button
                            onClick={handleReset}
                            className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
                        >
                            Reset
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdvancedFiltering;
