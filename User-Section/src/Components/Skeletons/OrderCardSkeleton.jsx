import React from 'react';

const OrderCardSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 animate-pulse">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded w-20"></div>
          <div className="h-6 bg-gray-200 rounded w-32"></div>
        </div>
        <div className="h-8 bg-gray-200 rounded-full w-24"></div>
      </div>

      {/* Status Tracker */}
      <div className="flex items-center justify-between my-6 p-4 bg-gray-50 rounded-xl">
        {[1, 2, 3, 4].map((_, index) => (
          <div key={index} className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
            <div className="h-3 bg-gray-200 rounded w-16"></div>
          </div>
        ))}
      </div>

      {/* Details */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        {[1, 2, 3].map((_, index) => (
          <div key={index} className="space-y-2">
            <div className="h-3 bg-gray-200 rounded w-16"></div>
            <div className="h-5 bg-gray-200 rounded w-full"></div>
          </div>
        ))}
      </div>

      {/* Item Preview */}
      <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl mb-4">
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="h-8 bg-gray-200 rounded-full w-16"></div>
      </div>

      {/* Button */}
      <div className="flex justify-end">
        <div className="h-10 bg-gray-200 rounded-xl w-32"></div>
      </div>
    </div>
  );
};

export const OrderListSkeleton = ({ count = 3 }) => {
  return (
    <div className="space-y-4">
      {[...Array(count)].map((_, index) => (
        <OrderCardSkeleton key={index} />
      ))}
    </div>
  );
};

export default OrderCardSkeleton;
