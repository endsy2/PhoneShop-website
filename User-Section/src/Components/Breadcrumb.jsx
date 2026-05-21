import React from 'react';
import { Link } from 'react-router-dom';

const Breadcrumb = ({ items }) => {
  return (
    <nav className="flex items-center gap-2 text-sm mb-6 px-4 md:px-0">
      <Link 
        to="/" 
        className="text-gray-600 hover:text-green-600 transition-colors font-medium"
      >
        🏠 Home
      </Link>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <span className="text-gray-400">/</span>
          {item.link && index < items.length - 1 ? (
            <Link 
              to={item.link} 
              className="text-gray-600 hover:text-green-600 transition-colors font-medium"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-900 font-semibold">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumb;
