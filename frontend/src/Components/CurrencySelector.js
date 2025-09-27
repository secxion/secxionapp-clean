import React from 'react';
import currencyFullNames from '../helpers/currencyFullNames';

const CurrencySelector = ({ pricing, activeCurrency, onCurrencyChange }) => {
  return (
    <div className="container bg-gray-800 dark:bg-gray-900 px-8 overflow-x-auto">
      <div className=" mx-auto flex space-x-2 md:space-x-4">
        {pricing?.map((currency) => {
          const fullCurrencyName =
            currencyFullNames[currency.currency] || currency.currency;
          return (
            <button
              key={currency.currency}
              className={`flex-shrink-0 py-2 px-3 rounded-md text-sm font-semibold transition-colors duration-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                activeCurrency?.currency === currency.currency
                  ? 'bg-emerald-500 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              onClick={() => onCurrencyChange(currency.currency)}
            >
              {fullCurrencyName}
            </button>
          );
        })}
        {pricing?.length === 0 && (
          <p className="text-gray-500 dark:text-gray-400">
            No currencies available.
          </p>
        )}
      </div>
    </div>
  );
};

export default CurrencySelector;
