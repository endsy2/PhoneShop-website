import React from 'react';
import { Link } from 'react-router-dom';

const NoResults = ({ searchQuery, suggestions = [] }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 bg-white rounded-2xl border border-gray-200">
      <div className="text-center space-y-6 max-w-md">
        {/* Icon */}
        <div className="text-8xl">🔍</div>
        
        {/* Message */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">No Results Found</h2>
          {searchQuery && (
            <p className="text-gray-600">
              We couldn't find any products matching "<span className="font-semibold text-gray-900">{searchQuery}</span>"
            </p>
          )}
          <p className="text-gray-500 text-sm">
            Try adjusting your search or browse our categories
          </p>
        </div>

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-gray-700">Try searching for:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {suggestions.map((suggestion, index) => (
                <Link 
                  key={index}
                  to={`/Search?query=${suggestion}`}
                  className="px-4 py-2 bg-gray-100 hover:bg-green-100 text-gray-700 hover:text-green-700 rounded-full text-sm font-medium transition-colors"
                >
                  {suggestion}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        <Link to="/">
          <button className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
            Back to Home
          </button>
        </Link>
      </div>
    </div>
  );
};

export default NoResults;
