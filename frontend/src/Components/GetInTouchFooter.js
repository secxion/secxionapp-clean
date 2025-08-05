import React from 'react';
import { useNavigate } from 'react-router-dom';

const GetInTouchFooter = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/report");
  };

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-gray-200 border-gray-200 dark:border-gray-700 p-4 py-1 pb-2">
      <div className="mx-auto flex flex-col sm:flex-row items-center justify-between">
        <p className="text-gray-700 text-center sm:text-left mb-2 sm:mb-0">
          Can't find what you looking for?
        </p>
        <button
          onClick={handleClick}
          className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-1 px-4 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-opacity-75"
        >
          Get In Touch, we always online
        </button>
      </div>
    </footer>
  );
};

export default GetInTouchFooter;