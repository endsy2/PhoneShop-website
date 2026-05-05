import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { changeQuantity, removeFromCart } from '../../store/cart';
import { fetchProductByName } from '../../FetchAPI/Fetch';
import { NETWORK_CONFIG } from '../../network/Network_EndPoint';

const CartItem = ({ product }) => {
    const { productId, quantity } = product;
    const [detail, setDetail] = useState(null);
    const dispatch = useDispatch();

    const fetchProductDetail = async (id) => {
        try {
            const response = await fetchProductByName({
                phone_id: product.productId,
                phone_name: product.productName,
            });
            const productList = response?.data ?? response;
            const productDetails = Array.isArray(productList)
                ? productList.find(item => item.spec_id === id || item.phone_id === id)
                : null;
            setDetail(productDetails || null);
        } catch (error) {
            console.error('Failed to fetch product details:', error);
        }
    };

    useEffect(() => {
        fetchProductDetail(productId);
    }, [productId]);

    const handleMinusQuantity = () => {
        if (quantity > 1) {
            dispatch(changeQuantity({ productId, quantity: quantity - 1 }));
        } else {
            dispatch(removeFromCart({ productId }));
        }
    };

    const handlePlusQuantity = () => {
        dispatch(changeQuantity({ productId, quantity: quantity + 1 }));
    };

    const handleRemoveItem = () => {
        dispatch(removeFromCart({ productId }));
    };

    if (!detail) {
        return <div className='p-2 text-white'>Loading...</div>;
    }

    const rawImage = (detail.images || "").split(',')[0].trim().replace(/uploads[\\/]/g, '').replace(/\s+/g, '');
    const imageUrl = rawImage ? `${NETWORK_CONFIG.apiBaseUrl}/${rawImage}` : "https://via.placeholder.com/96x96?text=No+Image";

    return (
        <div className='flex flex-col sm:flex-row items-start sm:items-center bg-green-600 text-white p-4 border-b border-gray-700 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200'>
            <img
                src={imageUrl}
                alt={detail.name}
                className='w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg'
                onError={(e) => {
                    e.target.src = '/default-image.png'; // Fallback image if the URL fails
                }}
            />
            <div className='flex-1 ml-4 flex flex-col justify-between'>
                <div className='flex justify-between items-center mb-2'>
                    <h3 className='text-sm font-semibold'>{detail.name || 'Unknown Product'}</h3>
                    <p className='text-lg font-bold text-white'>
                        ${(detail.price_discount != null
                            ? Number(detail.price_discount)
                            : Number(detail.price)).toFixed(2)}
                    </p>
                </div>
                <div className='flex items-center gap-3'>
                    <button
                        className='bg-white  text-green-600 rounded-full p-2 hover:bg-gray-600 transition-colors duration-200'
                        onClick={handleMinusQuantity}
                    >
                        <span className='text-lg'>-</span>
                    </button>
                    <span className='text-lg font-medium'>{quantity}</span>
                    <button
                        className='bg-white  text-green-600 rounded-full p-2 hover:bg-gray-600 transition-colors duration-200'
                        onClick={handlePlusQuantity}
                    >
                        <span className='text-lg'>+</span>
                    </button>
                    <button
                        className='bg-red-600 text-white rounded-full p-2 hover:bg-red-500 transition-colors duration-200'
                        onClick={handleRemoveItem}
                    >
                        <span className='text-lg'>×</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CartItem;
