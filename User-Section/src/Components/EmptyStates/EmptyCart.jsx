import React from 'react';
import { Link } from 'react-router-dom';

const EmptyCart = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="text-center space-y-6 max-w-md">
        {/* Icon */}
        <div className="text-8xl">🛒</div>
        
        {/* Message */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">Your Cart is Empty</h2>
          <p className="text-gray-600">
            Looks like you haven't added anything to your cart yet. Start shopping to fill it up!
          </p>
        </div>

        {/* Action Button */}
        <Link to="/">
          <button className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
            Start Shopping
          </button>
        </Link>
      </div>
    </div>
  );
};

export default EmptyCart;
