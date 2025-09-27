import React from 'react';

const MarketCard = ({ market }) => {
  return (
    <div className="container border p-4 rounded-lg shadow-md mt-4 bg-gray-100">
      <h3 className="font-bold text-lg text-gray-800">{market.productName}</h3>
      <p className="text-gray-600">
        <strong>Description:</strong> {market.description}
      </p>
      <p className="text-gray-700">
        <strong>Total Amount:</strong> {market.totalAmount}
      </p>

      <div className="mt-2">
        <strong className="text-gray-800">Pricing Details:</strong>
        {market.pricing && market.pricing.length > 0 ? (
          market.pricing.map((price, index) => (
            <div
              key={price._id || index}
              className="text-gray-600 border-b pb-2 mb-2"
            >
              <p>
                <strong>Currency:</strong> {price.currency}
              </p>
              {price.faceValues && price.faceValues.length > 0 ? (
                <div className="mt-1">
                  <strong>Face Values:</strong>
                  {price.faceValues.map((face, i) => (
                    <div key={i} className="ml-2 text-gray-700">
                      <p>
                        🔹 <strong>Face Value:</strong> {face.faceValue}
                      </p>
                      <p>
                        💰 <strong>Rate:</strong> {face.sellingPrice}
                      </p>
                      {face.description && (
                        <p>
                          📝 <strong>Description:</strong> {face.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No face values available</p>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-500">No pricing details available</p>
        )}
      </div>

      {market.Image && market.Image.length > 0 ? (
        <img
          src={market.Image[0]}
          alt={market.productName}
          className="mt-2 w-full h-auto rounded-lg shadow-sm"
        />
      ) : (
        <p className="text-gray-500 mt-2">No image available</p>
      )}
    </div>
  );
};

export default MarketCard;
