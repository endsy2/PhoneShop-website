import { useCallback, useEffect, useState } from 'react';
import { fetchProductByName, fetchProductBySpecID } from '../FetchAPI/Fetch';
import { useDispatch, useSelector } from 'react-redux';
import { removeFromCart, syncCartItem } from '../store/cart';
import ProductImage from '../Components/ProductImage';
import Price from '../Components/Price';

const CheckoutCart = ({ items }) => {
    const [data, setData] = useState([]);
    const [error, setError] = useState(null);
    const [invalid, setInvalid] = useState(false);
    const cart = useSelector(store => store.cart.items);
    const [, setTotalQuantity] = useState();
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
            <div className="flex items-center justify-between py-3 text-sm">
                <p className="text-ink-3 line-through">{items?.productName}</p>
                <button type="button" onClick={() => dispatch(removeFromCart({ productId: items.productId }))} className="text-[13px] text-danger underline underline-offset-2">
                    Remove
                </button>
            </div>
        );
    }
    if (error) return <p className="py-3 text-[13px] text-danger">{error}</p>;
    if (!data.length) return <p className="py-3 text-[13px] text-ink-3">Checking price</p>;

    const row = data[0];
    return (
        <div className="flex items-center gap-3 py-3">
            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md bg-raised">
                <ProductImage src={row.images} alt={row.name} className="h-full w-full p-1" />
            </div>
            <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-ink">{row.name}</p>
                <p className="price text-xs text-ink-3">Qty {items?.quantity}</p>
            </div>
            <Price size="sm" price={row.price_discount || row.price || items?.price} original={row.price_discount ? row.price : null} className="justify-end" />
        </div>
    );
};

export default CheckoutCart;
