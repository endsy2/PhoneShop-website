import React, { useCallback, useEffect, useState } from 'react';
import { fetchProductByName, fetchProductBySpecID } from '../FetchAPI/Fetch';
import { useDispatch, useSelector } from 'react-redux';
import { removeFromCart, syncCartItem } from '../store/cart';
import { NETWORK_CONFIG } from '../network/Network_EndPoint';

const CheckoutCart = ({ items }) => {
    const [data, setData] = useState([]);
    const [error, setError] = useState(null);
    const [invalid, setInvalid] = useState(false);
    const cart = useSelector(store => store.cart.items);
    const [totalQuatity, setTotalQuantity] = useState();
    const dispatch = useDispatch();

    const handleFetchData = useCallback(async () => {
        if (!items?.productId) return;

        const extractRows = (response) => response?.data ?? response;

        try {
            // First try: treat productId as spec_id
            let productRows = extractRows(await fetchProductBySpecID({ spec_id: items.productId }));
            let usedFallback = false;

            if (!Array.isArray(productRows) || productRows.length === 0) {
                // Second try: treat productId as phone_id — fetch by name/id
                const fallbackResponse = await fetchProductByName({
                    phone_id: items.productId,
                    phone_name: items.productName,
                });
                productRows = extractRows(fallbackResponse);
                usedFallback = true;
            }

            if (Array.isArray(productRows) && productRows.length > 0) {
                const product = productRows[0];
                const resolvedPrice = product.price_discount || product.price;
                setData(productRows);
                setError(null);

                if (usedFallback && product.spec_id) {
                    // The cart had a phone_id — update it to the real spec_id
                    // Remove old entry and add corrected one
                    dispatch(removeFromCart({ productId: items.productId }));
                    dispatch(syncCartItem({
                        productId: product.spec_id,
                        productName: product.name,
                        price: resolvedPrice,
                    }));
                } else {
                    dispatch(syncCartItem({
                        productId: items.productId,
                        productName: product.name,
                        price: resolvedPrice,
                    }));
                }
            } else {
                // Item truly not found — mark as invalid
                setInvalid(true);
                setError('This item is no longer available');
            }
        } catch (err) {
            setError(`Error fetching data: ${err.message}`);
        }
    }, [items?.productId, dispatch]);

    useEffect(() => {
        handleFetchData();
        let total = 0;
        cart.forEach(item => total += item.quantity);
        setTotalQuantity(total);
    }, [handleFetchData]);

    if (invalid) {
        return (
            <div className="flex items-center justify-between py-2 opacity-50">
                <p className="text-sm text-red-500 line-through">{items?.productName} — unavailable</p>
                <button
                    type="button"
                    onClick={() => dispatch(removeFromCart({ productId: items.productId }))}
                    className="text-xs text-red-500 underline ml-2"
                >
                    Remove
                </button>
            </div>
        );
    }

    return (
        <div className='my-3'>
            {error && !invalid ? (
                <p className="text-xs text-red-400">Error: {error}</p>
            ) : (
                <>
                    {data.length > 0 ? (
                        <div className="flex items-center justify-between py-2">
                            {/* Product Image and Name */}
                            <div className="flex items-center w-[175px] gap-2">
                                <img
                                    src={`${NETWORK_CONFIG.apiBaseUrl}/${data[0].images?.split(',')[0]?.trim()?.replace(/uploads[\\/]/g, '')?.replace(/\s+/g, '')}`}
                                    className="w-12 h-12 object-cover"
                                    alt={data[0]?.name || "Product"}
                                    onError={(e) => { e.target.src = "https://via.placeholder.com/48x48?text=No+Image"; }}
                                />
                                <p className="text-sm">{data[0]?.name}</p>
                            </div>

                            {/* Quantity */}
                            <div className="text-center flex-shrink-0 w-12">
                                <p className="text-sm">{items?.quantity}</p>
                            </div>

                            {/* Price */}
                            <div className="flex flex-col items-end w-24">
                                {data[0].price_discount ? (
                                    <div className='flex items-center gap-5'>
                                        <s className="text-gray-500 text-xs">{data[0]?.price}</s>
                                        <p className="text-sm">{data[0]?.price_discount}</p>
                                    </div>
                                ) : (
                                    <p className="text-sm">{items?.price}</p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-400">Loading...</p>
                    )}
                </>
            )}
        </div>
    );
};

export default CheckoutCart;
